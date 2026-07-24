import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
async def list_notes(
    resolved: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Note).order_by(Note.created_at.desc())
    if resolved is not None:
        stmt = stmt.where(Note.resolved == resolved)
    result = await db.execute(stmt)
    notes = result.scalars().all()
    return [
        NoteRead(
            id=n.id,
            text=n.text,
            due_hint=n.due_hint,
            resolved=n.resolved,
            linked_event_id=n.linked_event_id,
            created_at=n.created_at.isoformat(),
        )
        for n in notes
    ]


@router.post("", response_model=NoteRead, status_code=201)
async def create_note(data: NoteCreate, db: AsyncSession = Depends(get_db)):
    note = Note(
        id=str(uuid.uuid4()),
        text=data.text,
        due_hint=data.due_hint,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return NoteRead(
        id=note.id,
        text=note.text,
        due_hint=note.due_hint,
        resolved=note.resolved,
        linked_event_id=note.linked_event_id,
        created_at=note.created_at.isoformat(),
    )


@router.patch("/{note_id}", response_model=NoteRead)
async def update_note(note_id: str, data: NoteUpdate, db: AsyncSession = Depends(get_db)):
    note = await db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    await db.commit()
    await db.refresh(note)
    return NoteRead(
        id=note.id,
        text=note.text,
        due_hint=note.due_hint,
        resolved=note.resolved,
        linked_event_id=note.linked_event_id,
        created_at=note.created_at.isoformat(),
    )


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str, db: AsyncSession = Depends(get_db)):
    note = await db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
