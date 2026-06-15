#!/usr/bin/env python3
"""CLI — reads JSON from stdin, renders final 1080×1920 mp4, prints result JSON."""

import json
import sys

from dotenv import load_dotenv

load_dotenv()

from render import render_video  # noqa: E402


def main() -> None:
    payload = json.load(sys.stdin)
    result = render_video(payload)
    print(json.dumps(result))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
