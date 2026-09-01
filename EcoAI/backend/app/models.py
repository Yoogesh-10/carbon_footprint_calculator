from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    terms_consented = Column(Boolean, default=True)
    profile_completed = Column(Boolean, default=False)
    profile_completion_pct = Column(Integer, default=20)
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    city = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)
    household_size = Column(Integer, default=1)
    role = Column(String(20), default="user") # 'user', 'admin', 'organization'
    is_demo = Column(Boolean, default=False)
    eco_points = Column(Integer, default=150)
    streak_days = Column(Integer, default=3)
    level = Column(Integer, default=1)
    carbon_goal = Column(Float, default=300.0) # kg CO2 target per month
    created_at = Column(DateTime, default=datetime.utcnow)

    carbon_records = relationship("CarbonData", back_populates="owner", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="owner", cascade="all, delete-orphan")
    gamification = relationship("Gamification", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    consent = relationship("ConsentRecord", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    profile_versions = relationship("ProfileVersion", back_populates="owner", cascade="all, delete-orphan")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    analytics_consent = Column(Boolean, default=False)
    ai_consent = Column(Boolean, default=False)
    org_consent = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="consent")


class ProfileVersion(Base):
    __tablename__ = "profile_versions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version_number = Column(Integer, default=1)
    profile_data_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="profile_versions")


class CarbonData(Base):
    __tablename__ = "carbon_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    profile_version_id = Column(Integer, ForeignKey("profile_versions.id"), nullable=True)
    
    # Transportation
    transport_type = Column(String(50), nullable=False) # Petrol Car, Diesel Car, EV, Public Transit, Motorcycle
    daily_distance = Column(Float, nullable=False) # km
    fuel_type = Column(String(50), nullable=False)

    # Electricity
    monthly_electricity = Column(Float, nullable=False) # kWh
    ac_usage_hours = Column(Float, nullable=False) # hours/day
    appliance_usage = Column(String(50), nullable=False) # Low, Medium, High

    # Food
    diet_type = Column(String(50), nullable=False) # Vegetarian, Non-vegetarian, Vegan
    meals_per_day = Column(Integer, nullable=False)

    # Waste
    plastic_waste_kg = Column(Float, nullable=False) # kg/week
    recycling_habit = Column(String(50), nullable=False) # Never, Sometimes, Always
    waste_generated_level = Column(String(50), nullable=False) # Low, Moderate, High

    # Lifestyle
    flight_frequency = Column(Integer, nullable=False) # flights per year
    water_usage_liters = Column(Float, nullable=False) # liters/day
    shopping_frequency = Column(String(50), nullable=False) # Low, Moderate, High

    # Total calculated footprint & breakdown
    total_carbon_footprint = Column(Float, nullable=False) # kg CO2e / month
    breakdown_json = Column(JSON, nullable=False) # breakdown by category

    owner = relationship("User", back_populates="carbon_records")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    predicted_emission = Column(Float, nullable=False) # next month predicted kg CO2e
    highest_emission_source = Column(String(100), nullable=False)
    ai_recommendation = Column(JSON, nullable=False) # list of recommendation items
    confidence_score = Column(Float, default=0.92)

    owner = relationship("User", back_populates="predictions")


class Gamification(Base):
    __tablename__ = "gamification"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    badges = Column(JSON, default=list) # e.g. ["Eco Warrior", "Transit Champ"]
    completed_challenges = Column(JSON, default=list)
    weekly_goal_kg = Column(Float, default=250.0)
    eco_points = Column(Integer, default=150)
    streak_days = Column(Integer, default=3)

    owner = relationship("User", back_populates="gamification")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    potential_reduction_kg = Column(Float, nullable=False)
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard
    created_at = Column(DateTime, default=datetime.utcnow)


class CarbonBudget(Base):
    __tablename__ = "carbon_budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    monthly_budget = Column(Float, nullable=False, default=180.0)
    current_usage = Column(Float, default=0.0)
    target_reduction = Column(Float, default=20.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SimulationRecord(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_emission = Column(Float, nullable=False)
    simulated_emission = Column(Float, nullable=False)
    reduction = Column(Float, nullable=False)
    simulation_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    target = Column(String(100), nullable=True)
    eco_points = Column(Integer, default=50)
    duration = Column(String(50), default="Weekly")


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    status = Column(String(30), default="pending") # pending, completed
    progress = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)


class GreenStreak(Base):
    __tablename__ = "green_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    eco_points = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserGoal(Base):
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    target_reduction_pct = Column(Float, default=15.0) # e.g. 15% reduction goal
    baseline_co2 = Column(Float, nullable=False, default=186.0)
    target_co2 = Column(Float, nullable=False, default=158.0)
    start_date = Column(DateTime, default=datetime.utcnow)
    duration_days = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlanProgress(Base):
    __tablename__ = "plan_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day = Column(Integer, nullable=False) # 1 to 5
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)


class BillScan(Base):
    __tablename__ = "bill_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False) # Electricity, Fuel, Ticket
    extracted_data_json = Column(JSON, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    completed = Column(Boolean, default=True)
    estimated_reduction = Column(Float, nullable=False)
    observed_reduction = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    travel_mode = Column(String(50), default="Car") # Car, Bike, Bus, Train, Walk
    electricity_change = Column(String(30), default="Normal") # Normal, Higher, Lower
    diet_meat = Column(String(30), default="Normal") # Normal, More, Less
    unusual_waste = Column(Boolean, default=False)
    sustainable_act = Column(String(100), default="None")
    estimated_daily_co2 = Column(Float, default=6.2)


class CarbonExperiment(Base):
    __tablename__ = "carbon_experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    duration_days = Column(Integer, default=7)
    predicted_reduction = Column(Float, nullable=False)
    actual_reduction = Column(Float, default=0.0)
    status = Column(String(30), default="active") # active, completed, cancelled
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)


class HouseholdProfile(Base):
    __tablename__ = "household_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    member_count = Column(Integer, default=3)
    household_electricity_kwh = Column(Float, default=450.0)
    vehicle_count = Column(Integer, default=1)
    total_household_co2 = Column(Float, default=720.0)
    per_person_co2 = Column(Float, default=240.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PredictionEvaluation(Base):
    __tablename__ = "prediction_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    predicted_co2 = Column(Float, nullable=False)
    actual_co2 = Column(Float, nullable=False)
    error_kg = Column(Float, nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)


class RecommendationEffectiveness(Base):
    __tablename__ = "recommendation_effectiveness"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    expected_reduction = Column(Float, nullable=False)
    observed_reduction = Column(Float, nullable=False)
    status = Column(String(30), default="Effective") # Effective, Partially Effective, Ineffective
    created_at = Column(DateTime, default=datetime.utcnow)


class OrganizationAccount(Base):
    __tablename__ = "organization_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    org_name = Column(String(150), nullable=False)
    region = Column(String(100), default="Chennai")
    industry = Column(String(100), default="Sustainability & Gov")
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), nullable=False)
    model_type = Column(String(50), default="RandomForestRegressor")
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2_score = Column(Float, nullable=False)
    train_size = Column(Integer, nullable=False)
    val_size = Column(Integer, nullable=False)
    trained_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details_json = Column(JSON, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)


class CarbonSavingsWallet(Base):
    __tablename__ = "carbon_savings_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_co2_saved_kg = Column(Float, default=0.0)
    monthly_co2_saved_kg = Column(Float, default=0.0)
    actions_completed_count = Column(Integer, default=0)
    savings_breakdown_json = Column(JSON, default=list) # [{action, saved_kg, date, category}]
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrgCampaign(Base):
    __tablename__ = "org_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    target_category = Column(String(50), default="Transportation")
    target_reduction_pct = Column(Float, default=10.0)
    duration_days = Column(Integer, default=30)
    start_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), default="active") # active, completed, draft


class CampaignParticipant(Base):
    __tablename__ = "campaign_participants"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("org_campaigns.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)


class OrgGoal(Base):
    __tablename__ = "org_goals"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    target_category = Column(String(50), default="Transportation")
    target_reduction_pct = Column(Float, default=15.0)
    baseline_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=False)
    status = Column(String(30), default="on_track") # on_track, completed, needs_attention
    created_at = Column(DateTime, default=datetime.utcnow)

