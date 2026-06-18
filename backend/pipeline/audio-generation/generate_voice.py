#!/usr/bin/env python3
"""CLI entry — reads JSON from stdin, writes MP3, prints result JSON to stdout."""

import json
import os
import sys

# Ensure backend/worker/voice is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv()

from voice import synthesize_voice  # noqa: E402


def main() -> None:
    data = json.load(sys.stdin)
    text = data.get("text", "").strip()
    voice_id = data.get("voice_id", "ne-NP-Standard-B")
    output_path = data["output_path"]
    speaking_rate = float(data.get("speaking_rate", 0.9))

    if not text:
        print(json.dumps({"error": "text is required"}), file=sys.stderr)
        sys.exit(1)

    if data.get("edge_only"):
        from voice import synthesize_edge, _edge_voice

        edge_voice = _edge_voice(voice_id)
        synthesize_edge(text, edge_voice, output_path)
        result = {"provider": "edge", "path": output_path, "edge_voice": edge_voice}
    else:
        result = synthesize_voice(text, voice_id, output_path, speaking_rate)
    print(json.dumps(result))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
