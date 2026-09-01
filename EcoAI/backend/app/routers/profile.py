from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, ProfileVersion, CarbonData, HouseholdProfile, AuditLog
from app.schemas import UserProfileUpdate, UserResponse, OnboardingStepRequest, ProfileCompletenessResponse, ProfileVersionOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile Management & Onboarding"])

def calculate_user_completeness(user: User, db: Session) -> ProfileCompletenessResponse:
    latest_carbon = db.query(CarbonData).filter(CarbonData.user_id == user.id).order_by(CarbonData.date.desc()).first()
    latest_household = db.query(HouseholdProfile).filter(HouseholdProfile.user_id == user.id).first()

    has_basic = bool(user.name and user.email and user.age and user.city)
    has_transport = bool(latest_carbon and latest_carbon.transport_type and latest_carbon.daily_distance > 0)
    has_energy = bool(latest_carbon and latest_carbon.monthly_electricity > 0 and latest_carbon.ac_usage_hours >= 0)
    has_food = bool(latest_carbon and latest_carbon.diet_type and latest_carbon.meals_per_day > 0)
    has_waste = bool(latest_carbon and latest_carbon.recycling_habit and latest_carbon.waste_generated_level)

    sections = {
        "basic": has_basic,
        "transportation": has_transport,
        "energy": has_energy,
        "food": has_food,
        "waste": has_waste
    }

    completed_count = sum(1 for v in sections.values() if v)
    total_sections = len(sections)
    completion_pct = int((completed_count / total_sections) * 100)
    
    # Always at least 20% for registered users
    if completion_pct < 20:
        completion_pct = 20

    missing_sections = [k.capitalize() for k, v in sections.items() if not v]
    profile_completed = completed_count == total_sections

    return ProfileCompletenessResponse(
        completion_pct=completion_pct,
        profile_completed=profile_completed,
        sections=sections,
        missing_sections=missing_sections
    )


@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)


@router.get("/completeness", response_model=ProfileCompletenessResponse)
def get_profile_completeness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comp = calculate_user_completeness(current_user, db)
    current_user.profile_completion_pct = comp.completion_pct
    current_user.profile_completed = comp.profile_completed
    db.commit()
    return comp


@router.post("/onboarding-step", response_model=UserResponse)
def submit_onboarding_step(
    step_req: OnboardingStepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    step = step_req.step
    data = step_req.data

    if step == 1: # Basic Profile
        if "age" in data and data["age"]: current_user.age = int(data["age"])
        if "gender" in data: current_user.gender = data["gender"]
        if "city" in data: current_user.city = data["city"]
        if "occupation" in data: current_user.occupation = data["occupation"]
        if "household_size" in data and data["household_size"]: current_user.household_size = int(data["household_size"])

    elif step in [2, 3, 4, 5]: # Transport, Energy, Food, Waste
        # Update or create CarbonData baseline snapshot
        latest_carbon = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).order_by(CarbonData.date.desc()).first()
        if not latest_carbon:
            latest_carbon = CarbonData(
                user_id=current_user.id,
                transport_type=data.get("transport_type", "Petrol Car"),
                daily_distance=float(data.get("daily_distance", 20.0)),
                fuel_type=data.get("fuel_type", "Petrol"),
                monthly_electricity=float(data.get("monthly_electricity", 180.0)),
                ac_usage_hours=float(data.get("ac_usage_hours", 4.0)),
                appliance_usage=data.get("appliance_usage", "Medium"),
                diet_type=data.get("diet_type", "Non-vegetarian"),
                meals_per_day=int(data.get("meals_per_day", 3)),
                plastic_waste_kg=float(data.get("plastic_waste_kg", 2.0)),
                recycling_habit=data.get("recycling_habit", "Sometimes"),
                waste_generated_level=data.get("waste_generated_level", "Moderate"),
                flight_frequency=int(data.get("flight_frequency", 1)),
                water_usage_liters=float(data.get("water_usage_liters", 150.0)),
                shopping_frequency=data.get("shopping_frequency", "Moderate"),
                total_carbon_footprint=186.0,
                breakdown_json={"Transportation": 96.0, "Electricity": 45.0, "Food": 30.0, "Waste": 15.0}
            )
            db.add(latest_carbon)
        else:
            if step == 2:
                if "transport_type" in data: latest_carbon.transport_type = data["transport_type"]
                if "daily_distance" in data: latest_carbon.daily_distance = float(data["daily_distance"])
                if "fuel_type" in data: latest_carbon.fuel_type = data["fuel_type"]
            elif step == 3:
                if "monthly_electricity" in data: latest_carbon.monthly_electricity = float(data["monthly_electricity"])
                if "ac_usage_hours" in data: latest_carbon.ac_usage_hours = float(data["ac_usage_hours"])
                if "appliance_usage" in data: latest_carbon.appliance_usage = data["appliance_usage"]
            elif step == 4:
                if "diet_type" in data: latest_carbon.diet_type = data["diet_type"]
                if "meals_per_day" in data: latest_carbon.meals_per_day = int(data["meals_per_day"])
            elif step == 5:
                if "waste_generated_level" in data: latest_carbon.waste_generated_level = data["waste_generated_level"]
                if "recycling_habit" in data: latest_carbon.recycling_habit = data["recycling_habit"]

    elif step == 6: # Preferences & Goal
        if "carbon_goal" in data and data["carbon_goal"]:
            current_user.carbon_goal = float(data["carbon_goal"])

    # Calculate updated completeness
    comp = calculate_user_completeness(current_user, db)
    current_user.profile_completion_pct = comp.completion_pct
    current_user.profile_completed = comp.profile_completed

    # Create new profile version record
    ver_count = db.query(ProfileVersion).filter(ProfileVersion.user_id == current_user.id).count()
    new_ver = ProfileVersion(
        user_id=current_user.id,
        version_number=ver_count + 1,
        profile_data_json={
            "step_completed": step,
            "age": current_user.age,
            "city": current_user.city,
            "gender": current_user.gender,
            "household_size": current_user.household_size,
            "carbon_goal": current_user.carbon_goal,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(new_ver)

    # Audit Log
    db.add(AuditLog(user_id=current_user.id, action="ONBOARDING_STEP_COMPLETED", details_json={"step": step}))

    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)


@router.put("/", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None: current_user.name = profile_data.name
    if profile_data.phone is not None: current_user.phone = profile_data.phone
    if profile_data.age is not None: current_user.age = profile_data.age
    if profile_data.gender is not None: current_user.gender = profile_data.gender
    if profile_data.city is not None: current_user.city = profile_data.city
    if profile_data.occupation is not None: current_user.occupation = profile_data.occupation
    if profile_data.household_size is not None: current_user.household_size = profile_data.household_size
    if profile_data.carbon_goal is not None: current_user.carbon_goal = profile_data.carbon_goal

    # Re-evaluate profile completeness
    comp = calculate_user_completeness(current_user, db)
    current_user.profile_completion_pct = comp.completion_pct
    current_user.profile_completed = comp.profile_completed

    # Create version update
    ver_count = db.query(ProfileVersion).filter(ProfileVersion.user_id == current_user.id).count()
    new_ver = ProfileVersion(
        user_id=current_user.id,
        version_number=ver_count + 1,
        profile_data_json={
            "name": current_user.name,
            "phone": current_user.phone,
            "age": current_user.age,
            "city": current_user.city,
            "gender": current_user.gender,
            "occupation": current_user.occupation,
            "household_size": current_user.household_size,
            "carbon_goal": current_user.carbon_goal,
            "updated_at": datetime.utcnow().isoformat()
        }
    )
    db.add(new_ver)
    db.add(AuditLog(user_id=current_user.id, action="PROFILE_UPDATED", details_json={"version": ver_count + 1}))

    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)


@router.get("/versions", response_model=list[ProfileVersionOut])
def get_profile_versions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    versions = db.query(ProfileVersion).filter(ProfileVersion.user_id == current_user.id).order_by(ProfileVersion.version_number.desc()).all()
    return versions
