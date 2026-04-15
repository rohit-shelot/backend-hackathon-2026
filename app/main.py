from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes.leave import router as leave_router
from .routes.auth import router as auth_router
from .routes.employees import router as employee_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Leave Request Processor API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(employee_router)

# Add this CORS configuration
from fastapi.middleware.cors import CORSMiddleware

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(leave_router)


@app.get("/")
def home():
    return {
        "message": "Leave Request Processor API is running"
    }