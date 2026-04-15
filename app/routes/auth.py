from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import RegisterEmployeeSchema, LoginSchema
from ..auth import hash_password, verify_password, create_access_token, require_hr

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register-employee")
def register_employee(
    payload: RegisterEmployeeSchema,
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Employee already exists")

    employee = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role="EMPLOYEE",
        employee_id=payload.employee_id
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee created successfully",
        "employee_id": employee.id
    }

@router.put("/employee/{employee_id}")
def update_employee(
    employee_id: int,
    payload: RegisterEmployeeSchema,
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "EMPLOYEE"
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Check if another employee already uses the same email
    existing_email = db.query(User).filter(
        User.email == payload.email,
        User.id != employee_id
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already in use"
        )

    # Check if another employee already uses the same employee_id
    existing_emp_id = db.query(User).filter(
        User.employee_id == payload.employee_id,
        User.id != employee_id
    ).first()

    if existing_emp_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already in use"
        )

    employee.name = payload.name
    employee.email = payload.email
    employee.employee_id = payload.employee_id

    # Only update password if provided
    if payload.password:
        employee.password = hash_password(payload.password)

    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee updated successfully",
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "employee_id": employee.employee_id
        }
    }

@router.post("/login")
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {
            "user_id": user.id,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }