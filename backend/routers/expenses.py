from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from ..db import models, db
from ..schemas import ExpenseCreate
from sqlalchemy import func
from datetime import datetime

"""Expenses router

Provides endpoints to list, create, read and delete expenses,
and a /summary endpoint that aggregates totals and allocations.
"""

router = APIRouter(prefix="/expenses", tags=["expenses"])

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# GET /expenses/ with optional filters
@router.get("/")
def read_expenses(
    month: int | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense)
    if month is not None:
        query = query.filter(extract("month", models.Expense.date) == month)
    if user_id is not None:
        query = query.filter(models.Expense.owner_id == user_id)
    return query.all()

# GET /expenses/summary?month=9&year=2025
@router.get("/summary")
def monthly_summary(month: int, year: int | None = None, db: Session = Depends(get_db)):
    """
    Returns a summary for the given month: totals, incomes per user, common expenses total,
    and allocation per user for common expenses proportional to their incomes.
    """
    if year is None:
        year = datetime.utcnow().year

    # total expenses in month
    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        func.extract('month', models.Expense.date) == month,
        func.extract('year', models.Expense.date) == year
    ).scalar() or 0.0

    # total common expenses in month
    total_common = db.query(func.sum(models.Expense.amount)).filter(
        func.extract('month', models.Expense.date) == month,
        func.extract('year', models.Expense.date) == year,
        models.Expense.is_common == True
    ).scalar() or 0.0

    # incomes per user in month
    incomes = db.query(models.User.id, models.User.name, func.coalesce(func.sum(models.Income.amount), 0).label('income_sum')).join(models.Income, models.Income.owner_id == models.User.id, isouter=True).filter(
        func.extract('month', models.Income.date) == month,
        func.extract('year', models.Income.date) == year
    ).group_by(models.User.id).all()

    # compute total incomes
    total_income = sum([row.income_sum or 0 for row in incomes]) or 0.0

    # allocation: if total_income == 0 then split equally among users
    allocations = []
    user_count = len(incomes)
    for row in incomes:
        if total_income > 0:
            share = (row.income_sum or 0) / total_income
        else:
            share = 1.0 / user_count if user_count > 0 else 0
        allocations.append({
            'user_id': row.id,
            'name': row.name,
            'income': float(row.income_sum or 0),
            'alloc_quota': float(share * total_common)
        })

    return {
        'month': month,
        'year': year,
        'total_expenses': float(total_expenses),
        'total_common_expenses': float(total_common),
        'total_income': float(total_income),
        'allocations': allocations
    }

# GET /expenses/{expense_id}
@router.get("/{expense_id}")
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()

# POST /expenses/
@router.post("/")
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        is_common=expense.is_common,
        owner_id=expense.owner_id,
        date=expense.date
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# DELETE /expenses/{expense_id}
@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return {"message": "Expense deleted"}
