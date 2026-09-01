from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CarbonData, BillScan
from app.schemas import TradeoffRequest
from app.auth import get_current_user
from app.ml_model import CarbonPredictor

router = APIRouter(prefix="/api/analytics", tags=["Advanced Analytics"])

@router.get("/impact-equivalents")
def get_impact_equivalents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    curr_total = latest.total_carbon_footprint if latest else 186.0

    return CarbonPredictor.calculate_carbon_equivalents(curr_total)

@router.get("/correlations")
def get_habit_correlations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.asc()).all()
    history_dicts = [{"monthly_electricity": r.monthly_electricity, "daily_distance": r.daily_distance} for r in records]

    return CarbonPredictor.calculate_habit_correlations(history_dicts)

@router.get("/data-quality")
def get_data_quality(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    data_dict = {
        "monthly_electricity": latest.monthly_electricity if latest else 200.0,
        "daily_distance": latest.daily_distance if latest else 25.0,
        "diet_type": latest.diet_type if latest else "Non-vegetarian",
        "plastic_waste_kg": latest.plastic_waste_kg if latest else 2.0
    }
    scans_count = db.query(BillScan).filter(BillScan.user_id == current_user.id, BillScan.verified == True).count()

    return CarbonPredictor.calculate_data_quality_score(data_dict, scans_count)

@router.get("/transparency-breakdown")
def get_transparency_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    if not latest:
        return {
            "has_data": False,
            "message": "Calculate your carbon footprint to view exact transparent calculations."
        }

    daily_km = latest.daily_distance
    monthly_km = round(daily_km * 30, 1)
    trans_factor = {"Petrol Car": 0.192, "Diesel Car": 0.171, "EV": 0.053, "Public Transit": 0.041, "Motorcycle": 0.103}.get(latest.transport_type, 0.15)
    trans_co2 = round(monthly_km * trans_factor, 1)

    kwh = latest.monthly_electricity
    elec_co2 = round(kwh * 0.82 + latest.ac_usage_hours * 30 * 1.2, 1)

    diet = latest.diet_type
    food_base = {"Non-vegetarian": 210.0, "Vegetarian": 120.0, "Vegan": 75.0}.get(diet, 140.0)

    waste_kg = latest.plastic_waste_kg
    waste_co2 = round(waste_kg * 4 * 3.1 + 35.0, 1)

    return {
        "has_data": True,
        "total_co2_kg": latest.total_carbon_footprint,
        "categories": {
            "Transportation": {
                "input": f"{daily_km} km/day × 30 days = {monthly_km} km/month",
                "emission_factor": f"{trans_factor} kg CO₂e/km ({latest.transport_type})",
                "formula": f"Monthly km ({monthly_km}) × Emission Factor ({trans_factor})",
                "calculated_co2_kg": trans_co2
            },
            "Electricity": {
                "input": f"{kwh} kWh/month + {latest.ac_usage_hours} hrs/day AC",
                "emission_factor": "0.82 kg CO₂e/kWh grid benchmark",
                "formula": f"Electricity kWh ({kwh}) × 0.82 + AC runtime impact",
                "calculated_co2_kg": elec_co2
            },
            "Food": {
                "input": f"{diet} diet preference with {latest.meals_per_day} meals/day",
                "emission_factor": f"{food_base} kg CO₂e baseline factor",
                "formula": f"Diet baseline factor ({food_base}) × meal scaling",
                "calculated_co2_kg": food_base
            },
            "Waste": {
                "input": f"{waste_kg} kg/week plastic waste with {latest.recycling_habit} recycling",
                "emission_factor": "3.1 kg CO₂e/kg plastic waste factor",
                "formula": "Plastic waste × 4 weeks × 3.1 + municipal base factor",
                "calculated_co2_kg": waste_co2
            }
        }
    }

@router.post("/tradeoff")
def analyze_tradeoff(
    req: TradeoffRequest,
    current_user: User = Depends(get_current_user)
):
    return CarbonPredictor.analyze_travel_tradeoffs(req.distance_km, req.priority)
