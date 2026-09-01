from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, DailyCheckIn
from app.schemas import DailyCheckInRequest
from app.auth import get_current_user

router = APIRouter(prefix="/api/checkin", tags=["Daily Check-In"])

@router.post("/submit")
def submit_daily_checkin(
    checkin_data: DailyCheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate estimated daily kg CO2
    mode_co2 = {"Car": 6.5, "Bike": 0.0, "Bus": 1.8, "Train": 1.2, "Walk": 0.0}.get(checkin_data.travel_mode, 4.0)
    elec_mult = 1.2 if checkin_data.electricity_change == "Higher" else (0.8 if checkin_data.electricity_change == "Lower" else 1.0)
    meat_mult = 1.3 if checkin_data.diet_meat == "More" else (0.7 if checkin_data.diet_meat == "Less" else 1.0)
    waste_co2 = 2.0 if checkin_data.unusual_waste else 0.5
    
    daily_co2 = round((mode_co2 + 3.0 * elec_mult + 3.5 * meat_mult + waste_co2), 1)

    record = DailyCheckIn(
        user_id=current_user.id,
        travel_mode=checkin_data.travel_mode,
        electricity_change=checkin_data.electricity_change,
        diet_meat=checkin_data.diet_meat,
        unusual_waste=checkin_data.unusual_waste,
        sustainable_act=checkin_data.sustainable_act,
        estimated_daily_co2=daily_co2
    )
    db.add(record)
    current_user.eco_points += 10
    current_user.streak_days += 1
    db.commit()

    return {
        "status": "Check-in recorded!",
        "daily_co2_kg": daily_co2,
        "eco_points_earned": 10,
        "current_streak_days": current_user.streak_days
    }

@router.get("/today")
def get_today_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    checkins = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == current_user.id).order_by(DailyCheckIn.date.desc()).all()
    if not checkins:
        return {
            "has_checkin": False,
            "streak_days": current_user.streak_days,
            "weekly_trend": [5.8, 6.2, 5.5, 6.0, 5.2, 6.4, 5.9]
        }
    
    latest = checkins[0]
    return {
        "has_checkin": True,
        "latest": {
            "date": latest.date.strftime("%b %d, %Y"),
            "travel_mode": latest.travel_mode,
            "daily_co2_kg": latest.estimated_daily_co2,
            "sustainable_act": latest.sustainable_act
        },
        "streak_days": current_user.streak_days,
        "weekly_trend": [c.estimated_daily_co2 for c in checkins[:7]][::-1]
    }
