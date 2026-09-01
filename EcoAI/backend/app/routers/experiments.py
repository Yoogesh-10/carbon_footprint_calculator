from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, CarbonExperiment
from app.schemas import ExperimentStartRequest
from app.auth import get_current_user

router = APIRouter(prefix="/api/experiments", tags=["Carbon Experiments"])

PREBUILT_EXPERIMENTS = [
    {
        "id": "exp_1",
        "title": "No car for 7 days",
        "description": "Switch all personal driving trips to public transport, biking, or walking for 1 week.",
        "predicted_reduction_kg": 15.0,
        "difficulty": "Medium"
    },
    {
        "id": "exp_2",
        "title": "Reduce AC usage for 7 days",
        "description": "Set AC thermostat to 24°C and limit daily operation duration by 2 hours for 1 week.",
        "predicted_reduction_kg": 8.0,
        "difficulty": "Easy"
    },
    {
        "id": "exp_3",
        "title": "Use public transport for one week",
        "description": "Swap private vehicle commute for bus or metro transit.",
        "predicted_reduction_kg": 12.0,
        "difficulty": "Medium"
    },
    {
        "id": "exp_4",
        "title": "Reduce food waste for one week",
        "description": "Plan meals, store food properly, and compost organic scraps for 7 days.",
        "predicted_reduction_kg": 6.0,
        "difficulty": "Easy"
    }
]

@router.get("/available")
def get_available_experiments():
    return {"experiments": PREBUILT_EXPERIMENTS}

@router.post("/start")
def start_experiment(
    req: ExperimentStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    active = db.query(CarbonExperiment).filter(CarbonExperiment.user_id == current_user.id, CarbonExperiment.status == "active").first()
    if active:
        raise HTTPException(status_code=400, detail="You already have an active carbon experiment running!")

    exp = CarbonExperiment(
        user_id=current_user.id,
        title=req.title,
        predicted_reduction=req.predicted_reduction,
        status="active",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=7)
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    return {
        "status": "Started 7-Day Carbon Experiment!",
        "experiment_id": exp.id,
        "title": exp.title,
        "predicted_reduction_kg": exp.predicted_reduction
    }

@router.get("/active")
def get_active_experiment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    active = db.query(CarbonExperiment).filter(CarbonExperiment.user_id == current_user.id, CarbonExperiment.status == "active").first()
    if not active:
        return {"has_active": False}

    days_passed = (datetime.utcnow() - active.start_date).days + 1
    return {
        "has_active": True,
        "experiment": {
            "id": active.id,
            "title": active.title,
            "duration_days": active.duration_days,
            "days_passed": min(7, days_passed),
            "predicted_reduction_kg": active.predicted_reduction,
            "start_date": active.start_date.strftime("%b %d"),
            "end_date": active.end_date.strftime("%b %d") if active.end_date else ""
        }
    }

@router.post("/complete/{exp_id}")
def complete_experiment(
    exp_id: int,
    actual_reduction_kg: float = 13.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(CarbonExperiment).filter(CarbonExperiment.id == exp_id, CarbonExperiment.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    exp.status = "completed"
    exp.actual_reduction = actual_reduction_kg
    diff = round(actual_reduction_kg - exp.predicted_reduction, 1)

    if diff > 0:
        feedback_msg = f"Your experiment achieved a higher reduction than predicted (+{diff} kg CO₂e extra saved!)"
    elif diff < 0:
        feedback_msg = f"Your experiment saved {actual_reduction_kg} kg CO₂e, close to predicted target."
    else:
        feedback_msg = "Your experiment matched predicted carbon reduction exactly!"

    current_user.eco_points += 50
    db.commit()

    return {
        "status": "Experiment Completed!",
        "predicted_reduction_kg": exp.predicted_reduction,
        "actual_reduction_kg": actual_reduction_kg,
        "difference_kg": diff,
        "feedback_message": feedback_msg,
        "eco_points_earned": 50
    }
