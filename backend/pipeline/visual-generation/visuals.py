"""Pexels fetch + FFmpeg scene processing for Phase 4 visual pipeline."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

NICHE_MODIFIERS: dict[str, str] = {
    "power-control": "dark",
    "love-attraction": "warm",
    "money-wealth": "luxury",
    "untold-history": "ancient",
    "dark-psychology": "shadow",
    "culture-identity": "cultural",
    "fear-danger": "dark urban",
    "mystery-conspiracy": "mysterious",
    "conflict-competition": "corporate",
    "happiness-meaning": "peaceful",
    "economic-anxiety": "urban",
    "biography-power": "luxury dark",
    "hidden-knowledge": "ancient library",
    "social-psychology": "crowd",
    "stoicism-wisdom": "mountain peaceful",
}

NICHE_COLOR_GRADES: dict[str, str] = {
    "power-control": "eq=contrast=1.3:brightness=-0.05:saturation=0.6,vignette=PI/4",
    "love-attraction": "eq=contrast=1.1:brightness=0.03:saturation=1.3:gamma_r=1.05:gamma_b=0.95",
    "money-wealth": "eq=contrast=1.25:brightness=-0.02:saturation=0.75:gamma_g=1.05",
    "untold-history": "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=brightness=-0.05",
    "dark-psychology": "eq=contrast=1.4:brightness=-0.08:saturation=0.5,vignette=PI/3.5",
    "culture-identity": "eq=contrast=1.1:brightness=0.05:saturation=1.25",
    "fear-danger": "eq=contrast=1.45:brightness=-0.06:saturation=0.55,vignette=PI/3",
    "mystery-conspiracy": "eq=contrast=1.2:brightness=-0.12:saturation=0.45,vignette=PI/3",
    "conflict-competition": "eq=contrast=1.3:brightness=0:saturation=1.2",
    "happiness-meaning": "eq=contrast=1.05:brightness=0.06:saturation=1.15",
    "economic-anxiety": "eq=contrast=1.15:brightness=-0.02:saturation=0.85",
    "biography-power": "eq=contrast=1.25:brightness=-0.04:saturation=0.8,vignette=PI/4",
    "hidden-knowledge": "eq=contrast=1.15:brightness=-0.03:saturation=0.7,vignette=PI/5",
    "social-psychology": "eq=contrast=1.1:brightness=0.02:saturation=1.1",
    "stoicism-wisdom": "eq=contrast=1.05:brightness=0.04:saturation=0.9:gamma_r=1.03",
}


def ffmpeg_bin() -> str:
    path = os.environ.get("FFMPEG_PATH", "").strip()
    if not path:
        raise RuntimeError("FFMPEG_PATH is not set")
    return path


def build_search_query(keyword: str, niche_slug: str) -> str:
    modifier = NICHE_MODIFIERS.get(niche_slug, "cinematic")
    return f"{keyword} {modifier}".strip()


def search_pexels(query: str, min_duration: float) -> dict[str, Any] | None:
    api_key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("PEXELS_API_KEY is not set")

    response = requests.get(
        "https://api.pexels.com/videos/search",
        headers={"Authorization": api_key},
        params={
            "query": query,
            "orientation": "portrait",
            "size": "medium",
            "per_page": 15,
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    for video in data.get("videos", []):
        if video.get("duration", 0) < min_duration:
            continue
        files = video.get("video_files", [])
        portrait = [f for f in files if f.get("height", 0) >= f.get("width", 0) and f.get("link")]
        if not portrait:
            continue
        sd = next(
            (f for f in portrait if f.get("quality") == "sd" or f.get("width", 9999) <= 960),
            None,
        )
        chosen = sd or sorted(portrait, key=lambda f: f["width"] * f["height"])[0]
        return {"id": video["id"], "url": chosen["link"], "duration": video["duration"]}
    return None


def download_file(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)


def run_ffmpeg(args: list[str]) -> None:
    result = subprocess.run(
        [ffmpeg_bin(), *args],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"ffmpeg failed ({result.returncode})")


def process_clip(input_path: Path, output_path: Path, duration: float, color_grade: str | None) -> None:
    base = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
    vf = f"{base},{color_grade}" if color_grade else base
    run_ffmpeg([
        "-y", "-i", str(input_path), "-t", str(duration), "-vf", vf,
        "-an", "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "30",
        str(output_path),
    ])


def fetch_scene_pexels(
    scene: dict[str, Any],
    niche_slug: str,
    work_dir: Path,
    video_id: str,
    color_grade: str | None,
) -> dict[str, Any]:
    keyword = scene["visual_keyword"]
    duration = float(scene["duration_seconds"])
    scene_num = int(scene["scene_number"])
    search_query = build_search_query(keyword, niche_slug)

    result = search_pexels(search_query, duration)
    if not result:
        result = search_pexels(keyword, min(duration, 5))
    if not result:
        raise RuntimeError(f'No Pexels video found for "{keyword}"')

    raw_path = work_dir / f"scene_{scene_num}_raw.mp4"
    out_name = f"scene_{scene_num:02d}.mp4"
    out_path = work_dir / out_name

    download_file(result["url"], raw_path)
    process_clip(raw_path, out_path, duration, color_grade)
    raw_path.unlink(missing_ok=True)

    return {
        "scene_number": scene_num,
        "keyword": keyword,
        "search_query": search_query,
        "source": "pexels",
        "clip_path": f"/outputs/visuals/{video_id}/{out_name}",
        "duration_seconds": duration,
        "pexels_id": result["id"],
    }


def fetch_visuals(payload: dict[str, Any]) -> dict[str, Any]:
    video_id = payload["video_id"]
    niche_slug = payload["niche_slug"]
    style = payload.get("style", "PEXELS")
    scenes = payload["scenes"]

    output_root = Path(os.environ.get("VIDEO_OUTPUT_DIR", "public/outputs"))
    work_dir = output_root / "visuals" / video_id
    work_dir.mkdir(parents=True, exist_ok=True)

    color_grade = NICHE_COLOR_GRADES.get(niche_slug)
    manifest_scenes = []

    for scene in scenes:
        try:
            visual = fetch_scene_pexels(scene, niche_slug, work_dir, video_id, color_grade)
        except Exception as exc:
            if style != "MIXED":
                raise
            # Mixed mode: retry with simpler keyword only (Replicate optional later)
            print(f"Pexels failed scene {scene['scene_number']}: {exc}", file=sys.stderr)
            result = search_pexels(scene["visual_keyword"], min(float(scene["duration_seconds"]), 5))
            if not result:
                raise
            raw_path = work_dir / f"scene_{scene['scene_number']}_raw.mp4"
            out_name = f"scene_{int(scene['scene_number']):02d}.mp4"
            out_path = work_dir / out_name
            download_file(result["url"], raw_path)
            process_clip(raw_path, out_path, float(scene["duration_seconds"]), color_grade)
            raw_path.unlink(missing_ok=True)
            visual = {
                "scene_number": scene["scene_number"],
                "keyword": scene["visual_keyword"],
                "search_query": scene["visual_keyword"],
                "source": "pexels",
                "clip_path": f"/outputs/visuals/{video_id}/{out_name}",
                "duration_seconds": scene["duration_seconds"],
                "pexels_id": result["id"],
            }
        manifest_scenes.append(visual)

    from datetime import datetime, timezone

    return {
        "style": style,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "scenes": manifest_scenes,
    }
