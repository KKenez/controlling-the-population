import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, async_session
from app.models.scheduler import SchedulerConfig
from app.routers import calendar, life_areas, routines, generation, goals, quests, notes
from app.routers import reviews, scheduler

logger = logging.getLogger(__name__)

# APScheduler setup
_scheduler = None


async def _start_scheduler():
    """Initialize and start APScheduler if enabled in config."""
    global _scheduler
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.interval import IntervalTrigger
        from app.services.scheduler import run_scheduled_generation

        # Load config from DB
        async with async_session() as db:
            config = await db.get(SchedulerConfig, "singleton")
            if not config:
                config = SchedulerConfig(id="singleton")
                db.add(config)
                await db.commit()

        _scheduler = AsyncIOScheduler()
        _scheduler.add_job(
            run_scheduled_generation,
            trigger=IntervalTrigger(minutes=config.interval_minutes if config else 60),
            id="auto_generation",
            replace_existing=True,
        )

        if config and config.enabled:
            _scheduler.start()
            logger.info("Scheduler started (interval=%d min)", config.interval_minutes)
        else:
            logger.info("Scheduler initialized but disabled")

    except ImportError:
        logger.warning("APScheduler not installed — scheduled generation disabled. Install with: pip install apscheduler")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await _start_scheduler()
    yield
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()


app = FastAPI(title="Controlling the Population", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calendar.router)
app.include_router(life_areas.router)
app.include_router(routines.router)
app.include_router(generation.router)
app.include_router(goals.router)
app.include_router(quests.router)
app.include_router(notes.router)
app.include_router(reviews.router)
app.include_router(scheduler.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
