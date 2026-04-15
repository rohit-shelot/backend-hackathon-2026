from pydantic import BaseModel, field_validator
from datetime import date
from pydantic import BaseModel, EmailStr



class LeaveRequestCreate(BaseModel):
    raw_request: str


class LeaveStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        allowed = ["Approved", "Rejected"]
        if value not in allowed:
            raise ValueError("Status must be Approved or Rejected")
        return value


class LeaveResponse(BaseModel):
    leave_id: int
    employee_name: str
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    
class RegisterEmployeeSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    employee_id: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class UpdateEmployeeSchema(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    employee_id: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str