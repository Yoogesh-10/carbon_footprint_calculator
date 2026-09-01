from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CarbonData, SimulationRecord
from app.schemas import SimulatorInput, SimulatorResponse
from app.auth import get_current_user
from app.ml_model import CarbonPredictor

router = APIRouter(prefix="/api/simulator", tags=["What-If Simulator"])

DEFAULT_BASELINE = {
    "transport_type": "Petrol Car",
    "daily_distance": 25.0,
    "fuel_type": "Petrol",
    "monthly_electricity": 200.0,
    "ac_usage_hours": 4.0,
    "appliance_usage": "Medium",
    "diet_type": "Non-vegetarian",
    "meals_per_day": 3,
    "plastic_waste_kg": 2.0,
    "recycling_habit": "Sometimes",
    "waste_generated_level": "Moderate",
    "flight_frequency": 1,
    "water_usage_liters": 100.0,
    "shopping_frequency": "Moderate"
}

@router.post("/run", response_model=SimulatorResponse)
def run_simulation(
    input_data: SimulatorInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user's latest actual carbon record for baseline
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    
    if latest:
        baseline = {
            "transport_type": latest.transport_type,
            "daily_distance": latest.daily_distance,
            "fuel_type": latest.fuel_type,
            "monthly_electricity": latest.monthly_electricity,
            "ac_usage_hours": latest.ac_usage_hours,
            "appliance_usage": latest.appliance_usage,
            "diet_type": latest.diet_type,
            "meals_per_day": latest.meals_per_day,
            "plastic_waste_kg": latest.plastic_waste_kg,
            "recycling_habit": latest.recycling_habit,
            "waste_generated_level": latest.waste_generated_level,
            "flight_frequency": latest.flight_frequency,
            "water_usage_liters": latest.water_usage_liters,
            "shopping_frequency": latest.shopping_frequency
        }
    else:
        baseline = DEFAULT_BASELINE.copy()

    adjustments = input_data.dict(exclude_unset=True)
    res = CarbonPredictor.simulate_what_if(baseline, adjustments)

    # Store simulation log into `simulations` table without touching actual footprint
    sim_log = SimulationRecord(
        user_id=current_user.id,
        original_emission=res["current_emission"],
        simulated_emission=res["simulated_emission"],
        reduction=res["potential_reduction"],
        simulation_data=adjustments
    )
    db.add(sim_log)
    db.commit()

    return res

@router.get("/baseline")
def get_simulation_baseline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    if latest:
        return {
            "has_data": True,
            "daily_distance": latest.daily_distance,
            "transport_type": latest.transport_type,
            "monthly_electricity": latest.monthly_electricity,
            "ac_usage_hours": latest.ac_usage_hours,
            "diet_type": latest.diet_type,
            "recycling_habit": latest.recycling_habit,
            "total_footprint": latest.total_carbon_footprint
        }
    return {
        "has_data": False,
        "daily_distance": 25.0,
        "transport_type": "Petrol Car",
        "monthly_electricity": 200.0,
        "ac_usage_hours": 4.0,
        "diet_type": "Non-vegetarian",
        "recycling_habit": "Sometimes",
        "total_footprint": 186.0
    }
