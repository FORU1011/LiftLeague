from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ExerciseBase(BaseModel):
    name:str
    category:str
    target_muscle:str
    difficulty:str
    instructions:str
    video_url:str

class ExerciseResponse(ExerciseBase):
    id:int

    class Config:
        from_attributes = True

class SetCreate(BaseModel):
    set_number:int
    weight:int
    reps:int
    completed:bool = True

class SetResponse(SetCreate):
    id:int

    class Config:
        from_attributes = True

class WorkoutCreate(BaseModel):
    user_id:int
    exercise_id:int
    notes: Optional[str] = None
    duration_seconds: Optional[int] = None
    sets: list[SetCreate]

class WorkoutResponse(WorkoutCreate):
    id:int
    user_id: int
    exercise_id: int
    notes: Optional[str]
    duration_seconds: Optional[int]
    logged_at: datetime
    sets: list[SetResponse]

    class Config:
        from_attributes = True

class WorkoutHistoryItem(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    target_muscle: str
    notes: Optional[str]
    duration_seconds: Optional[int]
    logged_at: datetime
    sets: list[SetResponse]

    class Config:
        from_attributes = True

class MusclePR(BaseModel):
    muscle_group: str
    exercise_name: str
    weight: int
    reps: int
    logged_at: datetime

class UserCreate(BaseModel):
    username:str
    email:EmailStr
    password:str

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class UserProfile(BaseModel):
    id: int
    username: str
    xp: int
    rank: str

    class Config:
        from_attributes = True