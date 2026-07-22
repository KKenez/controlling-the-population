from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.generation import GeneratedWeek
from app.schemas.generation import GenerateRequest, GeneratedWeekRead
from app.services.generation import generate_week, confirm_week as confirm_week_service

router = APIRouter(prefix="/api/generation", tags=["generation"])


@router.post("", response_model=GeneratedWeekRead, status_code=201)
async def create_generation(data: GenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        week = await generate_week(data.routine_ids, data.week_start, db)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return week


@router.get("/{week_id}", response_model=GeneratedWeekRead)
async def get_generated_week(week_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GeneratedWeek)
        .options(selectinload(GeneratedWeek.events))
        .where(GeneratedWeek.id == week_id)
    )
    week = result.scalar_one_or_none()
    if not week:
        raise HTTPException(status_code=404, detail="Generated week not found")
    return week


@router.post("/{week_id}/confirm")
async def confirm_week_endpoint(week_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GeneratedWeek)
        .options(selectinload(GeneratedWeek.events))
        .where(GeneratedWeek.id == week_id)
    )
    week = result.scalar_one_or_none()
    if not week:
        raise HTTPException(status_code=404, detail="Generated week not found")
    if week.status == "confirmed":
        raise HTTPException(status_code=400, detail="Week already confirmed")

    created_events = await confirm_week_service(week, db)
    return {"message": "Week confirmed", "events_created": len(created_events)}


@router.get("/ai/status")
async def ai_status():
    """Check if Ollama is reachable and the model is available."""
    import httpx
    from app.config import settings

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
            model_ready = any(settings.ollama_model in m for m in models)
            return {
                "ollama_reachable": True,
                "model": settings.ollama_model,
                "model_ready": model_ready,
                "available_models": models,
            }
    except Exception:
        return {
            "ollama_reachable": False,
            "model": settings.ollama_model,
            "model_ready": False,
            "available_models": [],
        }
