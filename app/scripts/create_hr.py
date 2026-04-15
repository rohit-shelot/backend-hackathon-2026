from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

db = SessionLocal()

hr = User(
    name="HR Admin",
    email="hr@hapticware.com",
    password=hash_password("hr123456"),
    role="HR"
)

db.add(hr)
db.commit()