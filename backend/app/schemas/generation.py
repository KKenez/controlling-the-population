from pydantic import BaseModel


class ProposedEventRead(BaseModel):
    id: str
    routine_id: str
    title: str
    start: str
    end: str
    editable: bool

    model_config = {"from_attributes": True}


class GeneratedWeekRead(BaseModel):
    id: str
    week_start: str
    status: str
    events: list[ProposedEventRead]
    created_at: str

    model_config = {"from_attributes": True}


class GenerateRequest(BaseModel):
    routine_ids: list[str]
    week_start: str
