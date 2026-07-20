from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.generation import GeneratedWeek
from app.schemas.generation import GenerateRequest, GeneratedWeekRead
from app.services.generation import generate_week

router = APIRouter(prefix="/api/generation", tags=["generation"])


@router.post("", response_model=GeneratedWeekRead, status_code=201)
async def create_generation(data: GenerateRequest, db: AsyncSession = Depends(get_db)):
    week = await generate_week(data.routine_ids, data.week_start, db)
    return week


@router.get("/{week_id}", response_model=GeneratedWeekRead)
async def get_generated_week(week_id: str, db: AsyncSession = Depends(get_db)):
    week = await db.get(GeneratedWeek, week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Generated week not found")
    return week


@router.post("/{week_id}/confirm")
async def confirm_week(week_id: str, db: AsyncSession = Depends(get_db)):
    week = await db.get(GeneratedWeek, week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Generated week not found")
    week.status = "confirmed"
    await db.commit()
    # TODO: push confirmed events to external calendars
    return {"message": "week confirmed"}
