from app.schemas.base import CamelModel


class LifeAreaCreate(CamelModel):
    name: str
    color: str = "#6366f1"
    icon: str = "circle"
    description: str = ""


class LifeAreaUpdate(CamelModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    description: str | None = None


class LifeAreaRead(CamelModel):
    id: str
    name: str
    color: str
    icon: str
    description: str
    routine_count: int = 0
