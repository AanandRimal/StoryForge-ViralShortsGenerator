#!/usr/bin/env python3
"""CLI — reads JSON from stdin, fetches Pexels clips, prints visuals manifest."""

import json
import os
import sys

# Ensure backend/worker/visuals is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv()

from visuals import fetch_visuals  # noqa: E402


def main() -> None:
    payload = json.load(sys.stdin)
    result = fetch_visuals(payload)
    print(json.dumps(result))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
