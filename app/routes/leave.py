from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..models import LeaveRequest, User
from ..schemas import LeaveRequestCreate, LeaveStatusUpdate
from ..services.llm_service import extract_leave_details
from ..auth import get_current_user, require_hr

router = APIRouter(
    prefix="/leave",
    tags=["Leave Requests"]
)


@router.post("")
def process_leave(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only employees can create leave requests
    if current_user.role != "EMPLOYEE":
        raise HTTPException(
            status_code=403,
            detail="Only employees can create leave requests"
        )

    try:
        data = extract_leave_details(payload.raw_request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process leave request: {str(e)}"
        )

    required_fields = [
        "employee_name",
        "leave_type",
        "start_date",
        "end_date",
        "reason"
    ]

    for field in required_fields:
        if field not in data or not data[field]:
            raise HTTPException(
                status_code=400,
                detail=f"Missing field in LLM response: {field}"
            )

    allowed_leave_types = ["Sick", "Casual", "Annual"]

    if data["leave_type"] not in allowed_leave_types:
        raise HTTPException(
            status_code=400,
            detail="leave_type must be Sick, Casual, or Annual"
        )

    try:
        start_date = datetime.strptime(
            data["start_date"],
            "%Y-%m-%d"
        ).date()

        end_date = datetime.strptime(
            data["end_date"],
            "%Y-%m-%d"
        ).date()

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Dates must be in YYYY-MM-DD format"
        )

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date"
        )

    leave_request = LeaveRequest(
        employee_id=current_user.employee_id,
        employee_name=current_user.name,
        start_date=start_date,
        end_date=end_date,
        reason=data["reason"],
        status="Pending"
    )

    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)

    return {
        "leave_id": leave_request.id,
        "employee_id": leave_request.employee_id,
        "employee_name": leave_request.employee_name,
        "employee_email": leave_request.employee_email,
        "leave_type": leave_request.leave_type,
        "start_date": leave_request.start_date,
        "end_date": leave_request.end_date,
        "reason": leave_request.reason,
        "status": leave_request.status
    }


@router.get("")
def get_all_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # HR can see all requests
    if current_user.role == "HR":
        return db.query(LeaveRequest).all()

    # Employee sees only their own requests
    return db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_user.employee_id
    ).all()


@router.patch("/{leave_id}")
def update_leave_status(
    leave_id: int,
    payload: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_hr: User = Depends(require_hr)
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    leave.status = payload.status

    db.commit()
    db.refresh(leave)

    return {
        "leave_id": leave.id,
        "status": leave.status
    }


@router.delete("/{leave_id}")
def delete_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_hr: User = Depends(require_hr)
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    db.delete(leave)
    db.commit()

    return {
        "message": f"Leave request {leave_id} deleted successfully"
    }


@router.delete("/employee/{employee_id}")
def delete_employee_leave_requests(
    employee_id: str,
    db: Session = Depends(get_db),
    current_hr: User = Depends(require_hr)
):
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id
    ).all()

    if not leaves:
        raise HTTPException(
            status_code=404,
            detail="No leave requests found for this employee"
        )

    deleted_count = len(leaves)

    for leave in leaves:
        db.delete(leave)

    db.commit()

    return {
        "message": f"Deleted {deleted_count} leave request(s) for employee {employee_id}"
    }