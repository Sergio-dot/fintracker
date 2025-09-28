from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from ..db import models, db
from ..schemas import IncomeCreate

"""Incomes router

Provides endpoints to list, create, read and delete incomes.
"""

router = APIRouter(prefix="/incomes", tags=["incomes"])

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# GET /incomes/ with optional filters
@router.get("/")
def read_incomes(
    month: int | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Income)
    if month:
        query = query.filter(extract("month", models.Income.date) == month)
    if user_id:
        query = query.filter(models.Income.owner_id == user_id)
    return query.all()

# GET /incomes/{income_id}
@router.get("/{income_id}")
def read_income(income_id: int, db: Session = Depends(get_db)):
    return db.query(models.Income).filter(models.Income.id == income_id).first()

# POST /incomes/
@router.post("/")
def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    db_income = models.Income(
        amount=income.amount,
        owner_id=income.owner_id,
        date=income.date
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

# DELETE /incomes/{income_id}
@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()
    if db_income:
        db.delete(db_income)
        db.commit()
    return {"message": "Income deleted"}
