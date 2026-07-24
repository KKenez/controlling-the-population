import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.review import DailyReview, EventReview
from app.schemas.review import DailyReviewCreate, DailyReviewRead

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

VALID_STATUSES = {"completed", "skipped", "partial", "dismissed"}


@router.get("", response_model=list[DailyReviewRead])
async def list_reviews(limit: int = 14, db: AsyncSession = Depends(get_db)):
    """List recent daily reviews (default: last 14 days)."""
    stmt = (
        select(DailyReview)
        .options(selectinload(DailyReview.event_reviews))
        .order_by(DailyReview.date.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    return [
        DailyReviewRead(
            id=r.id,
            date=r.date,
            overall_notes=r.overall_notes,
            completed_at=r.completed_at.isoformat(),
            event_reviews=[
                {
                    "id": er.id,
                    "event_id": er.event_id,
                    "event_title": er.event_title,
                    "status": er.status,
                    "feedback": er.feedback,
                    "actual_duration_minutes": er.actual_duration_minutes,
                }
                for er in r.event_reviews
            ],
        )
        for r in reviews
    ]


@router.get("/{review_date}", response_model=DailyReviewRead)
async def get_review_by_date(review_date: str, db: AsyncSession = Depends(get_db)):
    """Get review for a specific date (YYYY-MM-DD)."""
    stmt = (
        select(DailyReview)
        .options(selectinload(DailyReview.event_reviews))
        .where(DailyReview.date == review_date)
    )
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="No review found for this date")
    return DailyReviewRead(
        id=review.id,
        date=review.date,
        overall_notes=review.overall_notes,
        completed_at=review.completed_at.isoformat(),
        event_reviews=[
            {
                "id": er.id,
                "event_id": er.event_id,
                "event_title": er.event_title,
                "status": er.status,
                "feedback": er.feedback,
                "actual_duration_minutes": er.actual_duration_minutes,
            }
            for er in review.event_reviews
        ],
    )


@router.post("", response_model=DailyReviewRead, status_code=201)
async def create_review(data: DailyReviewCreate, db: AsyncSession = Depends(get_db)):
    """Submit a daily review with event statuses and feedback."""
    # Check for existing review on this date
    existing = await db.execute(
        select(DailyReview).where(DailyReview.date == data.date)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Review already exists for this date")

    # Validate event review statuses
    for er in data.event_reviews:
        if er.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail=f"Invalid status: {er.status}")

    review = DailyReview(
        id=str(uuid.uuid4()),
        date=data.date,
        overall_notes=data.overall_notes,
        completed_at=datetime.utcnow(),
    )

    for er_data in data.event_reviews:
        event_review = EventReview(
            id=str(uuid.uuid4()),
            daily_review_id=review.id,
            event_id=er_data.event_id,
            event_title=er_data.event_title,
            status=er_data.status,
            feedback=er_data.feedback,
            actual_duration_minutes=er_data.actual_duration_minutes,
        )
        review.event_reviews.append(event_review)

    db.add(review)
    await db.commit()

    return DailyReviewRead(
        id=review.id,
        date=review.date,
        overall_notes=review.overall_notes,
        completed_at=review.completed_at.isoformat(),
        event_reviews=[
            {
                "id": er.id,
                "event_id": er.event_id,
                "event_title": er.event_title,
                "status": er.status,
                "feedback": er.feedback,
                "actual_duration_minutes": er.actual_duration_minutes,
            }
            for er in review.event_reviews
        ],
    )
