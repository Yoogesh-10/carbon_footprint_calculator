from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, CarbonData, CarbonBudget, Prediction, UserGoal
from app.schemas import CarbonBudgetUpdate, CarbonBudgetResponse, UserGoalUpdate, UserGoalResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/budget", tags=["Carbon Budget & Goals"])

@router.get("/", response_model=CarbonBudgetResponse)
def get_carbon_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    b = db.query(CarbonBudget).filter(CarbonBudget.user_id == current_user.id).first()
    if not b:
        b = CarbonBudget(
            user_id=current_user.id,
            monthly_budget=current_user.carbon_goal or 180.0,
            current_usage=0.0,
            target_reduction=20.0
        )
        db.add(b)
        db.commit()
        db.refresh(b)

    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).all()
    
    current_usage = records[0].total_carbon_footprint if records else 142.0
    prev_month_usage = records[1].total_carbon_footprint if len(records) > 1 else (current_usage * 1.1)

    pred = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.prediction_date.desc()).first()
    predicted_next_month = pred.predicted_emission if pred else round(current_usage * 0.94, 1)

    b.current_usage = current_usage
    db.commit()

    monthly_budget = b.monthly_budget
    remaining = max(0.0, round(monthly_budget - current_usage, 2))

    if current_usage > monthly_budget:
        alert_message = "EXCEEDED: Your emissions have exceeded your monthly carbon budget limit!"
        status = "EXCEEDED"
    elif predicted_next_month > monthly_budget:
        alert_message = "WARNING: Based on your current behavior, you may exceed your monthly carbon budget."
        status = "WARNING"
    elif current_usage > (monthly_budget * 0.85):
        alert_message = "WARNING: You are close to exceeding your monthly carbon budget limit."
        status = "WARNING"
    else:
        alert_message = "SAFE: Great! You are currently within your safe monthly carbon budget target."
        status = "SAFE"

    return {
        "monthly_budget": monthly_budget,
        "used": current_usage,
        "remaining": remaining,
        "target_reduction": b.target_reduction,
        "previous_month_emission": prev_month_usage,
        "predicted_next_month": predicted_next_month,
        "alert_message": alert_message,
        "status": status
    }

@router.post("/target", response_model=CarbonBudgetResponse)
def update_budget_target(
    data: CarbonBudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.monthly_budget <= 0:
        raise HTTPException(status_code=400, detail="Monthly carbon budget must be greater than 0.")

    b = db.query(CarbonBudget).filter(CarbonBudget.user_id == current_user.id).first()
    if not b:
        b = CarbonBudget(user_id=current_user.id, monthly_budget=data.monthly_budget)
        db.add(b)
    else:
        b.monthly_budget = data.monthly_budget

    current_user.carbon_goal = data.monthly_budget
    db.commit()
    db.refresh(b)

    return get_carbon_budget(current_user=current_user, db=db)

# Feature 5: Personalized 30-Day Goal endpoints
@router.get("/goal", response_model=UserGoalResponse)
def get_30_day_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).all()
    latest_co2 = records[0].total_carbon_footprint if records else 186.0
    baseline_co2 = records[-1].total_carbon_footprint if len(records) > 1 else max(186.0, latest_co2 * 1.1)

    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()
    if not goal:
        target_pct = 15.0
        target_co2 = round(baseline_co2 * (1 - target_pct / 100.0), 1)
        goal = UserGoal(
            user_id=current_user.id,
            target_reduction_pct=target_pct,
            baseline_co2=baseline_co2,
            target_co2=target_co2
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

    target_co2 = round(goal.baseline_co2 * (1 - goal.target_reduction_pct / 100.0), 1)
    reduction_achieved = max(0.0, round(goal.baseline_co2 - latest_co2, 1))
    target_reduction_needed = max(0.1, round(goal.baseline_co2 - target_co2, 1))
    remaining_reduction = max(0.0, round(latest_co2 - target_co2, 1))

    progress_pct = min(100.0, round((reduction_achieved / target_reduction_needed) * 100, 1))

    if progress_pct >= 100:
        status = "Goal Achieved! 🎉"
    elif progress_pct >= 50:
        status = "On Track 👍"
    else:
        status = "In Progress 🚀"

    return {
        "user_id": current_user.id,
        "target_reduction_pct": goal.target_reduction_pct,
        "baseline_co2": goal.baseline_co2,
        "target_co2": target_co2,
        "current_co2": latest_co2,
        "reduction_achieved_kg": reduction_achieved,
        "remaining_reduction_kg": remaining_reduction,
        "progress_pct": progress_pct,
        "status": status
    }

@router.post("/goal", response_model=UserGoalResponse)
def update_30_day_goal(
    data: UserGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.target_reduction_pct <= 0 or data.target_reduction_pct > 80:
        raise HTTPException(status_code=400, detail="Target reduction percentage must be between 1% and 80%.")

    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).all()
    latest_co2 = records[0].total_carbon_footprint if records else 186.0

    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()
    if not goal:
        goal = UserGoal(
            user_id=current_user.id,
            target_reduction_pct=data.target_reduction_pct,
            baseline_co2=latest_co2,
            target_co2=round(latest_co2 * (1 - data.target_reduction_pct / 100.0), 1)
        )
        db.add(goal)
    else:
        goal.target_reduction_pct = data.target_reduction_pct
        goal.baseline_co2 = latest_co2
        goal.target_co2 = round(latest_co2 * (1 - data.target_reduction_pct / 100.0), 1)

    db.commit()

    return get_30_day_goal(current_user=current_user, db=db)
