from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schema
from app.utils.auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schema.UserProfile)
def register(user: schema.UserCreate, response: Response, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username ==user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    new_user = models.User(
        username = user.username,
        email=user.email,
        password_hash = hash_password(user.password),
        xp=0,
        rank = "Rookie"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    response.set_cookie(
        key="access_token",
        value = token,
        httponly = True,
        samesite = "none",
        secure = True,
        max_age = 60 * 60 * 24 * 7  
    )
    return new_user

@router.post("/login", response_model=schema.UserProfile)
def login(credentials: schema.UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value = token,
        httponly = True,
        samesite = "none",
        secure = True,
        max_age = 60 * 60 * 24 * 7  
    )
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schema.UserProfile)
def get_me(request: Request, db:Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user