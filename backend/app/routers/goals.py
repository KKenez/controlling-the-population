import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.goal import Goal
from app.models.routine import Routine
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate

router = APIRouter(prefix="/api/goals", tags=["goals"])

VALID_STATUSES = {"backlog", "active", "paused"}


@router.get("", response_model=list[GoalRead])
async def list_goals(
    status: str | None = None,
    life_area_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Goal, func.count(Routine.id).label("routine_count"))
        .outerjoin(Routine, Routine.goal_id == Goal.id)
        .group_by(Goal.id)
    )
    if status:
        stmt = stmt.where(Goal.status == status)
    if life_area_id:
        stmt = stmt.where(Goal.life_area_id == life_area_id)
    result = await db.execute(stmt)
    rows = result.all()
    return [
        GoalRead(
            id=goal.id,
            name=goal.name,
            description=goal.description,
            life_area_id=goal.life_area_id,
            status=goal.status,
            created_at=goal.created_at.isoformat(),
            routine_count=count,
        )
        for goal, count in rows
    ]


@router.get("/{goal_id}", response_model=GoalRead)
async def get_goal(goal_id: str, db: AsyncSession = Depends(get_db)):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    count_result = await db.execute(
        select(func.count(Routine.id)).where(Routine.goal_id == goal_id)
    )
    count = count_result.scalar() or 0
    return GoalRead(
        id=goal.id,
        name=goal.name,
        description=goal.description,
        life_area_id=goal.life_area_id,
        status=goal.status,
        created_at=goal.created_at.isoformat(),
        routine_count=count,
    )


@router.post("", response_model=GoalRead, status_code=201)
async def create_goal(data: GoalCreate, db: AsyncSession = Depends(get_db)):
    if data.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status: {data.status}")
    goal = Goal(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        life_area_id=data.life_area_id,
        status=data.status,
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return GoalRead(
        id=goal.id,
        name=goal.name,
        description=goal.description,
        life_area_id=goal.life_area_id,
        status=goal.status,
        created_at=goal.created_at.isoformat(),
        routine_count=0,
    )


@router.patch("/{goal_id}", response_model=GoalRead)
async def update_goal(goal_id: str, data: GoalUpdate, db: AsyncSession = Depends(get_db)):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status: {update_data['status']}")
    for field, value in update_data.items():
        setattr(goal, field, value)
    await db.commit()
    await db.refresh(goal)
    count_result = await db.execute(
        select(func.count(Routine.id)).where(Routine.goal_id == goal_id)
    )
    count = count_result.scalar() or 0
    return GoalRead(
        id=goal.id,
        name=goal.name,
        description=goal.description,
        life_area_id=goal.life_area_id,
        status=goal.status,
        created_at=goal.created_at.isoformat(),
        routine_count=count,
    )


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: str, db: AsyncSession = Depends(get_db)):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
