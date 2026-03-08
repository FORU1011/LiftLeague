from app.database import SessionLocal
from app import models

db = SessionLocal()

exercise1 = models.Exercise(
    name="Bench Press",
    category="Chest",
    target_muscle="Pectorals",
    difficulty="Intermediate",
    instructions="Lie on a bench and press the bar upward",
    video_url="https://www.youtube.com/watch?v=rT7DgCr-3pg"
)

exercise2 = models.Exercise(
    name="Squat",
    category="Legs",
    target_muscle="Quadriceps",
    difficulty="Intermediate",
    instructions="Stand with feet shoulder-width and squat down",
    video_url="https://www.youtube.com/watch?v=Dy28eq2PjcM"
)

db.add(exercise1)
db.add(exercise2)   

db.commit()
db.close()
