from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schema
from app.utils.ranking import calculate_rank

router = APIRouter()

@router.post("/workouts", response_model=schema.WorkoutResponse)
def log_workout(workout: schema.WorkoutCreate, db: Session = Depends(get_db)):
    new_workout = models.Workout(
        user_id=workout.user_id,
        exercise_id=workout.exercise_id,
        sets=workout.sets,
        reps=workout.reps,
        weight=workout.weight
    )

    db.add(new_workout)

    #Giving XP
    user = db.query(models.User).filter(models.User.id == workout.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.xp += 50

    #Update Rank
    user.rank = calculate_rank(user.xp)

    db.commit()
    db.refresh(new_workout)

    return new_workout