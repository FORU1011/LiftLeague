from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app import models, schema
from app.utils.ranking import calculate_rank

router = APIRouter()

MUSCLE_MAP = {
    "Chest":      ["chest", "pectorals"],
    "Back":       ["lats", "middle back", "lower back", "traps", "rhomboids"],
    "Shoulders":  ["shoulders", "front deltoids", "middle deltoids", "rear deltoids", "deltoids"],
    "Arms":       ["biceps", "triceps", "forearms"],
    "Legs":       ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors", "hip flexors"],
    "Core":       ["abdominals", "obliques", "core"],
    "Cardio":     ["cardio"],
    "Stretching": ["stretching"],
}

def resolve_muscle_group(target_muscle: str, category: str) -> str:
    cat = (category or "").lower()
    if cat == "cardio": return "Cardio"
    if cat == "stretching": return "Stretching"
    muscles = (target_muscle or "").lower()
    for group, keywords in MUSCLE_MAP.items():
        if any(k in muscles for k in keywords):
            return group
    return "Other"

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

@router.get("/workout/{user_id}/history", response_model=list[schema.WorkoutHistoryItem])
def get_workout_history(user_id: int, db: Session = Depends(get_db)):
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    results = (
        db.query(models.Workout, models.Exercise)
        .join(models.Exercise, models.Workout.exercise_id == models.Exercise.id)
        .filter(models.Workout.user_id == user_id)
        .filter(models.Workout.logged_at >= one_week_ago)
        .order_by(models.Workout.logged_at.desc())
        .all()
    )

    return [
        schema.WorkoutHistoryItem(
            id = w.id,
            exercise_id = w.exercise_id,
            exercise_name = e.name,
            target_muscle = e.target_muscle,
            sets = w.sets,
            reps = w.reps,
            weight = w.weight,
            logged_at = w.logged_at,
        )
        for w, e in results
    ]

@router.get("/workouts/{user_id}/prs", response_model=list[schema.MusclePR])
def get_muscle_prs(user_id:int, db: Session = Depends(get_db)):
    results = (
        db.query(models.Workout, models.Exercise)
        .join(models.Exercise, models.Workout.exercise_id == models.Exercise.id)
        .filter(models.Workout.user_id == user_id)
        .all()
    )

    best: dict = {}
    for w, e in results:
        group = resolve_muscle_group(e.target_muscle, e.category)
        if group == "Other":
            continue
        if group not in best or w.weight > best[group]["weight"]:
            best[group] = {
                "muscle_group": group,
                "exercise_name": e.name,
                "weight": w.weight,
                "sets": w.sets,
                "reps": w.reps,
                "logged_at": w.logged_at,
            }
    return [schema.MusclePR(**v) for v in best.values()]