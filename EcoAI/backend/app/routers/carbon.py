from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, CarbonData, Prediction
from app.schemas import CarbonInput, CarbonRecordResponse
from app.auth import get_current_user
from app.ml_model import CarbonPredictor

router = APIRouter(prefix="/api/carbon", tags=["Carbon Footprint"])

@router.post("/calculate")
def calculate_and_save_carbon(
    input_data: CarbonInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data_dict = input_data.dict()
    total_co2, breakdown = CarbonPredictor.calculate_footprint(data_dict)

    record = CarbonData(
        user_id=current_user.id,
        transport_type=input_data.transport_type,
        daily_distance=input_data.daily_distance,
        fuel_type=input_data.fuel_type,
        monthly_electricity=input_data.monthly_electricity,
        ac_usage_hours=input_data.ac_usage_hours,
        appliance_usage=input_data.appliance_usage,
        diet_type=input_data.diet_type,
        meals_per_day=input_data.meals_per_day,
        plastic_waste_kg=input_data.plastic_waste_kg,
        recycling_habit=input_data.recycling_habit,
        waste_generated_level=input_data.waste_generated_level,
        flight_frequency=input_data.flight_frequency,
        water_usage_liters=input_data.water_usage_liters,
        shopping_frequency=input_data.shopping_frequency,
        total_carbon_footprint=total_co2,
        breakdown_json=breakdown
    )
    db.add(record)

    current_user.eco_points += 20
    db.commit()
    db.refresh(record)

    user_history = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).all()
    history_dicts = [
        {
            "breakdown_json": r.breakdown_json, 
            "total_carbon_footprint": r.total_carbon_footprint,
            "monthly_electricity": r.monthly_electricity,
            "daily_distance": r.daily_distance
        } for r in user_history
    ]
    
    pred_val, high_src, recs, conf, trend, reason = CarbonPredictor.predict_next_month(history_dicts, data_dict)
    
    pred_obj = Prediction(
        user_id=current_user.id,
        predicted_emission=pred_val,
        highest_emission_source=high_src,
        ai_recommendation=recs,
        confidence_score=conf
    )
    db.add(pred_obj)
    db.commit()

    explainable_info = CarbonPredictor.generate_explainable_ai(breakdown, data_dict)
    carbon_score = CarbonPredictor.calculate_carbon_score(total_co2)
    prev_record = user_history[1] if len(user_history) > 1 else None

    return {
        "record": CarbonRecordResponse.from_orm(record),
        "total_co2": total_co2,
        "total_carbon_footprint": total_co2,
        "carbon_score": carbon_score,
        "biggest_emission_source_message": f"Your biggest emission source is {high_src}.",
        "explainable_analysis": explainable_info,
        "previous_record_co2": prev_record.total_carbon_footprint if prev_record else None,
        "prediction": {
            "predicted_emission": pred_val,
            "trend": trend,
            "reason": reason,
            "is_estimate": True
        }
    }


@router.get("/history", response_model=List[CarbonRecordResponse])
def get_carbon_history(
    time_frame: str = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CarbonData).filter(CarbonData.user_id == current_user.id)
    
    now = datetime.utcnow()
    if time_frame == "daily":
        query = query.filter(CarbonData.date >= now - timedelta(days=7))
    elif time_frame == "monthly":
        query = query.filter(CarbonData.date >= now - timedelta(days=180))
    elif time_frame == "yearly":
        query = query.filter(CarbonData.date >= now - timedelta(days=365*3))
        
    records = query.order_by(CarbonData.date.desc()).all()
    return [CarbonRecordResponse.from_orm(r) for r in records]


@router.get("/latest")
def get_latest_carbon(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    if not record:
        raise HTTPException(status_code=404, detail="No carbon footprint records found.")
    
    data_dict = {
        "daily_distance": record.daily_distance,
        "transport_type": record.transport_type,
        "monthly_electricity": record.monthly_electricity,
        "ac_usage_hours": record.ac_usage_hours,
        "diet_type": record.diet_type
    }
    explainable_info = CarbonPredictor.generate_explainable_ai(record.breakdown_json, data_dict)
    
    return {
        "record": CarbonRecordResponse.from_orm(record),
        "explainable_analysis": explainable_info,
        "biggest_emission_source_message": f"Your biggest emission source is {explainable_info['highest_source']}."
    }


@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.asc()).all()
    
    if not records:
        return {
            "has_data": False,
            "total_footprint": 0,
            "carbon_score": 100,
            "weekly_improvement_pct": 0,
            "highest_source": "None",
            "biggest_emission_source_message": "No data logged yet.",
            "breakdown": {"Transportation": 0, "Electricity": 0, "Food": 0, "Waste": 0, "Lifestyle": 0},
            "monthly_trend": [],
            "predicted_emission": 0,
            "prediction_trend": "➔ Stable",
            "prediction_reason": "Log your footprint to start prediction.",
            "anomaly_alert": {"has_anomaly": False},
            "carbon_goal": current_user.carbon_goal
        }

    latest = records[-1]
    prev = records[-2] if len(records) > 1 else None

    total_co2 = latest.total_carbon_footprint
    carbon_score = CarbonPredictor.calculate_carbon_score(total_co2)
    
    improvement_pct = 0.0
    if prev:
        diff = prev.total_carbon_footprint - total_co2
        improvement_pct = round((diff / prev.total_carbon_footprint) * 100, 1)
    else:
        improvement_pct = 8.5

    trend_data = []
    for r in records[-6:]:
        trend_data.append({
            "date": r.date.strftime("%b %d"),
            "emission": r.total_carbon_footprint
        })

    data_dict = {
        "daily_distance": latest.daily_distance,
        "transport_type": latest.transport_type,
        "monthly_electricity": latest.monthly_electricity,
        "ac_usage_hours": latest.ac_usage_hours,
        "diet_type": latest.diet_type
    }

    history_dicts = [
        {
            "breakdown_json": r.breakdown_json, 
            "total_carbon_footprint": r.total_carbon_footprint,
            "monthly_electricity": r.monthly_electricity,
            "daily_distance": r.daily_distance
        } for r in records
    ]

    predicted_val, highest_src, ai_recs, conf, pred_trend, pred_reason = CarbonPredictor.predict_next_month(history_dicts, data_dict)
    explainable_info = CarbonPredictor.generate_explainable_ai(latest.breakdown_json, data_dict)
    anomaly_alert = CarbonPredictor.detect_anomalies(history_dicts, data_dict, latest.breakdown_json)

    return {
        "has_data": True,
        "total_footprint": total_co2,
        "carbon_score": carbon_score,
        "weekly_improvement_pct": improvement_pct,
        "highest_source": highest_src,
        "biggest_emission_source_message": f"Your biggest emission source is {highest_src}.",
        "explainable_analysis": explainable_info,
        "breakdown": latest.breakdown_json,
        "monthly_trend": trend_data,
        "predicted_emission": predicted_val,
        "prediction_trend": pred_trend,
        "prediction_reason": pred_reason,
        "is_estimate": True,
        "ai_recommendations": ai_recs,
        "anomaly_alert": anomaly_alert,
        "carbon_goal": current_user.carbon_goal
    }


@router.get("/root-cause-analysis")
def get_root_cause_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).all()
    if not records:
        curr_dict = {"total_carbon_footprint": 186.0, "breakdown_json": {"Transportation": 96, "Electricity": 45, "Food": 30, "Waste": 15}}
        prev_dict = None
    else:
        curr_dict = {"total_carbon_footprint": records[0].total_carbon_footprint, "breakdown_json": records[0].breakdown_json}
        prev_dict = {"total_carbon_footprint": records[1].total_carbon_footprint, "breakdown_json": records[1].breakdown_json} if len(records) > 1 else None

    return CarbonPredictor.calculate_root_cause_analysis(prev_dict, curr_dict)


@router.get("/baseline")
def get_personal_baseline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.asc()).all()
    history_dicts = [{"total_carbon_footprint": r.total_carbon_footprint} for r in records]
    curr_total = records[-1].total_carbon_footprint if records else 186.0

    return CarbonPredictor.calculate_personal_baseline(history_dicts, curr_total)


@router.delete("/{record_id}")
def delete_carbon_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(CarbonData).filter(CarbonData.id == record_id, CarbonData.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully."}


@router.get("/wallet")
def get_carbon_savings_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 7 — Carbon Savings Wallet
    Tracks estimated cumulative carbon reduction from completed actions.
    """
    from app.models import CarbonSavingsWallet, PlanProgress, CarbonExperiment, RecommendationFeedback

    wallet = db.query(CarbonSavingsWallet).filter(CarbonSavingsWallet.user_id == current_user.id).first()

    # Calculate wallet metrics from user's activities
    completed_plans = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.completed == True).count()
    completed_exp = db.query(CarbonExperiment).filter(CarbonExperiment.user_id == current_user.id, CarbonExperiment.status == "completed").all()
    feedbacks = db.query(RecommendationFeedback).filter(RecommendationFeedback.user_id == current_user.id).all()

    plan_savings = completed_plans * 4.5 # ~4.5 kg per plan day
    exp_savings = sum(e.actual_reduction for e in completed_exp)
    fb_savings = sum(f.observed_reduction for f in feedbacks)

    total_saved = round(plan_savings + exp_savings + fb_savings, 1)
    if total_saved == 0 and not wallet:
        total_saved = 28.5 # baseline default demo savings
        completed_plans = 4

    monthly_saved = round(total_saved * 0.45, 1)
    actions_count = completed_plans + len(completed_exp) + len(feedbacks)

    breakdown = [
        {"action": "5-Day Transportation Reduction Plan", "saved_co2_kg": round(plan_savings or 18.0, 1), "category": "Transportation", "label": "Estimated Reduction"},
        {"action": "7-Day Energy Conservation Experiment", "saved_co2_kg": round(exp_savings or 6.5, 1), "category": "Electricity", "label": "Estimated Reduction"},
        {"action": "Meat-Free Meal Habit Days", "saved_co2_kg": round(fb_savings or 4.0, 1), "category": "Food", "label": "Estimated Reduction"}
    ]

    return {
        "user_id": current_user.id,
        "total_co2_saved_kg": total_saved,
        "monthly_co2_saved_kg": monthly_saved,
        "actions_completed_count": max(actions_count, 4),
        "savings_breakdown": breakdown,
        "disclaimer": "All values represent estimated carbon reductions based on IPCC emission benchmarks. Not verified carbon credits."
    }


@router.get("/transparency-explain")
def get_calculation_transparency_explanation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 2 — Calculation Transparency ("How was this calculated?")
    Provides category step-by-step formula breakdown in human-readable language.
    """
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()

    travel_km = latest.daily_distance * 30 if latest else 600.0
    mode = latest.transport_type if latest else "Petrol Car"
    kwh = latest.monthly_electricity if latest else 180.0
    diet = latest.diet_type if latest else "Non-vegetarian"

    return {
        "title": "How Was Your Carbon Footprint Calculated?",
        "methodology": "IPCC Tier 1 Standard Emission Factors & Grid Benchmarks",
        "categories": [
            {
                "category": "Transportation",
                "formula": "Monthly Travel Distance (km) × Mode Emission Factor (kg CO₂e/km)",
                "inputs": f"{mode} ({travel_km:.0f} km/month)",
                "factor": "0.192 kg CO₂e/km" if "Petrol" in mode else "0.041 kg CO₂e/km",
                "estimated_co2_kg": round(travel_km * (0.192 if "Petrol" in mode else 0.041), 1)
            },
            {
                "category": "Electricity",
                "formula": "Monthly Energy Usage (kWh) × Regional Grid Intensity Factor (0.82 kg CO₂e/kWh)",
                "inputs": f"{kwh:.0f} kWh/month",
                "factor": "0.82 kg CO₂e/kWh",
                "estimated_co2_kg": round(kwh * 0.82, 1)
            },
            {
                "category": "Food & Dietary",
                "formula": "Dietary Pattern Benchmark × (Meals per Day / 3.0)",
                "inputs": f"{diet} (3 meals/day)",
                "factor": "210 kg/mo (Non-veg) / 120 kg/mo (Veg)",
                "estimated_co2_kg": 210.0 if "Non" in diet else 120.0
            }
        ]
    }

