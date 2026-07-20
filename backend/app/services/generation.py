import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generation import GeneratedWeek, ProposedEvent
from app.models.routine import Routine
from app.services.ai.client import get_llm_client


async def generate_week(routine_ids: list[str], week_start: str, db: AsyncSession) -> GeneratedWeek:
    # Load selected routines
    result = await db.execute(select(Routine).where(Routine.id.in_(routine_ids)))
    routines = result.scalars().all()

    if not routines:
        raise ValueError("No valid routines found")

    # Build prompt context
    llm = get_llm_client()
    prompt = _build_prompt(routines, week_start)
    response = await llm.generate(prompt)

    # Parse AI response into proposed events
    proposed_events = _parse_ai_response(response, routine_ids)

    # Persist
    week = GeneratedWeek(
        id=str(uuid.uuid4()),
        week_start=week_start,
        status="reviewing",
        created_at=datetime.utcnow(),
    )
    for event_data in proposed_events:
        event = ProposedEvent(
            id=str(uuid.uuid4()),
            generated_week_id=week.id,
            **event_data,
        )
        week.events.append(event)

    db.add(week)
    await db.commit()
    await db.refresh(week)
    return week


def _build_prompt(routines: list[Routine], week_start: str) -> str:
    routine_descriptions = []
    for r in routines:
        routine_descriptions.append(
            f"- {r.name} ({r.life_area}): {r.frequency_per_week}x/week, "
            f"{r.duration_minutes}min each, priority={r.priority}, "
            f"constraints={r.constraints}"
        )
    routines_text = "\n".join(routine_descriptions)
    return (
        f"Generate a weekly schedule starting {week_start} for these routines:\n"
        f"{routines_text}\n\n"
        "Return a JSON array of events with fields: routine_id, title, start (ISO), end (ISO).\n"
        "Do not overlap events. Respect time constraints."
    )


def _parse_ai_response(response: str, routine_ids: list[str]) -> list[dict]:
    """Parse AI JSON response into event dicts. Placeholder implementation."""
    import json

    try:
        events = json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        if "```" in response:
            start = response.find("[")
            end = response.rfind("]") + 1
            if start != -1 and end > start:
                events = json.loads(response[start:end])
            else:
                return []
        else:
            return []

    parsed = []
    for event in events:
        parsed.append({
            "routine_id": event.get("routine_id", routine_ids[0] if routine_ids else ""),
            "title": event.get("title", "Untitled"),
            "start": event.get("start", ""),
            "end": event.get("end", ""),
            "editable": True,
        })
    return parsed
