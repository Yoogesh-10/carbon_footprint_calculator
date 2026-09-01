from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from app.database import get_db
from app.models import User, Gamification, GreenStreak
from app.schemas import GamificationResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/gamification", tags=["Gamification"])

ALL_BADGES = [
    {
        "id": "beginner",
        "title": "Beginner",
        "icon": "🌱",
        "category": "General",
        "description": "Calculated first carbon footprint profile."
    },
    {
        "id": "green_starter",
        "title": "Green Starter",
        "icon": "🌿",
        "category": "Streak",
        "description": "Maintained a 3-day green carbon reduction streak."
    },
    {
        "id": "eco_warrior",
        "title": "Eco Warrior",
        "icon": "🌳",
        "category": "Streak",
        "description": "Reached a 7-day green streak and 250+ Eco Points."
    },
    {
        "id": "climate_champion",
        "title": "Climate Champion",
        "icon": "🌍",
        "category": "Milestone",
        "description": "Mastered 14-day green streak & top reduction goals."
    }
]

WEEKLY_CHALLENGES = [
    {
        "id": "ch_public_transit",
        "title": "Use public transport twice this week",
        "icon": "🚌",
        "points": 50,
        "description": "Commute via public transit or electric bus twice to cut solo car trip emissions."
    },
    {
        "id": "ch_reduce_electricity",
        "title": "Reduce unnecessary electricity usage",
        "icon": "💡",
        "points": 40,
        "description": "Unplug standby electronics and keep thermostat at 24°C all week."
    },
    {
        "id": "ch_recycle_waste",
        "title": "Recycle household waste",
        "icon": "♻️",
        "points": 35,
        "description": "Separate 100% of dry plastic, glass, and cardboard recyclables."
    },
    {
        "id": "ch_walk_cycle",
        "title": "Walk or cycle for short-distance trips",
        "icon": "🚶",
        "points": 45,
        "description": "Choose active walking or cycling for trips under 3 km."
    }
]

@router.get("/", response_model=GamificationResponse)
def get_gamification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = db.query(Gamification).filter(Gamification.user_id == current_user.id).first()
    if not g:
        g = Gamification(
            user_id=current_user.id,
            badges=["beginner"],
            completed_challenges=[],
            weekly_goal_kg=250.0,
            eco_points=max(150, current_user.eco_points),
            streak_days=max(7, current_user.streak_days)
        )
        db.add(g)
        db.commit()
        db.refresh(g)

    # Ensure green streak record exists
    gs = db.query(GreenStreak).filter(GreenStreak.user_id == current_user.id).first()
    if not gs:
        gs = GreenStreak(
            user_id=current_user.id,
            current_streak=current_user.streak_days or 7,
            longest_streak=max(7, current_user.streak_days or 7),
            eco_points=current_user.eco_points or 150
        )
        db.add(gs)
        db.commit()

    # Dynamic badge unlock check based on points & streak
    unlocked_ids = list(g.badges or ["beginner"])
    if "beginner" not in unlocked_ids:
        unlocked_ids.append("beginner")
    if (gs.current_streak >= 3 or current_user.eco_points >= 100) and "green_starter" not in unlocked_ids:
        unlocked_ids.append("green_starter")
    if (gs.current_streak >= 7 or current_user.eco_points >= 250) and "eco_warrior" not in unlocked_ids:
        unlocked_ids.append("eco_warrior")
    if (gs.current_streak >= 14 or current_user.eco_points >= 500) and "climate_champion" not in unlocked_ids:
        unlocked_ids.append("climate_champion")

    g.badges = unlocked_ids
    db.commit()

    formatted_badges = []
    for b in ALL_BADGES:
        item = b.copy()
        item["unlocked"] = b["id"] in unlocked_ids
        formatted_badges.append(item)

    return {
        "user_id": current_user.id,
        "eco_points": current_user.eco_points,
        "streak_days": gs.current_streak,
        "level": current_user.level,
        "badges": formatted_badges,
        "completed_challenges": g.completed_challenges or [],
        "weekly_goal_kg": g.weekly_goal_kg
    }

@router.get("/streak")
def get_green_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gs = db.query(GreenStreak).filter(GreenStreak.user_id == current_user.id).first()
    if not gs:
        gs = GreenStreak(
            user_id=current_user.id,
            current_streak=current_user.streak_days or 7,
            longest_streak=max(7, current_user.streak_days or 7),
            eco_points=current_user.eco_points or 150
        )
        db.add(gs)
        db.commit()
        db.refresh(gs)

    g = db.query(Gamification).filter(Gamification.user_id == current_user.id).first()
    completed = g.completed_challenges if g else []

    return {
        "current_streak": gs.current_streak,
        "longest_streak": gs.longest_streak,
        "eco_points": current_user.eco_points,
        "weekly_progress": len(completed),
        "total_weekly_challenges": len(WEEKLY_CHALLENGES),
        "unlocked_badges": g.badges if g else ["beginner"]
    }

@router.get("/challenges")
def get_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = db.query(Gamification).filter(Gamification.user_id == current_user.id).first()
    completed = g.completed_challenges if g else []
    
    result = []
    for ch in WEEKLY_CHALLENGES:
        item = ch.copy()
        item["completed"] = ch["id"] in completed
        result.append(item)
    return result

@router.post("/claim-challenge/{challenge_id}")
def claim_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ch = next((c for c in WEEKLY_CHALLENGES if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    g = db.query(Gamification).filter(Gamification.user_id == current_user.id).first()
    if not g:
        g = Gamification(user_id=current_user.id, badges=["beginner"], completed_challenges=[])
        db.add(g)

    completed = list(g.completed_challenges or [])
    if challenge_id in completed:
        raise HTTPException(status_code=400, detail="Challenge already claimed.")

    completed.append(challenge_id)
    g.completed_challenges = completed
    
    # Award points & increment streak
    current_user.eco_points += ch["points"]
    g.eco_points = current_user.eco_points

    gs = db.query(GreenStreak).filter(GreenStreak.user_id == current_user.id).first()
    if not gs:
        gs = GreenStreak(user_id=current_user.id, current_streak=7, longest_streak=7, eco_points=current_user.eco_points)
        db.add(gs)
    
    gs.current_streak += 1
    gs.longest_streak = max(gs.longest_streak, gs.current_streak)
    gs.eco_points = current_user.eco_points
    current_user.streak_days = gs.current_streak

    # Check level up
    new_level = (current_user.eco_points // 100) + 1
    current_user.level = max(current_user.level, new_level)

    db.commit()
    return {
        "message": f"Successfully completed challenge! +{ch['points']} Eco Points awarded.",
        "new_points": current_user.eco_points,
        "current_streak": gs.current_streak,
        "level": current_user.level
    }

