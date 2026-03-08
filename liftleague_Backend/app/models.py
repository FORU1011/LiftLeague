from sqlalchemy import Column, Integer, String, Text, ForeignKey
from .database import Base

#User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    password_hash = Column(String)
    xp = Column(Integer, default=0)
    rank = Column(String, default="Rookie")

#Exercise Model
class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    category = Column(String)
    target_muscle = Column(String)
    difficulty = Column(String)
    instructions = Column(Text)
    video_url = Column(String)

#Workout Model
class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Integer)
