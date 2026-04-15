from sqlalchemy import Column, Integer, String, Text, Date
from .database import Base
from sqlalchemy import Column, Integer, String, Boolean




from sqlalchemy import Column, Integer, String, Date, Text

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, nullable=False)
    employee_name = Column(String, nullable=False)
    employee_email = Column(String, nullable=False)
    leave_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="Pending")
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # HR or EMPLOYEE
    employee_id = Column(String, unique=True, nullable=True)