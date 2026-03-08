from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session   
from app.database import get_db
from app import models, schema
from sqlalchemy import distinct

router = APIRouter()

@router.get("/exercises", response_model=list[schema.ExerciseResponse])
def get_exercises(db: Session = Depends(get_db)):
    exercises = db.query(models.Exercise).all()
    return exercises

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Exercise.category).distinct().all()
    return [c[0] for c in categories]

@router.get("/exercises/{category}", response_model=list[schema.ExerciseResponse])
def get_exercises_by_category(category:str, db: Session = Depends(get_db)):
    exercises = db.query(models.Exercise).filter(models.Exercise.category == category.capitalize()).all()
    return exercises
