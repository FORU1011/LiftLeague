from fastapi import FastAPI
from app.routers import exercises
from app import models
from app.database import engine
from app.routers import exercises, workouts, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LiftLeague API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lift-league.vercel.app"],  # Adjust this in production to restrict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Create Database Tables
models.Base.metadata.create_all(bind=engine)

app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to LiftLeague!"}

