import httpx
import json

print("Testing week generation...")
try:
    r = httpx.post(
        "http://127.0.0.1:8000/api/generation",
        json={"routine_ids": ["bb451d3f-23bd-45a3-b0ec-9b4d842aa0eb"], "week_start": "2026-07-27"},
        timeout=300,
    )
    print(f"Status: {r.status_code}")
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
