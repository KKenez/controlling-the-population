import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.quest import Quest
from app.schemas.quest import QuestCreate, QuestRead, QuestUpdate

router = APIRouter(prefix="/api/quests", tags=["quests"])

VALID_STATUSES = {"backlog", "active", "paused", "completed"}


@router.get("", response_model=list[QuestRead])
async def list_quests(
    status: str | None = None,
    life_area_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Quest)
    if status:
        stmt = stmt.where(Quest.status == status)
    if life_area_id:
        stmt = stmt.where(Quest.life_area_id == life_area_id)
    result = await db.execute(stmt)
    quests = result.scalars().all()
    return [
        QuestRead(
            id=q.id,
            name=q.name,
            description=q.description,
            life_area_id=q.life_area_id,
            status=q.status,
            done_when=q.done_when,
            estimated_sessions=q.estimated_sessions,
            duration_minutes=q.duration_minutes,
            created_at=q.created_at.isoformat(),
            completed_at=q.completed_at.isoformat() if q.completed_at else None,
        )
        for q in quests
    ]


@router.get("/{quest_id}", response_model=QuestRead)
async def get_quest(quest_id: str, db: AsyncSession = Depends(get_db)):
    quest = await db.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        life_area_id=quest.life_area_id,
        status=quest.status,
        done_when=quest.done_when,
        estimated_sessions=quest.estimated_sessions,
        duration_minutes=quest.duration_minutes,
        created_at=quest.created_at.isoformat(),
        completed_at=quest.completed_at.isoformat() if quest.completed_at else None,
    )


@router.post("", response_model=QuestRead, status_code=201)
async def create_quest(data: QuestCreate, db: AsyncSession = Depends(get_db)):
    if data.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status: {data.status}")
    quest = Quest(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        life_area_id=data.life_area_id,
        status=data.status,
        done_when=data.done_when,
        estimated_sessions=data.estimated_sessions,
        duration_minutes=data.duration_minutes,
    )
    db.add(quest)
    await db.commit()
    await db.refresh(quest)
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        life_area_id=quest.life_area_id,
        status=quest.status,
        done_when=quest.done_when,
        estimated_sessions=quest.estimated_sessions,
        duration_minutes=quest.duration_minutes,
        created_at=quest.created_at.isoformat(),
        completed_at=None,
    )


@router.patch("/{quest_id}", response_model=QuestRead)
async def update_quest(quest_id: str, data: QuestUpdate, db: AsyncSession = Depends(get_db)):
    quest = await db.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        if update_data["status"] not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail=f"Invalid status: {update_data['status']}")
        if update_data["status"] == "completed":
            quest.completed_at = datetime.utcnow()
        elif quest.status == "completed":
            quest.completed_at = None
    for field, value in update_data.items():
        setattr(quest, field, value)
    await db.commit()
    await db.refresh(quest)
    return QuestRead(
        id=quest.id,
        name=quest.name,
        description=quest.description,
        life_area_id=quest.life_area_id,
        status=quest.status,
        done_when=quest.done_when,
        estimated_sessions=quest.estimated_sessions,
        duration_minutes=quest.duration_minutes,
        created_at=quest.created_at.isoformat(),
        completed_at=quest.completed_at.isoformat() if quest.completed_at else None,
    )


@router.delete("/{quest_id}", status_code=204)
async def delete_quest(quest_id: str, db: AsyncSession = Depends(get_db)):
    quest = await db.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    await db.delete(quest)
    await db.commit()
