import requests 
from app.database import SessionLocal
from app import models

URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"

def seed_exercises():
    res = requests.get(URL)
    data = res.json()

    db = SessionLocal()

    #Clear exisiting exercises
    db.query(models.Workout).delete()
    db.query(models.Exercise).delete()
    db.commit()

    count = 0
    for exercise in data:
        try:
            new_exercise = models.Exercise(
                name = exercise.get("name", "Unknown"),
                category = exercise.get("category", "General").title(),
                target_muscle = ", ".join(exercise.get("primaryMuscles", ["General"])).title(),
                difficulty = exercise.get("level", "Beginner").capitalize(),
                instructions = ", ".join(exercise.get("instructions", ["No instructions available"])),
                video_url = f"https://www.youtube.com/results?search_query={exercise.get('name', ''). replace(' ', '+')}+exercise+tutorial"   
            )
            db.add(new_exercise)
            count += 1
        except Exception as e:
            print(f"Skipping exercise: {e}")
            continue
    
    db.commit()
    db.close()
    print(f"Seeded {count} exercises successfully!")

if __name__ == "__main__":
    seed_exercises()