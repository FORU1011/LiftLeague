from pydantic import BaseModel, EmailStr

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

class WorkoutCreate(BaseModel):
    user_id:int
    exercise_id:int
    sets:int
    reps:int
    weight:int  

class WorkoutResponse(WorkoutCreate):
    id:int

    class Config:
        from_attributes = True

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