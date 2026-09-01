from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Gamification, ConsentRecord, ProfileVersion, AuditLog
from app.schemas import UserRegister, UserLogin, PasswordReset, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    # Assign role: admin for admin@ecoai.org, organization for org email, user otherwise
    user_count = db.query(User).count()
    if user_data.email == "admin@ecoai.org" or (user_count == 0 and "admin" in user_data.email):
        role = "admin"
    elif "org" in user_data.email or "government" in user_data.email or "city" in user_data.email:
        role = "organization"
    else:
        role = "user"

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        phone=user_data.phone,
        terms_consented=user_data.terms_consented,
        profile_completed=False,
        profile_completion_pct=20,
        role=role,
        eco_points=150,
        streak_days=1,
        level=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize Gamification profile
    gamification = Gamification(
        user_id=new_user.id,
        badges=["Eco Pioneer"],
        completed_challenges=[],
        weekly_goal_kg=250.0,
        eco_points=150,
        streak_days=1
    )
    db.add(gamification)

    # Initialize Privacy & Consent Record (All default to OFF for privacy compliance)
    consent = ConsentRecord(
        user_id=new_user.id,
        analytics_consent=False,
        ai_consent=False,
        org_consent=False
    )
    db.add(consent)

    # Initialize Version 1 of user profile snapshot
    profile_ver = ProfileVersion(
        user_id=new_user.id,
        version_number=1,
        profile_data_json={
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "terms_consented": new_user.terms_consented
        }
    )
    db.add(profile_ver)

    # Audit Log Entry
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        details_json={"role": role, "email": new_user.email}
    )
    db.add(audit)

    db.commit()

    token = create_access_token(data={"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.from_orm(new_user)}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    # Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        details_json={"email": user.email, "role": user.role}
    )
    db.add(audit)
    db.commit()

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.from_orm(user)}

@router.post("/forgot-password")
def forgot_password(data: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found.")
    
    user.hashed_password = hash_password(data.new_password)
    
    audit = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET",
        details_json={"email": user.email}
    )
    db.add(audit)
    db.commit()
    return {"message": "Password updated successfully. Please log in with your new password."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)
