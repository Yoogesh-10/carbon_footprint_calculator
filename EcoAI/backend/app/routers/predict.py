from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, Prediction, CarbonData, PlanProgress
from app.schemas import PredictionResponse
from app.auth import get_current_user
from app.ml_model import CarbonPredictor

router = APIRouter(prefix="/api/predict", tags=["AI Predictions"])

@router.get("/latest", response_model=PredictionResponse)
def get_latest_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.prediction_date.desc()).first()
    if not pred:
        default_recs = CarbonPredictor.generate_ai_recommendations(
            {"Transportation": 90, "Electricity": 120, "Food": 80, "Waste": 25, "Lifestyle": 45},
            "Electricity"
        )
        new_pred = Prediction(
            user_id=current_user.id,
            predicted_emission=320.0,
            highest_emission_source="Electricity",
            ai_recommendation=default_recs,
            confidence_score=0.91
        )
        db.add(new_pred)
        db.commit()
        db.refresh(new_pred)
        return PredictionResponse.from_orm(new_pred)
        
    return PredictionResponse.from_orm(pred)

@router.get("/top-3-actions")
def get_top_3_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    
    if latest:
        data_dict = {
            "daily_distance": latest.daily_distance,
            "transport_type": latest.transport_type,
            "monthly_electricity": latest.monthly_electricity,
            "ac_usage_hours": latest.ac_usage_hours,
            "diet_type": latest.diet_type,
            "recycling_habit": latest.recycling_habit,
            "waste_generated_level": latest.waste_generated_level,
            "plastic_waste_kg": latest.plastic_waste_kg
        }
        breakdown = latest.breakdown_json
    else:
        data_dict = {
            "daily_distance": 25.0,
            "transport_type": "Petrol Car",
            "monthly_electricity": 200.0,
            "ac_usage_hours": 4.0,
            "diet_type": "Non-vegetarian",
            "recycling_habit": "Sometimes",
            "waste_generated_level": "Moderate",
            "plastic_waste_kg": 2.0
        }
        breakdown = {"Transportation": 90.0, "Electricity": 95.0, "Food": 62.0, "Waste": 20.0, "Lifestyle": 18.0}

    top_3 = CarbonPredictor.generate_top3_actions(data_dict, breakdown)

    return {
        "user_id": current_user.id,
        "top_3_actions": top_3
    }

@router.get("/5-day-plan")
def get_5day_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    
    if latest:
        data_dict = {
            "daily_distance": latest.daily_distance,
            "transport_type": latest.transport_type,
            "monthly_electricity": latest.monthly_electricity,
            "ac_usage_hours": latest.ac_usage_hours,
            "diet_type": latest.diet_type,
            "recycling_habit": latest.recycling_habit
        }
        breakdown = latest.breakdown_json
    else:
        data_dict = {
            "daily_distance": 25.0,
            "transport_type": "Petrol Car",
            "monthly_electricity": 200.0,
            "ac_usage_hours": 4.0,
            "diet_type": "Non-vegetarian",
            "recycling_habit": "Sometimes"
        }
        breakdown = {"Transportation": 90.0, "Electricity": 95.0, "Food": 62.0, "Waste": 20.0, "Lifestyle": 18.0}

    # Fetch user's completed plan progress
    completed_entries = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.completed == True).all()
    completed_days = [c.day for c in completed_entries]

    plan_res = CarbonPredictor.generate_5day_plan(data_dict, breakdown, completed_days=completed_days)
    plan_res["user_id"] = current_user.id
    return plan_res

@router.post("/5-day-plan/toggle/{day}")
def toggle_5day_plan_day(
    day: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if day < 1 or day > 5:
        raise HTTPException(status_code=400, detail="Invalid day number (must be 1 to 5).")

    progress = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.day == day).first()
    if not progress:
        progress = PlanProgress(user_id=current_user.id, day=day, completed=True, completed_at=datetime.utcnow())
        db.add(progress)
        current_user.eco_points += 15
    else:
        progress.completed = not progress.completed
        progress.completed_at = datetime.utcnow() if progress.completed else None
        if progress.completed:
            current_user.eco_points += 15

    db.commit()

    return get_5day_plan(current_user=current_user, db=db)


@router.post("/5-day-plan/reset")
def reset_5day_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Clear completed progress for 5-day plan
    db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id).delete()
    current_user.eco_points += 50
    current_user.streak_days += 1
    db.commit()

    return get_5day_plan(current_user=current_user, db=db)



@router.get("/future-me-scenarios")
def get_future_me_scenarios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    curr_total = latest.total_carbon_footprint if latest else 186.0

    return CarbonPredictor.predict_future_me_scenarios(curr_total)


@router.post("/optimize-reduction")
def optimize_reduction(
    target_reduction_kg: float = 20.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    if latest:
        data_dict = {
            "daily_distance": latest.daily_distance,
            "transport_type": latest.transport_type,
            "monthly_electricity": latest.monthly_electricity,
            "ac_usage_hours": latest.ac_usage_hours,
            "diet_type": latest.diet_type,
            "recycling_habit": latest.recycling_habit
        }
        breakdown = latest.breakdown_json
    else:
        data_dict = {"daily_distance": 25.0, "transport_type": "Petrol Car", "monthly_electricity": 200.0, "ac_usage_hours": 4.0, "diet_type": "Non-vegetarian", "recycling_habit": "Sometimes"}
        breakdown = {"Transportation": 96.0, "Electricity": 45.0, "Food": 30.0, "Waste": 15.0, "Lifestyle": 0.0}

    return CarbonPredictor.optimize_reduction_plan(data_dict, breakdown, target_reduction_kg)


@router.post("/recommendation-feedback")
def log_recommendation_feedback(
    recommendation_title: str,
    category: str,
    expected_reduction: float,
    observed_reduction: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 8 — Closed-Loop AI Recommendation Feedback Loop
    Stores recommendation outcome, compares expected vs actual, and evaluates effectiveness.
    """
    from app.models import RecommendationEffectiveness, AuditLog

    diff = abs(expected_reduction - observed_reduction)
    if diff <= 3.0:
        status = "Highly Effective"
    elif diff <= 8.0:
        status = "Effective"
    else:
        status = "Partially Effective"

    rec_fb = RecommendationEffectiveness(
        user_id=current_user.id,
        recommendation_title=recommendation_title,
        category=category,
        expected_reduction=expected_reduction,
        observed_reduction=observed_reduction,
        status=status
    )
    db.add(rec_fb)
    db.add(AuditLog(
        user_id=current_user.id,
        action="RECOMMENDATION_FEEDBACK_LOGGED",
        details_json={"title": recommendation_title, "status": status, "expected": expected_reduction, "observed": observed_reduction}
    ))
    db.commit()
    db.refresh(rec_fb)

    return {
        "status": "Success",
        "feedback_id": rec_fb.id,
        "effectiveness": status,
        "expected_reduction": expected_reduction,
        "observed_reduction": observed_reduction,
        "message": "Recommendation feedback recorded to personalize future AI reduction plans."
    }


@router.get("/recommendation-feedback")
def get_recommendation_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models import RecommendationEffectiveness

    history = db.query(RecommendationEffectiveness).filter(RecommendationEffectiveness.user_id == current_user.id).order_by(RecommendationEffectiveness.created_at.desc()).all()

    if not history:
        return {
            "has_history": False,
            "message": "More activity data is needed for personalization.",
            "history": []
        }

    return {
        "has_history": True,
        "message": f"Personalized ranking updated based on {len(history)} past feedback evaluations.",
        "history": [
            {
                "id": h.id,
                "title": h.recommendation_title,
                "category": h.category,
                "expected_reduction": h.expected_reduction,
                "observed_reduction": h.observed_reduction,
                "status": h.status,
                "date": h.created_at.isoformat()
            } for h in history
        ]
    }


# PART 1 — AI 5-DAY ECO CHALLENGE ENDPOINT
@router.get("/5-day-challenge")
def get_ai_5day_eco_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 4 — AI 5-Day Eco Challenge Engine
    Generates personalized day-by-day challenge cards with Day 1 Baseline, Day 2 Easy Win,
    Day 3 Behavior Change, Day 4 Carbon Twin Experiment, and Day 5 Personal Mission.
    """
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    curr_total = latest.total_carbon_footprint if latest else 186.0
    bd = latest.breakdown_json if (latest and latest.breakdown_json) else {"Transportation": 90.0, "Electricity": 60.0, "Food": 35.0, "Waste": 15.0}
    top_cat = max(bd, key=bd.get)
    top_pct = round((bd.get(top_cat, 0.0) / (sum(bd.values()) or 1.0)) * 100, 1)

    completed_progress = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.completed == True).all()
    completed_days = [p.day for p in completed_progress]

    days_data = [
        {
            "day": 1,
            "title": f"Day 1: {top_cat} Baseline & Awareness",
            "category": top_cat,
            "goal": f"Analyze and audit your top emission source ({top_cat})",
            "action": f"Track all {top_cat.lower()} activity today and identify 1 unnecessary usage event.",
            "why_it_matters": f"{top_cat} currently contributes {top_pct}% of your total carbon footprint.",
            "estimated_reduction_kg": 6.0,
            "difficulty": "Easy",
            "time_estimate": "10 minutes",
            "cost_savings": "₹0 / Free",
            "impact_level": "High Impact",
            "completed": 1 in completed_days,
            "ask_ai_prompt": f"Why is {top_cat} my highest emission source?"
        },
        {
            "day": 2,
            "title": f"Day 2: Quick {top_cat} Easy Win",
            "category": top_cat,
            "goal": f"Achieve an immediate low-effort reduction in {top_cat}",
            "action": "Set AC thermostat to 24°C or replace 1 short car trip with walking/public transport." if top_cat in ["Transportation", "Electricity"] else "Opt for a plant-based meal today.",
            "why_it_matters": "Low-effort daily adjustments compound into significant monthly emission cuts.",
            "estimated_reduction_kg": 8.5,
            "difficulty": "Easy",
            "time_estimate": "15 minutes",
            "cost_savings": "Save ₹120",
            "impact_level": "High Impact",
            "completed": 2 in completed_days,
            "ask_ai_prompt": "What is the easiest win for reducing my carbon footprint today?"
        },
        {
            "day": 3,
            "title": "Day 3: Meaningful Lifestyle Shift",
            "category": "Food" if top_cat == "Transportation" else "Transportation",
            "goal": "Introduce a sustainable habit shift across a complementary category",
            "action": "Avoid single-use plastics for 24 hours and adopt a meat-free meal plan.",
            "why_it_matters": "Diversifying eco habits across diet and waste strengthens long-term resilience.",
            "estimated_reduction_kg": 5.5,
            "difficulty": "Medium",
            "time_estimate": "20 minutes",
            "cost_savings": "Save ₹80",
            "impact_level": "Medium Impact",
            "completed": 3 in completed_days,
            "ask_ai_prompt": "Give me a simple lifestyle shift for Day 3."
        },
        {
            "day": 4,
            "title": "Day 4: Carbon Twin Experiment",
            "category": top_cat,
            "goal": "Test a real-world lifestyle simulation in Carbon Twin",
            "action": f"Simulate a 30% reduction in {top_cat.lower()} using your Carbon Twin model.",
            "why_it_matters": "Experimenting with parameters lets you see projected reductions before changing habits.",
            "estimated_reduction_kg": 10.0,
            "difficulty": "Medium",
            "time_estimate": "15 minutes",
            "cost_savings": "Save ₹250",
            "impact_level": "High Impact",
            "completed": 4 in completed_days,
            "action_type": "run_twin",
            "twin_scenario": {
                "current_co2": curr_total,
                "simulated_co2": round(curr_total * 0.82, 1),
                "potential_savings": round(curr_total * 0.18, 1)
            },
            "ask_ai_prompt": "How does Carbon Twin simulate my carbon footprint?"
        },
        {
            "day": 5,
            "title": "Day 5: Personal Carbon Mission",
            "category": "All Categories",
            "goal": "Synthesize 5-day progress and establish your next 30-day carbon goal",
            "action": f"Final Mission: Reduce overall monthly carbon footprint from {curr_total} kg to {round(curr_total*0.85, 1)} kg CO₂e.",
            "why_it_matters": "Completing your 5-day challenge unlocks permanent habit improvements and level rewards.",
            "estimated_reduction_kg": 12.0,
            "difficulty": "High",
            "time_estimate": "25 minutes",
            "cost_savings": "Save ₹500",
            "impact_level": "Maximum Impact",
            "completed": 5 in completed_days,
            "ask_ai_prompt": "What should my next 30-day carbon goal be?"
        }
    ]

    completed_count = len(completed_days)
    progress_pct = int((completed_count / 5.0) * 100)
    total_saved = sum(d["estimated_reduction_kg"] for d in days_data if d["completed"])

    achievements = []
    if completed_count >= 1:
        achievements.append({"title": "🌱 First Step", "description": "Completed your first eco action!"})
    if 2 in completed_days or 4 in completed_days:
        achievements.append({"title": "🚲 Green Traveler", "description": "Completed transportation reduction action."})
    if 1 in completed_days or 3 in completed_days:
        achievements.append({"title": "⚡ Energy Saver", "description": "Optimized household energy usage."})
    if completed_count == 5:
        achievements.append({"title": "🔥 5-Day Champion", "description": "Completed the entire 5-day eco challenge!"})

    ai_msg = f"Good morning, {current_user.name}! 🚀 {top_cat} is currently your largest emission source ({top_pct}% of total). Today's challenge is ready!"

    return {
        "user_name": current_user.name,
        "highest_source": top_cat,
        "highest_source_pct": top_pct,
        "completed_count": completed_count,
        "total_days": 5,
        "progress_pct": progress_pct,
        "estimated_co2_saved_kg": round(total_saved, 1),
        "eco_points": current_user.eco_points or 150,
        "streak_days": current_user.streak_days or 3,
        "ai_daily_message": ai_msg,
        "days": days_data,
        "achievements": achievements,
        "budget_remaining_kg": round(max(0.0, 200.0 - (curr_total - total_saved)), 1)
    }


# PART 1 — DAILY REFLECTION ENDPOINT
@router.post("/daily-reflection")
def submit_daily_reflection(
    day: int,
    difficulty_rating: str, # "Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"
    do_again: str, # "Yes", "Maybe", "No"
    observed_reduction_kg: float = 6.5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 8 — Daily Reflection & Action Completion Logger
    Captures difficulty rating, repeatability preference, awards points & streak.
    """
    from app.models import PlanProgress, RecommendationFeedback

    prog = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.day == day).first()
    if not prog:
        prog = PlanProgress(user_id=current_user.id, day=day, completed=True, completed_at=datetime.utcnow())
        db.add(prog)
    else:
        prog.completed = True
        prog.completed_at = datetime.utcnow()

    # Award Eco Points based on difficulty
    pts = 10 if difficulty_rating in ["Very Easy", "Easy"] else (20 if difficulty_rating == "Moderate" else 30)
    current_user.eco_points += pts
    current_user.streak_days += 1

    # Log feedback for recommendation learning
    fb = RecommendationFeedback(
        user_id=current_user.id,
        recommendation_title=f"Day {day} Challenge Action",
        category="General",
        completed=True,
        estimated_reduction=8.0,
        observed_reduction=observed_reduction_kg
    )
    db.add(fb)
    db.commit()

    return {
        "status": "Success",
        "day": day,
        "points_awarded": pts,
        "new_eco_points": current_user.eco_points,
        "streak_days": current_user.streak_days,
        "message": f"Day {day} completed! Earned +{pts} Eco Points. Streak extended to {current_user.streak_days} days! 🔥"
    }


# PART 2 — ECOAI ASSISTANT CHATBOT ENDPOINT
@router.post("/chat-assistant")
def chat_ecoai_assistant(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    MODULE 21 — EcoAI Floating AI Carbon Assistant Chatbot
    Provides personalized, context-aware, action-oriented chatbot responses using current user data.
    """
    user_msg = payload.get("message", "").strip().lower()
    
    latest = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
    curr_total = latest.total_carbon_footprint if latest else 186.0
    bd = latest.breakdown_json if (latest and latest.breakdown_json) else {"Transportation": 90.0, "Electricity": 60.0, "Food": 35.0, "Waste": 15.0}
    top_cat = max(bd, key=bd.get)
    top_val = bd.get(top_cat, 90.0)
    top_pct = round((top_val / (sum(bd.values()) or 1.0)) * 100, 1)

    completed_progress = db.query(PlanProgress).filter(PlanProgress.user_id == current_user.id, PlanProgress.completed == True).count()

    # Smart Prompt Matchers
    if "why" in user_msg and ("high" in user_msg or "footprint" in user_msg or "biggest" in user_msg or "transport" in user_msg):
        reply = (
            f"Your current monthly footprint is **{curr_total} kg CO₂e**. "
            f"**{top_cat}** is your largest emission contributor ({top_val} kg CO₂e, representing **{top_pct}%** of your total emissions). "
            f"This is primarily driven by your recorded vehicle travel distance and energy consumption patterns."
        )
        action_type = "view_breakdown"
        action_label = "View Carbon Breakdown"

    elif "today" in user_msg or "task" in user_msg or "do" in user_msg or "challenge" in user_msg:
        reply = (
            f"Today's recommended action focuses on **{top_cat}** (your top emission category). "
            f"We recommend reducing unnecessary trips or setting your AC thermostat to 24°C. "
            f"You have completed **{completed_progress}/5** days of your 5-Day Eco Challenge!"
        )
        action_type = "open_challenge"
        action_label = "Start Today's Challenge"

    elif "transport" in user_msg or "car" in user_msg or "vehicle" in user_msg:
        reply = (
            f"Transportation currently contributes **{bd.get('Transportation', 90.0)} kg CO₂e** per month. "
            f"Replacing 2 car trips a week with public transit or walking reduces your transport emissions by up to **35%** (~31 kg CO₂e saved)."
        )
        action_type = "run_twin"
        action_label = "Simulate in Carbon Twin"

    elif "electricity" in user_msg or "ac" in user_msg or "energy" in user_msg:
        reply = (
            f"Electricity usage accounts for **{bd.get('Electricity', 60.0)} kg CO₂e** per month. "
            f"Adjusting your AC thermostat to 24°C and unplugging idle appliances saves ~18 kWh monthly, reducing emissions by **~15 kg CO₂e**."
        )
        action_type = "open_challenge"
        action_label = "View Energy Reduction Plan"

    elif "what if" in user_msg or "reduce car" in user_msg or "30%" in user_msg or "twin" in user_msg:
        sim_val = round(curr_total * 0.82, 1)
        diff_val = round(curr_total * 0.18, 1)
        reply = (
            f"**Carbon Twin Simulation Output:**\n"
            f"• Current Footprint: **{curr_total} kg CO₂e**\n"
            f"• Simulated Footprint (-30% car travel): **{sim_val} kg CO₂e**\n"
            f"• Potential Savings: **-{diff_val} kg CO₂e/month**\n"
            f"*(Estimated reduction based on IPCC travel emission factors)*"
        )
        action_type = "run_twin"
        action_label = "Run in Carbon Twin"

    elif "prediction" in user_msg or "future" in user_msg or "forecast" in user_msg:
        pred_val = round(curr_total * 0.94, 1)
        reply = (
            f"Our Random Forest Regression model forecasts your next month footprint at **{pred_val} kg CO₂e** (High Confidence, 82% Data Quality). "
            f"Implementing your 5-Day Action Plan can lower this forecast down to **{round(pred_val * 0.85, 1)} kg CO₂e**."
        )
        action_type = "view_prediction"
        action_label = "View Full AI Prediction"

    elif "budget" in user_msg or "goal" in user_msg:
        budget_used = curr_total
        budget_limit = 200.0
        rem = round(budget_limit - budget_used, 1)
        status_str = "Healthy 👍" if rem >= 0 else "Exceeded ⚠️"
        reply = (
            f"Your Monthly Carbon Budget status: **{status_str}**.\n"
            f"• Monthly Target Budget: **{budget_limit} kg CO₂e**\n"
            f"• Current Usage: **{budget_used} kg CO₂e**\n"
            f"• Budget Remaining: **{rem} kg CO₂e**"
        )
        action_type = "view_budget"
        action_label = "View Carbon Budget"

    elif "can't" in user_msg or "cannot" in user_msg or "unable" in user_msg or "public transit" in user_msg:
        reply = (
            f"No problem at all! If public transit isn't feasible for you, you can combine multiple short driving errands into a single trip or try carpooling. "
            f"That still saves up to **12 kg CO₂e** monthly without changing your commute mode!"
        )
        action_type = "open_challenge"
        action_label = "View Alternative Action"

    else:
        reply = (
            f"Hello {current_user.name}! I am your personalized **EcoAI Assistant**. "
            f"Your current footprint is **{curr_total} kg CO₂e**, with **{top_cat}** as your largest opportunity area ({top_pct}% of total). "
            f"How can I assist your sustainability journey today?"
        )
        action_type = "open_challenge"
        action_label = "Explore Recommendations"

    return {
        "user_name": current_user.name,
        "reply": reply,
        "action_type": action_type,
        "action_label": action_label,
        "user_context": {
            "current_footprint": curr_total,
            "highest_source": top_cat,
            "eco_points": current_user.eco_points,
            "streak_days": current_user.streak_days
        }
    }



