from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    terms_consented: bool = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    occupation: Optional[str] = None
    household_size: Optional[int] = None
    carbon_goal: Optional[float] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    profile_completed: bool = False
    profile_completion_pct: int = 20
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    occupation: Optional[str] = None
    household_size: Optional[int] = 1
    eco_points: int
    streak_days: int
    level: int
    carbon_goal: float
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Consent & Privacy Schemas
class ConsentUpdate(BaseModel):
    analytics_consent: bool
    ai_consent: bool
    org_consent: bool

class ConsentResponse(BaseModel):
    user_id: int
    analytics_consent: bool
    ai_consent: bool
    org_consent: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileVersionOut(BaseModel):
    id: int
    version_number: int
    profile_data_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Progressive Onboarding Step Schemas
class OnboardingStepRequest(BaseModel):
    step: int # 1 to 6
    data: Dict[str, Any]

class ProfileCompletenessResponse(BaseModel):
    completion_pct: int
    profile_completed: bool
    sections: Dict[str, bool] # {"basic": True, "transport": True, "energy": False, "food": False, "waste": True}
    missing_sections: List[str]

# Carbon Schemas
class CarbonInput(BaseModel):
    transport_type: str
    daily_distance: float
    fuel_type: str
    monthly_electricity: float
    ac_usage_hours: float
    appliance_usage: str
    diet_type: str
    meals_per_day: int
    plastic_waste_kg: float
    recycling_habit: str
    waste_generated_level: str
    flight_frequency: int
    water_usage_liters: float
    shopping_frequency: str

class CarbonRecordResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    transport_type: str
    daily_distance: float
    fuel_type: str
    monthly_electricity: float
    ac_usage_hours: float
    appliance_usage: str
    diet_type: str
    meals_per_day: int
    plastic_waste_kg: float
    recycling_habit: str
    waste_generated_level: str
    flight_frequency: int
    water_usage_liters: float
    shopping_frequency: str
    total_carbon_footprint: float
    breakdown_json: Dict[str, float]

    class Config:
        from_attributes = True

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    prediction_date: datetime
    predicted_emission: float
    highest_emission_source: str
    ai_recommendation: List[Dict[str, Any]]
    confidence_score: float

    class Config:
        from_attributes = True

class GamificationResponse(BaseModel):
    user_id: int
    eco_points: int
    streak_days: int
    level: int
    badges: List[Dict[str, Any]]
    completed_challenges: List[str]
    weekly_goal_kg: float

class RecommendationCreate(BaseModel):
    category: str
    title: str
    description: str
    potential_reduction_kg: float
    difficulty: str

class RecommendationResponse(RecommendationCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SimulatorInput(BaseModel):
    daily_distance: Optional[float] = None
    transport_type: Optional[str] = None
    monthly_electricity: Optional[float] = None
    ac_usage_hours: Optional[float] = None
    diet_type: Optional[str] = None
    recycling_habit: Optional[str] = None

class SimulatorResponse(BaseModel):
    current_emission: float
    simulated_emission: float
    potential_reduction: float
    reduction_percentage: float
    current_breakdown: Dict[str, float]
    simulated_breakdown: Dict[str, float]
    is_estimate: bool = True

class CarbonBudgetUpdate(BaseModel):
    monthly_budget: float

class CarbonBudgetResponse(BaseModel):
    monthly_budget: float
    used: float
    remaining: float
    target_reduction: float
    previous_month_emission: float
    predicted_next_month: float
    alert_message: str
    status: str

class Top3ActionItem(BaseModel):
    rank: int
    title: str
    icon: str
    current_behavior: str
    suggested_change: str
    estimated_reduction_kg: float
    reason: str

class Top3ActionsResponse(BaseModel):
    user_id: int
    top_3_actions: List[Top3ActionItem]

class UserGoalUpdate(BaseModel):
    target_reduction_pct: float

class UserGoalResponse(BaseModel):
    user_id: int
    target_reduction_pct: float
    baseline_co2: float
    target_co2: float
    current_co2: float
    reduction_achieved_kg: float
    remaining_reduction_kg: float
    progress_pct: float
    status: str

class OptimizationRequest(BaseModel):
    target_reduction_kg: float

class OptimizationResponse(BaseModel):
    target_reduction_kg: float
    recommended_combination: List[Dict[str, Any]]
    estimated_total_reduction_kg: float
    target_achieved: bool
    label: str = "Estimated potential reduction"

class BillConfirmRequest(BaseModel):
    doc_type: str
    units_extracted: float
    billing_period: str

class ModelPerformanceItem(BaseModel):
    model: str
    mae: float
    rmse: float
    r2_score: float
    status: str

class ModelPerformanceResponse(BaseModel):
    best_model: str
    models: List[ModelPerformanceItem]
    dataset_size: int = 0
    validation_size: int = 0
    last_trained: Optional[str] = None
    sufficient_data: bool = True
    error_message: Optional[str] = None

class DailyCheckInRequest(BaseModel):
    travel_mode: str = "Car"
    electricity_change: str = "Normal"
    diet_meat: str = "Normal"
    unusual_waste: bool = False
    sustainable_act: str = "None"

class ExperimentStartRequest(BaseModel):
    title: str
    predicted_reduction: float

class TradeoffRequest(BaseModel):
    distance_km: float = 10.0
    priority: str = "Balanced"

class HouseholdProfileRequest(BaseModel):
    member_count: int = 3
    household_electricity_kwh: float = 450.0
    vehicle_count: int = 1

class GoalFeasibilityResponse(BaseModel):
    target_reduction_pct: float
    is_feasible: bool
    recommended_target_pct: float
    status_message: str
    explanation: str

# Organization Analytics Schemas
class OrgSummaryResponse(BaseModel):
    total_users_included: int
    city_region: str
    average_footprint_co2: float
    transportation_pct: float
    electricity_pct: float
    food_pct: float
    waste_pct: float
    average_reduction_achieved_pct: float
    goal_meeting_user_pct: float
    privacy_notice: str

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details_json: Dict[str, Any]
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DataExportResponse(BaseModel):
    user_profile: Dict[str, Any]
    consent_settings: Dict[str, Any]
    carbon_history: List[Dict[str, Any]]
    predictions: List[Dict[str, Any]]
    exported_at: datetime

# Module 7: Carbon Savings Wallet
class CarbonWalletResponse(BaseModel):
    user_id: int
    total_co2_saved_kg: float
    monthly_co2_saved_kg: float
    actions_completed_count: int
    savings_breakdown: List[Dict[str, Any]]
    disclaimer: str = "All values represent estimated carbon reductions based on IPCC emission benchmarks."

# Module 14: Organization Campaigns
class OrgCampaignCreate(BaseModel):
    title: str
    description: str
    target_category: str = "Transportation"
    target_reduction_pct: float = 10.0
    duration_days: int = 30

class OrgCampaignResponse(BaseModel):
    id: int
    org_id: int
    title: str
    description: str
    target_category: str
    target_reduction_pct: float
    duration_days: int
    start_date: datetime
    status: str
    total_participants: int = 0
    estimated_co2_reduction_pct: float = 0.0

    class Config:
        from_attributes = True

# Module 15: Policy Impact Simulator
class PolicySimInput(BaseModel):
    scenario_type: str # 'public_transit', 'ev_adoption', 'renewable_electricity', 'recycling', 'food_waste'
    adoption_increase_pct: float = 10.0

class PolicySimResponse(BaseModel):
    scenario_type: str
    adoption_increase_pct: float
    estimated_sector_reduction_pct: float
    estimated_total_co2_reduction_kg: float
    estimated_percentage_change: float
    disclaimer: str = "Model-based estimate for sustainability decision-support. Not a guaranteed outcome."

# Module 16: AI Policy Recommendation
class PolicyRecResponse(BaseModel):
    highest_impact_category: str
    category_emission_share_pct: float
    policy_recommendation_title: str
    recommended_policy_action: str
    estimated_potential_reduction_pct: float
    rationale: str
    data_disclaimer: str = "Recommendations generated based on privacy-preserving aggregated organizational datasets."

# Module 22: Organization Goals
class OrgGoalCreate(BaseModel):
    title: str
    target_category: str = "Transportation"
    target_reduction_pct: float = 15.0

class OrgGoalResponse(BaseModel):
    id: int
    org_id: int
    title: str
    target_category: str
    target_reduction_pct: float
    baseline_value: float
    current_value: float
    target_value: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

