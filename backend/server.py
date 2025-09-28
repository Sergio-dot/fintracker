from fastapi import FastAPI
from .routers import users, expenses, incomes
from .db.db import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# Database setup
Base.metadata.create_all(bind=engine)

# FastAPI app setup
app = FastAPI()
app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(incomes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FinTracker API"}