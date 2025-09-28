from pydantic import BaseModel
from datetime import date

class UserCreate(BaseModel):
    name: str

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    owner_id: int
    date: date
    is_common: bool = False
    
class IncomeCreate(BaseModel):
    amount: float
    owner_id: int
    date: date