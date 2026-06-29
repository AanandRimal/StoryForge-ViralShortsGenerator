"""FFmpeg final render — concat scene clips, voiceover, Devanagari ASS captions."""

from __future__ import annotations

import os
import re
import subprocess
import textwrap
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from visuals import NICHE_COLOR_GRADES, ffmpeg_bin, run_ffmpeg

load_dotenv()

FPS = 30
FONT_NAME = "Noto Sans Devanagari"
WORDS_PER_CAPTION = 1
MIN_CAPTION_SECONDS = 0.28
WORDS_PER_WINDOW = 5


def output_root() -> Path:
    return Path(os.environ.get("VIDEO_OUTPUT_DIR", "public/outputs"))


def temp_root() -> Path:
    return Path(os.environ.get("VIDEO_TEMP_DIR", "/tmp/storyforge"))


def fonts_dir() -> Path:
    explicit = os.environ.get("STORYFORGE_FONTS_DIR", "").strip()
    if explicit:
        return Path(explicit)
    fontconfig = os.environ.get("FONTCONFIG_FILE", "").strip()
    if fontconfig:
        return Path(fontconfig).parent
    return Path(__file__).resolve().parent.parent / "fonts"


def ffprobe_bin() -> str:
    path = os.environ.get("FFPROBE_PATH", "").strip()
    if path:
        return path
    return "ffprobe"


def public_to_abs(public_path: str) -> Path:
    # Paths stored as "/outputs/..." are relative to output_root, not filesystem root.
    # Real absolute paths (e.g. audio stored as full /home/... path) are returned as-is.
    if public_path.startswith("/outputs/"):
        return output_root() / public_path.removeprefix("/outputs/")
    return Path(public_path)


def probe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            ffprobe_bin(),
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "ffprobe failed")
    return float(result.stdout.strip())


def ass_timestamp(seconds: float) -> str:
    total_cs = max(0, int(round(seconds * 100)))
    cs = total_cs % 100
    total_s = total_cs // 100
    s = total_s % 60
    total_m = total_s // 60
    m = total_m % 60
    h = total_m // 60
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def hex_to_ass_color(hex_color: str) -> str:
    cleaned = hex_color.strip().lstrip("#")
    if len(cleaned) != 6:
        return "&H00FFFFFF"
    r = int(cleaned[0:2], 16)
    g = int(cleaned[2:4], 16)
    b = int(cleaned[4:6], 16)
    return f"&H00{b:02X}{g:02X}{r:02X}"


def escape_ass_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")


def chunk_words(text: str, size: int = WORDS_PER_CAPTION) -> list[str]:
    words = [w for w in re.split(r"\s+", text.strip()) if w]
    if not words:
        return []
    return [
        " ".join(words[i : i + size])
        for i in range(0, len(words), size)
    ]


def word_weight(word: str) -> float:
    return float(max(len(word.strip()), 1))


def build_caption_timeline(
    scenes: list[dict[str, Any]],
    audio_duration: float,
    words_per_group: int = WORDS_PER_CAPTION,
) -> list[tuple[float, float, str]]:
    """Map caption groups across the full voiceover duration, weighted by text length."""
    weighted_words: list[tuple[str, float]] = []
    for scene in sorted(scenes, key=lambda s: int(s["scene_number"])):
        for word in chunk_words(str(scene.get("text", "")), size=1):
            weighted_words.append((word, word_weight(word)))

    if not weighted_words or audio_duration <= 0:
        return []

    groups: list[tuple[str, float]] = []
    for index in range(0, len(weighted_words), words_per_group):
        chunk = weighted_words[index : index + words_per_group]
        groups.append((
            " ".join(word for word, _ in chunk),
            sum(weight for _, weight in chunk),
        ))

    total_weight = sum(weight for _, weight in groups)
    if total_weight <= 0:
        return []

    raw_durations = [
        max((weight / total_weight) * audio_duration, MIN_CAPTION_SECONDS)
        for _, weight in groups
    ]
    duration_sum = sum(raw_durations)
    scale = audio_duration / duration_sum if duration_sum > 0 else 1.0

    timeline: list[tuple[float, float, str]] = []
    elapsed = 0.0
    for (text, _), raw_duration in zip(groups, raw_durations):
        duration = raw_duration * scale
        timeline.append((elapsed, elapsed + duration, text))
        elapsed += duration

    if timeline:
        # Guarantee the last caption ends exactly with the voiceover.
        start, _, last_text = timeline[-1]
        timeline[-1] = (start, audio_duration, last_text)

    return timeline


def build_ass_file(
    path: Path,
    scenes: list[dict[str, Any]],
    caption_color: str,
    audio_duration: float,
) -> None:
    primary = hex_to_ass_color(caption_color)
    header = textwrap.dedent(
        f"""\
        [Script Info]
        ScriptType: v4.00+
        PlayResX: 1080
        PlayResY: 1920
        WrapStyle: 0

        [V4+ Styles]
        Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
        Style: Caption,{FONT_NAME},80,{primary},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,192,1

        [Events]
        Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text

        """
    )

    dialogue_lines: list[str] = []
    
    # Get the word-by-word timeline
    word_timeline = build_caption_timeline(scenes, audio_duration, words_per_group=1)

    if word_timeline:
        for i in range(0, len(word_timeline), WORDS_PER_WINDOW):
            chunk = word_timeline[i : i + WORDS_PER_WINDOW]
            for j in range(len(chunk)):
                current_word_start, current_word_end, _ = chunk[j]
                
                parts = []
                for k in range(j + 1):
                    start_k, end_k, word_k = chunk[k]
                    escaped_word = escape_ass_text(word_k)
                    if k == j:
                        # Highlight active word in green, bold, and pop animation
                        parts.append(
                            f"{{\\c&H0000FF00&\\b1\\fscx115\\fscy115\\t(0,80,\\fscx100\\fscy100)}}{escaped_word}{{\\r}}"
                        )
                    else:
                        parts.append(escaped_word)
                
                text = " ".join(parts)
                dialogue_lines.append(
                    f"Dialogue: 0,{ass_timestamp(current_word_start)},{ass_timestamp(current_word_end)},Caption,,0,0,0,,{text}\n"
                )

    path.write_text(header + "".join(dialogue_lines), encoding="utf-8")


def apply_zoompan(
    input_path: Path,
    output_path: Path,
    duration: float,
    niche_slug: str,
) -> None:
    frames = max(1, int(round(duration * FPS)))
    color_grade = NICHE_COLOR_GRADES.get(niche_slug)
    zoom = (
        f"zoompan=z='min(zoom+0.0008,1.2)':d={frames}"
        ":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"
    )
    base = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
    vf = f"{base},{zoom}"
    if color_grade:
        vf = f"{vf},{color_grade}"

    run_ffmpeg([
        "-y",
        "-i",
        str(input_path),
        "-t",
        str(duration),
        "-vf",
        vf,
        "-an",
        "-c:v",
        "libx264",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-r",
        str(FPS),
        str(output_path),
    ])


def concat_clips(clip_paths: list[Path], output_path: Path) -> None:
    list_path = output_path.with_suffix(".txt")
    list_path.write_text(
        "\n".join(f"file '{path.resolve()}'" for path in clip_paths),
        encoding="utf-8",
    )
    run_ffmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_path),
        "-c",
        "copy",
        str(output_path),
    ])
    list_path.unlink(missing_ok=True)


def mux_with_audio_and_captions(
    video_path: Path,
    audio_path: Path,
    ass_path: Path,
    output_path: Path,
) -> None:
    fonts = fonts_dir()
    ass_filter = f"ass={ass_path}:fontsdir={fonts}"
    env = os.environ.copy()
    fontconfig = os.environ.get("FONTCONFIG_FILE", "").strip()
    if fontconfig:
        env["FONTCONFIG_FILE"] = fontconfig

    result = subprocess.run(
        [
            ffmpeg_bin(),
            "-y",
            "-i",
            str(video_path),
            "-i",
            str(audio_path),
            "-vf",
            ass_filter,
            "-c:v",
            "libx264",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-r",
            str(FPS),
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(output_path),
        ],
        capture_output=True,
        text=True,
        env=env,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"ffmpeg mux failed ({result.returncode})")


def extract_thumbnail(video_path: Path, thumb_path: Path) -> None:
    run_ffmpeg([
        "-y",
        "-ss",
        "1",
        "-i",
        str(video_path),
        "-vframes",
        "1",
        "-q:v",
        "2",
        str(thumb_path),
    ])


def render_video(payload: dict[str, Any]) -> dict[str, Any]:
    video_id = payload["video_id"]
    niche_slug = payload["niche_slug"]
    caption_color = payload.get("caption_color", "#FFFFFF")
    audio_path = public_to_abs(payload["audio_path"])
    script_scenes = payload["script_scenes"]
    visual_scenes = payload["visual_scenes"]

    if not audio_path.is_file():
        raise RuntimeError(f"Audio file not found: {audio_path}")

    audio_duration = probe_duration(audio_path)
    script_total = sum(float(scene["duration_seconds"]) for scene in script_scenes)
    if script_total <= 0:
        raise RuntimeError("Script scenes have no duration")
    duration_scale = audio_duration / script_total

    visual_by_num = {int(v["scene_number"]): v for v in visual_scenes}
    work_dir = temp_root() / video_id
    work_dir.mkdir(parents=True, exist_ok=True)

    zoomed_clips: list[Path] = []
    for scene in sorted(script_scenes, key=lambda s: int(s["scene_number"])):
        scene_num = int(scene["scene_number"])
        visual = visual_by_num.get(scene_num)
        if not visual:
            raise RuntimeError(f"Missing visual for scene {scene_num}")

        clip_path = public_to_abs(visual["clip_path"])
        if not clip_path.is_file():
            raise RuntimeError(f"Scene clip not found: {clip_path}")

        duration = float(scene["duration_seconds"]) * duration_scale
        zoomed = work_dir / f"scene_{scene_num:02d}_zoom.mp4"
        apply_zoompan(clip_path, zoomed, duration, niche_slug)
        zoomed_clips.append(zoomed)

    concat_path = work_dir / "concat_silent.mp4"
    concat_clips(zoomed_clips, concat_path)

    ass_path = work_dir / "captions.ass"
    build_ass_file(ass_path, script_scenes, caption_color, audio_duration)

    video_dir = output_root() / "video"
    video_dir.mkdir(parents=True, exist_ok=True)
    final_path = video_dir / f"{video_id}.mp4"
    thumb_path = video_dir / f"{video_id}_thumb.jpg"

    mux_with_audio_and_captions(concat_path, audio_path, ass_path, final_path)
    extract_thumbnail(final_path, thumb_path)

    return {
        "video_path": f"/outputs/video/{video_id}.mp4",
        "thumbnail_path": f"/outputs/video/{video_id}_thumb.jpg",
        "duration_seconds": probe_duration(final_path),
    }
