import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.life_area import LifeArea
from app.models.routine import Routine
from app.schemas.life_area import LifeAreaCreate, LifeAreaRead, LifeAreaUpdate

router = APIRouter(prefix="/api/life-areas", tags=["life-areas"])


@router.get("", response_model=list[LifeAreaRead])
async def list_life_areas(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            LifeArea,
            func.count(Routine.id).label("routine_count"),
        )
        .outerjoin(Routine, Routine.life_area_id == LifeArea.id)
        .group_by(LifeArea.id)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        LifeAreaRead(
            id=area.id,
            name=area.name,
            color=area.color,
            icon=area.icon,
            description=area.description,
            routine_count=count,
        )
        for area, count in rows
    ]


@router.get("/{area_id}", response_model=LifeAreaRead)
async def get_life_area(area_id: str, db: AsyncSession = Depends(get_db)):
    area = await db.get(LifeArea, area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Life area not found")
    count_result = await db.execute(
        select(func.count(Routine.id)).where(Routine.life_area_id == area_id)
    )
    count = count_result.scalar() or 0
    return LifeAreaRead(
        id=area.id, name=area.name, color=area.color,
        icon=area.icon, description=area.description, routine_count=count,
    )


@router.post("", response_model=LifeAreaRead, status_code=201)
async def create_life_area(data: LifeAreaCreate, db: AsyncSession = Depends(get_db)):
    area = LifeArea(
        id=str(uuid.uuid4()),
        name=data.name,
        color=data.color,
        icon=data.icon,
        description=data.description,
    )
    db.add(area)
    await db.commit()
    await db.refresh(area)
    return LifeAreaRead(
        id=area.id, name=area.name, color=area.color,
        icon=area.icon, description=area.description, routine_count=0,
    )


@router.patch("/{area_id}", response_model=LifeAreaRead)
async def update_life_area(area_id: str, data: LifeAreaUpdate, db: AsyncSession = Depends(get_db)):
    area = await db.get(LifeArea, area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Life area not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(area, field, value)
    await db.commit()
    await db.refresh(area)
    count_result = await db.execute(
        select(func.count(Routine.id)).where(Routine.life_area_id == area_id)
    )
    count = count_result.scalar() or 0
    return LifeAreaRead(
        id=area.id, name=area.name, color=area.color,
        icon=area.icon, description=area.description, routine_count=count,
    )


@router.delete("/{area_id}", status_code=204)
async def delete_life_area(area_id: str, db: AsyncSession = Depends(get_db)):
    area = await db.get(LifeArea, area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Life area not found")
    await db.delete(area)
    await db.commit()
