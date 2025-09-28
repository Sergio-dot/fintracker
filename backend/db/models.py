from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy import Boolean
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    incomes = relationship("Income", back_populates="owner")
    expenses = relationship("Expense", back_populates="owner")

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    date = Column(Date)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    category = Column(String)
    date = Column(Date)
    is_common = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="expenses")
