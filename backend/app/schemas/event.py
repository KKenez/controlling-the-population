from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    start: str
    end: str
    source: str
    location: str | None = None
    notes: str | None = None


class EventRead(BaseModel):
    id: str
    title: str
    start: str
    end: str
    source: str
    location: str | None = None
    notes: str | None = None

    model_config = {"from_attributes": True}
