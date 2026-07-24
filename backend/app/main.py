from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import calendar, life_areas, routines, generation, goals, quests, notes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


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


@app.get("/health")
async def health():
    return {"status": "ok"}
