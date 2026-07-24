import json
import re
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.event import Event
from app.models.generation import GeneratedWeek, ProposedEvent
from app.models.routine import Routine
from app.models.note import Note
from app.services.ai.client import get_llm_client


async def generate_week(routine_ids: list[str], week_start: str, db: AsyncSession) -> GeneratedWeek:
    result = await db.execute(select(Routine).where(Routine.id.in_(routine_ids)))
    routines = result.scalars().all()

    if not routines:
        raise ValueError("No valid routines found")

    # Load existing events for the week to avoid conflicts
    week_end = (datetime.fromisoformat(week_start) + timedelta(days=7)).isoformat()
    existing_result = await db.execute(
        select(Event).where(
            and_(Event.start >= week_start, Event.start < week_end)
        )
    )
    existing_events = existing_result.scalars().all()

    # Load unresolved quick notes
    notes_result = await db.execute(
        select(Note).where(Note.resolved == False)
    )
    notes = notes_result.scalars().all()

    llm = get_llm_client()
    prompt = _build_prompt(routines, week_start, existing_events, notes)
    response = await llm.generate(prompt)

    proposed_events = _parse_ai_response(response, routines)

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

    # Re-fetch with eager-loaded events to avoid lazy-load outside session
    result = await db.execute(
        select(GeneratedWeek)
        .options(selectinload(GeneratedWeek.events))
        .where(GeneratedWeek.id == week.id)
    )
    return result.scalar_one()


async def confirm_week(week: GeneratedWeek, db: AsyncSession) -> list[Event]:
    """Push confirmed proposed events into the main events table."""
    created_events = []
    for pe in week.events:
        event = Event(
            id=str(uuid.uuid4()),
            title=pe.title,
            start=datetime.fromisoformat(pe.start),
            end=datetime.fromisoformat(pe.end),
            source="generated",
            notes=f"Generated from routine {pe.routine_id}",
        )
        db.add(event)
        created_events.append(event)

    week.status = "confirmed"
    await db.commit()
    return created_events


def _build_prompt(routines: list[Routine], week_start: str, existing_events: list[Event], notes: list | None = None) -> str:
    week_start_dt = datetime.fromisoformat(week_start)
    days = [(week_start_dt + timedelta(days=i)).strftime("%A %Y-%m-%d") for i in range(7)]
    days_text = ", ".join(days)

    routine_blocks = []
    for r in routines:
        constraints_text = ""
        if r.constraints:
            c = r.constraints
            if c.get("earliest_start"):
                constraints_text += f" not before {c['earliest_start']}"
            if c.get("latest_end"):
                constraints_text += f" not after {c['latest_end']}"
            if c.get("preferred_days"):
                day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                preferred = [day_names[d] for d in c["preferred_days"] if d < 7]
                constraints_text += f" preferred days: {', '.join(preferred)}"
            if c.get("exclude_days"):
                day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                excluded = [day_names[d] for d in c["exclude_days"] if d < 7]
                constraints_text += f" excluded days: {', '.join(excluded)}"

        routine_blocks.append(
            f'  {{"id": "{r.id}", "name": "{r.name}", '
            f'"sessions_per_week": {r.frequency_per_week}, '
            f'"duration_minutes": {r.duration_minutes}, '
            f'"priority": "{r.priority}"{", constraints: " + constraints_text if constraints_text else ""}}}'
        )
    routines_json = "\n".join(routine_blocks)

    blocked_slots = ""
    if existing_events:
        slots = []
        for e in existing_events:
            slots.append(f"  {e.start} to {e.end} — {e.title}")
        blocked_slots = "\n".join(slots)
    else:
        blocked_slots = "  (none — the week is currently empty)"

    notes_section = ""
    if notes:
        note_lines = []
        for n in notes:
            hint = f" (hint: {n.due_hint})" if n.due_hint else ""
            note_lines.append(f"  - {n.text}{hint}")
        notes_section = f"""

QUICK NOTES (one-off items to also schedule this week):
{chr(10).join(note_lines)}
- For each note, create an appropriate event with a reasonable duration (30-60 min unless context suggests otherwise)
- Use "note" as the routine_id for note-derived events"""

    return f"""You are a scheduling assistant. Generate a weekly schedule.

WEEK: {days_text}

ROUTINES TO SCHEDULE:
{routines_json}

ALREADY BLOCKED TIME SLOTS (do NOT overlap with these):
{blocked_slots}{notes_section}

RULES:
- Schedule each routine exactly the number of sessions_per_week specified
- Each session lasts exactly duration_minutes
- Never overlap events with each other or with blocked slots
- Spread sessions across different days when possible
- Schedule between 07:00 and 22:00 unless constraints say otherwise
- Use ISO 8601 datetime format: YYYY-MM-DDTHH:MM:SS

Return ONLY a JSON array, no explanation, no markdown. Each element:
{{"routine_id": "...", "title": "...", "start": "YYYY-MM-DDTHH:MM:SS", "end": "YYYY-MM-DDTHH:MM:SS"}}"""


def _parse_ai_response(response: str, routines: list[Routine]) -> list[dict]:
    """Extract and validate JSON events from LLM response."""
    routine_map = {r.id: r for r in routines}

    # Try direct JSON parse first
    events = None
    try:
        events = json.loads(response.strip())
    except json.JSONDecodeError:
        pass

    # Try extracting JSON array from markdown/text
    if events is None:
        match = re.search(r'\[.*\]', response, re.DOTALL)
        if match:
            try:
                events = json.loads(match.group())
            except json.JSONDecodeError:
                pass

    if not events or not isinstance(events, list):
        raise ValueError(f"Failed to parse AI response as JSON array. Raw response:\n{response[:500]}")

    parsed = []
    for event in events:
        routine_id = event.get("routine_id", "")
        title = event.get("title", "Untitled")
        start = event.get("start", "")
        end = event.get("end", "")

        if not start or not end:
            continue

        # Validate the datetime strings parse correctly
        try:
            datetime.fromisoformat(start)
            datetime.fromisoformat(end)
        except ValueError:
            continue

        parsed.append({
            "routine_id": routine_id,
            "title": title,
            "start": start,
            "end": end,
            "editable": True,
        })

    if not parsed:
        raise ValueError("AI response contained no valid events")

    return parsed
