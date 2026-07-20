import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.routine import Routine
from app.schemas.routine import RoutineCreate, RoutineRead, RoutineUpdate

router = APIRouter(prefix="/api/routines", tags=["routines"])


@router.get("", response_model=list[RoutineRead])
async def list_routines(life_area_id: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Routine)
    if life_area_id:
        stmt = stmt.where(Routine.life_area_id == life_area_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{routine_id}", response_model=RoutineRead)
async def get_routine(routine_id: str, db: AsyncSession = Depends(get_db)):
    routine = await db.get(Routine, routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    return routine


@router.post("", response_model=RoutineRead, status_code=201)
async def create_routine(data: RoutineCreate, db: AsyncSession = Depends(get_db)):
    routine = Routine(
        id=str(uuid.uuid4()),
        name=data.name,
        life_area_id=data.life_area_id,
        description=data.description,
        priority=data.priority,
        frequency_per_week=data.frequency_per_week,
        duration_minutes=data.duration_minutes,
        constraints=data.constraints.model_dump(),
        parameters=data.parameters,
    )
    db.add(routine)
    await db.commit()
    await db.refresh(routine)
    return routine


@router.patch("/{routine_id}", response_model=RoutineRead)
async def update_routine(routine_id: str, data: RoutineUpdate, db: AsyncSession = Depends(get_db)):
    routine = await db.get(Routine, routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    update_data = data.model_dump(exclude_unset=True)
    if "constraints" in update_data and update_data["constraints"] is not None:
        update_data["constraints"] = data.constraints.model_dump()
    for field, value in update_data.items():
        setattr(routine, field, value)
    await db.commit()
    await db.refresh(routine)
    return routine


@router.delete("/{routine_id}", status_code=204)
async def delete_routine(routine_id: str, db: AsyncSession = Depends(get_db)):
    routine = await db.get(Routine, routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    await db.delete(routine)
    await db.commit()
