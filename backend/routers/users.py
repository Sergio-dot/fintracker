from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import models, db
from ..schemas import UserCreate

router = APIRouter(prefix="/users", tags=["users"])

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# GET /users/
@router.get("/")
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

# GET /users/{user_id}
@router.get("/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.id == user_id).first()

# POST /users/
@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
