import os
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

# CORS
cors_env = os.getenv("CORS_ALLOW_ORIGINS", "")
origins = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FinTracker API"}
