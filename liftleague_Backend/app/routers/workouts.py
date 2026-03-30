from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

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
    user = db.query(models.User).filter(models.User.id == workout.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_workout = models.Workout(
        user_id=workout.user_id,
        exercise_id=workout.exercise_id,
        notes=workout.notes,
        duration_seconds=workout.duration_seconds,
    )
    db.add(new_workout)
    db.flush()  # get new_workout.id before committing

    completed_sets = [s for s in workout.sets if s.completed]
    for s in workout.sets:
        db.add(models.WorkoutSet(
            workout_id=new_workout.id,
            set_number=s.set_number,
            weight=s.weight,
            reps=s.reps,
            completed=s.completed,
        ))

    # XP: 10 per completed set
    user.xp += len(completed_sets) * 10
    user.rank = calculate_rank(user.xp)

    db.commit()
    db.refresh(new_workout)

    sets = db.query(models.WorkoutSet).filter(models.WorkoutSet.workout_id == new_workout.id).all()
    return schema.WorkoutResponse(
        id=new_workout.id,
        user_id=new_workout.user_id,
        exercise_id=new_workout.exercise_id,
        notes=new_workout.notes,
        duration_seconds=new_workout.duration_seconds,
        logged_at=new_workout.logged_at,
        sets=[schema.SetResponse(id=s.id, set_number=s.set_number, weight=s.weight, reps=s.reps, completed=s.completed) for s in sets]
    )


@router.get("/workouts/{user_id}/history", response_model=list[schema.WorkoutHistoryItem])
def get_workout_history(user_id: int, db: Session = Depends(get_db)):
    one_week_ago = datetime.utcnow() - timedelta(days=7)

    workouts = (
        db.query(models.Workout, models.Exercise)
        .join(models.Exercise, models.Workout.exercise_id == models.Exercise.id)
        .filter(models.Workout.user_id == user_id)
        .filter(models.Workout.logged_at >= one_week_ago)
        .order_by(models.Workout.logged_at.desc())
        .all()
    )

    result = []
    for w, e in workouts:
        sets = db.query(models.WorkoutSet).filter(models.WorkoutSet.workout_id == w.id).all()
        result.append(schema.WorkoutHistoryItem(
            id=w.id,
            exercise_id=w.exercise_id,
            exercise_name=e.name,
            target_muscle=e.target_muscle,
            notes=w.notes,
            duration_seconds=w.duration_seconds,
            logged_at=w.logged_at,
            sets=[schema.SetResponse(id=s.id, set_number=s.set_number, weight=s.weight, reps=s.reps, completed=s.completed) for s in sets]
        ))
    return result


@router.get("/workouts/{user_id}/prs", response_model=list[schema.MusclePR])
def get_muscle_prs(user_id: int, db: Session = Depends(get_db)):
    workouts = (
        db.query(models.Workout, models.Exercise)
        .join(models.Exercise, models.Workout.exercise_id == models.Exercise.id)
        .filter(models.Workout.user_id == user_id)
        .all()
    )

    best: dict = {}
    for w, e in workouts:
        group = resolve_muscle_group(e.target_muscle, e.category)
        if group == "Other":
            continue
        sets = db.query(models.WorkoutSet).filter(
            models.WorkoutSet.workout_id == w.id,
            models.WorkoutSet.completed == True
        ).all()
        for s in sets:
            if group not in best or s.weight > best[group]["weight"]:
                best[group] = {
                    "muscle_group": group,
                    "exercise_name": e.name,
                    "weight": s.weight,
                    "reps": s.reps,
                    "logged_at": w.logged_at,
                }

    return [schema.MusclePR(**v) for v in best.values()]