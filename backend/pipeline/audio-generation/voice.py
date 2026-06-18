"""TTS synthesis — Google Cloud primary, edge-tts fallback."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

SPEAKING_RATE = 0.90

# Google voice ID → edge-tts neural voice
EDGE_FALLBACK: dict[str, str] = {
    "ne-NP-Standard-A": "ne-NP-HemkalaNeural",
    "ne-NP-Standard-B": "ne-NP-SagarNeural",
    "hi-IN-Neural2-C": "hi-IN-MadhurNeural",
    "hi-IN-Neural2-D": "hi-IN-SwaraNeural",
    "hi-IN-Wavenet-B": "hi-IN-MadhurNeural",
}


def _language_code(voice_id: str) -> str:
    parts = voice_id.split("-")
    if len(parts) >= 2:
        return f"{parts[0]}-{parts[1]}"
    return "ne-NP"


def _edge_voice(google_voice_id: str) -> str:
    if google_voice_id in EDGE_FALLBACK:
        return EDGE_FALLBACK[google_voice_id]
    lang = _language_code(google_voice_id)
    if lang.startswith("hi"):
        return "hi-IN-SwaraNeural"
    return "ne-NP-HemkalaNeural"


def synthesize_google(
    text: str,
    voice_id: str,
    output_path: str,
    speaking_rate: float = SPEAKING_RATE,
) -> None:
    from google.cloud import texttospeech

    creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds or not Path(creds).exists():
        raise RuntimeError("GOOGLE_APPLICATION_CREDENTIALS not configured")

    client = texttospeech.TextToSpeechClient()

    response = client.synthesize_speech(
        input=texttospeech.SynthesisInput(text=text),
        voice=texttospeech.VoiceSelectionParams(
            language_code=_language_code(voice_id),
            name=voice_id,
        ),
        audio_config=texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate,
        ),
    )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(response.audio_content)


async def _synthesize_edge_async(text: str, voice_id: str, output_path: str) -> None:
    import edge_tts

    # ~0.9 speaking rate ≈ -10% in edge-tts
    communicate = edge_tts.Communicate(text, voice_id, rate="-10%")
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    await communicate.save(output_path)


def synthesize_edge(text: str, voice_id: str, output_path: str) -> None:
    asyncio.run(_synthesize_edge_async(text, voice_id, output_path))


def synthesize_voice(
    text: str,
    voice_id: str,
    output_path: str,
    speaking_rate: float = SPEAKING_RATE,
) -> dict:
    errors: list[str] = []

    try:
        synthesize_google(text, voice_id, output_path, speaking_rate)
        return {"provider": "google", "path": output_path, "voice_id": voice_id}
    except Exception as exc:
        errors.append(f"google: {exc}")

    edge_voice = _edge_voice(voice_id)
    try:
        synthesize_edge(text, edge_voice, output_path)
        return {
            "provider": "edge",
            "path": output_path,
            "voice_id": voice_id,
            "edge_voice": edge_voice,
            "fallback_errors": errors,
        }
    except Exception as exc:
        errors.append(f"edge: {exc}")
        raise RuntimeError("; ".join(errors)) from exc
