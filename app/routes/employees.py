from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UpdateEmployeeSchema
from ..auth import require_hr

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("")
def get_all_employees(
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    employees = db.query(User).filter(User.role == "EMPLOYEE").all()

    return employees


@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "EMPLOYEE"
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    payload: UpdateEmployeeSchema,
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "EMPLOYEE"
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if payload.name:
        employee.name = payload.name

    if payload.email:
        employee.email = payload.email

    if payload.employee_id:
        employee.employee_id = payload.employee_id

    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee updated successfully",
        "employee": employee
    }


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(require_hr)
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "EMPLOYEE"
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()

    return {"message": "Employee deleted successfully"}