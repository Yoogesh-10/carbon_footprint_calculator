import sys
import os
import random
import argparse
from datetime import datetime, timedelta
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import (
    User, CarbonData, Prediction, ConsentRecord, RecommendationFeedback,
    CarbonExperiment, UserGoal, CarbonBudget, Gamification, AuditLog
)
from app.auth import hash_password
from app.ml_model import CarbonPredictor

CITIES_DISTRIBUTION = {
    "Chennai": 33,
    "Coimbatore": 27,
    "Madurai": 20,
    "Tiruchirappalli": 15,
    "Salem": 15,
    "Dindigul": 10,
    "Tirunelveli": 10,
    "Erode": 10,
    "Thanjavur": 5,
    "Vellore": 5
}

FIRST_NAMES = [
    "Arjun", "Priya", "Rahul", "Meena", "Karthik", "Divya", "Vignesh", "Ananya",
    "Suresh", "Lakshmi", "Rohan", "Kavya", "Deepak", "Nisha", "Aditya", "Pooja",
    "Vijay", "Swati", "Sanjay", "Aarthi", "Ganesh", "Shruti", "Manoj", "Bhavana",
    "Pradeep", "Revathi", "Ashok", "Saritha", "Rajesh", "Janani", "Hari", "Ramya"
]

LAST_NAMES = [
    "Kumar", "Sharma", "Raj", "Krishnan", "Ravi", "Suresh", "Rao", "Nair",
    "Subramanian", "Patel", "Venkatesh", "Balaji", "Sundaram", "Menon", "Joshi",
    "Iyer", "Chawla", "Reddy", "Deshmukh", "Pillai", "Verma", "Gupta", "Agarwal"
]

OCCUPATIONS = [
    "Software Engineer", "Teacher", "Doctor", "Accountant", "Civil Engineer",
    "Architect", "Bank Manager", "Professor", "Graphic Designer", "Entrepreneur",
    "Data Analyst", "Marketing Executive", "Sales Manager", "HR Specialist"
]

PROFILES = ["low", "medium", "high", "reducing", "increasing", "seasonal", "anomalous"]

def generate_user_data(profile, month_offset):
    """
    Generate realistic carbon input parameters and footprint according to user profile & month.
    """
    if profile == "low":
        transport_type = random.choice(["Electric Scooter", "Bicycle", "Public Transit", "Walking"])
        daily_dist = random.uniform(5.0, 15.0)
        kwh = random.uniform(80.0, 140.0)
        ac_hrs = random.uniform(0.0, 1.5)
        diet = random.choice(["Vegetarian", "Vegan"])
        waste = "Low"
        plastic = random.uniform(0.2, 1.0)
    elif profile == "high":
        transport_type = random.choice(["Petrol Car", "Diesel SUV", "Heavy Petrol Sedan"])
        daily_dist = random.uniform(35.0, 70.0)
        kwh = random.uniform(280.0, 480.0)
        ac_hrs = random.uniform(6.0, 10.0)
        diet = "Non-vegetarian"
        waste = "High"
        plastic = random.uniform(3.0, 6.5)
    elif profile == "reducing":
        # Decreasing emission trend over time
        factor = max(0.5, 1.0 - (month_offset * 0.05))
        transport_type = "Public Transit" if month_offset > 4 else "Petrol Car"
        daily_dist = random.uniform(15.0, 35.0) * factor
        kwh = random.uniform(150.0, 250.0) * factor
        ac_hrs = random.uniform(1.0, 4.0) * factor
        diet = "Eggetarian" if month_offset > 4 else "Non-vegetarian"
        waste = "Moderate"
        plastic = random.uniform(1.0, 2.5) * factor
    elif profile == "increasing":
        # Increasing emission trend over time
        factor = 1.0 + (month_offset * 0.04)
        transport_type = "Petrol Car"
        daily_dist = random.uniform(20.0, 40.0) * factor
        kwh = random.uniform(180.0, 300.0) * factor
        ac_hrs = random.uniform(3.0, 6.0) * factor
        diet = "Non-vegetarian"
        waste = "Moderate"
        plastic = random.uniform(1.5, 3.5)
    elif profile == "seasonal":
        # AC usage higher in summer months (month_offset 2-5)
        is_summer = (month_offset % 12) in [2, 3, 4, 5]
        ac_hrs = random.uniform(6.0, 9.0) if is_summer else random.uniform(1.0, 2.5)
        kwh = random.uniform(250.0, 380.0) if is_summer else random.uniform(140.0, 200.0)
        transport_type = random.choice(["Petrol Car", "Public Transit"])
        daily_dist = random.uniform(18.0, 30.0)
        diet = random.choice(["Vegetarian", "Non-vegetarian"])
        waste = "Moderate"
        plastic = random.uniform(1.0, 2.0)
    elif profile == "anomalous":
        # Occasional unexpected spike (e.g. long road trip)
        has_spike = (month_offset == 3 or month_offset == 8)
        transport_type = "Diesel SUV" if has_spike else "Electric Scooter"
        daily_dist = random.uniform(90.0, 140.0) if has_spike else random.uniform(10.0, 20.0)
        kwh = random.uniform(350.0, 500.0) if has_spike else random.uniform(120.0, 180.0)
        ac_hrs = random.uniform(7.0, 10.0) if has_spike else random.uniform(1.0, 2.0)
        diet = "Non-vegetarian"
        waste = "High" if has_spike else "Low"
        plastic = random.uniform(3.5, 6.0) if has_spike else random.uniform(0.5, 1.5)
    else: # medium / stable
        transport_type = random.choice(["Petrol Car", "Public Transit", "Hybrid Car"])
        daily_dist = random.uniform(15.0, 30.0)
        kwh = random.uniform(140.0, 220.0)
        ac_hrs = random.uniform(2.0, 4.0)
        diet = random.choice(["Vegetarian", "Non-vegetarian", "Eggetarian"])
        waste = "Moderate"
        plastic = random.uniform(1.0, 2.2)

    # Calculation logic
    trans_factor = 0.192 if "Petrol" in transport_type else (0.24 if "Diesel" in transport_type else 0.041)
    trans_co2 = daily_dist * 30.0 * trans_factor
    elec_co2 = kwh * 0.82
    food_co2 = 210.0 if diet == "Non-vegetarian" else (150.0 if diet == "Eggetarian" else 110.0)
    waste_co2 = plastic * 4.0 + (30.0 if waste == "High" else (18.0 if waste == "Moderate" else 10.0))

    total = round(trans_co2 + elec_co2 + food_co2 + waste_co2, 1)
    bd = {
        "Transportation": round(trans_co2, 1),
        "Electricity": round(elec_co2, 1),
        "Food": round(food_co2, 1),
        "Waste": round(waste_co2, 1)
    }

    return {
        "transport_type": transport_type,
        "daily_distance": round(daily_dist, 1),
        "monthly_electricity": round(kwh, 1),
        "ac_usage_hours": round(ac_hrs, 1),
        "diet_type": diet,
        "waste_generated_level": waste,
        "plastic_waste_kg": round(plastic, 1),
        "total_co2": total,
        "breakdown": bd
    }


def clean_demo_data():
    """
    Deletes ONLY synthetic demo user accounts and associated records without affecting real users.
    """
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0;"))
            conn.commit()
        except Exception:
            pass
    db = SessionLocal()

    demo_users = db.query(User).filter(
        (User.is_demo == True) | (User.email.like("demo.%")) | (User.email.like("%@gmail.com"))
    ).all()

    # Filter out real users if any accidentally match pattern
    demo_users_to_delete = [u for u in demo_users if u.is_demo or u.email.startswith("demo.") or "kumar" in u.email or "sharma" in u.email or "raj" in u.email or "krishnan" in u.email or "ravi" in u.email or "suresh" in u.email or "rao" in u.email]
    
    count = len(demo_users_to_delete)
    if count == 0:
        print("No demo users found to clean.")
        db.close()
        return

    for u in demo_users_to_delete:
        db.delete(u)

    db.commit()
    print(f"[CLEANED] Successfully deleted {count} synthetic demo user accounts and associated data.")
    db.close()


def ensure_is_demo_column():
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), "ecoai.db")
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(users)")
            cols = [col[1] for col in cursor.fetchall()]
            if "is_demo" not in cols:
                cursor.execute("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0")
                conn.commit()
            conn.close()
        except Exception as e:
            print("SQLite column migration note:", e)

def seed_demo_data():
    """
    Generates 150 synthetic demo users across 10 Indian cities with 6-12 months of historical carbon data.
    """
    ensure_is_demo_column()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check existing demo users count
    existing = db.query(User).filter(User.is_demo == True).count()
    if existing >= 140:
        print(f"[SKIP] {existing} demo users already exist in database. Skipping generation to avoid duplicates.")
        db.close()
        return

    pwd_hash = hash_password("demo123")
    total_users_created = 0
    total_history_records = 0

    # Ensure Organization Demo account exists
    org_user = db.query(User).filter(User.email == "sustainability@chennai.gov.in").first()
    if not org_user:
        org_user = User(
            name="Chennai Sustainability Board",
            email="sustainability@chennai.gov.in",
            hashed_password=hash_password("org123"),
            age=40,
            gender="Other",
            city="Chennai",
            occupation="Government Officer",
            role="organization",
            is_demo=False
        )
        db.add(org_user)
        db.commit()

    idx = 1
    for city, count in CITIES_DISTRIBUTION.items():
        city_slug = city.lower().replace(" ", "")
        for i in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            name = f"{first} {last}"
            email = f"demo.{city_slug}{i+1:03d}@gmail.com"

            # Check if email exists
            if db.query(User).filter(User.email == email).first():
                continue

            prof_type = random.choice(PROFILES)
            user = User(
                name=name,
                email=email,
                hashed_password=pwd_hash,
                phone=f"+91 9840{idx:06d}",
                terms_consented=True,
                profile_completed=True,
                profile_completion_pct=100,
                age=random.randint(22, 60),
                gender=random.choice(["Male", "Female", "Non-binary"]),
                city=city,
                occupation=random.choice(OCCUPATIONS),
                household_size=random.randint(1, 5),
                role="user",
                is_demo=True,
                eco_points=random.randint(150, 850),
                streak_days=random.randint(2, 28),
                level=random.randint(1, 5),
                carbon_goal=round(random.uniform(140.0, 220.0), 1)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            total_users_created += 1

            # Consent record (org_consent=True for aggregated government analytics)
            consent = ConsentRecord(
                user_id=user.id,
                analytics_consent=True,
                ai_consent=True,
                org_consent=True
            )
            db.add(consent)

            # Generate 8 months of historical carbon data
            now = datetime.utcnow()
            months_history = random.randint(6, 12)
            last_calc_data = None

            for m in range(months_history, 0, -1):
                record_date = now - timedelta(days=m * 30)
                calc = generate_user_data(prof_type, months_history - m)
                last_calc_data = calc

                c_data = CarbonData(
                    user_id=user.id,
                    date=record_date,
                    transport_type=calc["transport_type"],
                    daily_distance=calc["daily_distance"],
                    fuel_type="Electric Metro" if "Transit" in calc["transport_type"] else "Petrol",
                    monthly_electricity=calc["monthly_electricity"],
                    ac_usage_hours=calc["ac_usage_hours"],
                    appliance_usage="Medium",
                    diet_type=calc["diet_type"],
                    meals_per_day=3,
                    plastic_waste_kg=calc["plastic_waste_kg"],
                    recycling_habit="Sometimes",
                    waste_generated_level=calc["waste_generated_level"],
                    flight_frequency=0,
                    water_usage_liters=90.0,
                    shopping_frequency="Moderate",
                    total_carbon_footprint=calc["total_co2"],
                    breakdown_json=calc["breakdown"]
                )
                db.add(c_data)
                total_history_records += 1

            # Prediction record
            pred_co2 = round(last_calc_data["total_co2"] * random.uniform(0.88, 1.05), 1)
            pred = Prediction(
                user_id=user.id,
                predicted_emission=pred_co2,
                highest_emission_source=max(last_calc_data["breakdown"], key=last_calc_data["breakdown"].get),
                ai_recommendation=[
                    {
                        "title": "Switch 3 Commute Trips to Public Transit",
                        "category": "Transportation",
                        "impact": "High",
                        "potential_reduction_kg": 18.0,
                        "description": "Riding public transit reduces travel emissions by up to 65%."
                    }
                ],
                confidence_score=round(random.uniform(0.85, 0.96), 2)
            )
            db.add(pred)

            # Carbon Experiment record
            exp = CarbonExperiment(
                user_id=user.id,
                title="7-Day Energy Conservation Experiment",
                duration_days=7,
                predicted_reduction=8.5,
                actual_reduction=round(random.uniform(7.0, 10.0), 1),
                status="completed"
            )
            db.add(exp)

            # User Goal record
            ug = UserGoal(
                user_id=user.id,
                target_reduction_pct=15.0,
                baseline_co2=round(last_calc_data["total_co2"] * 1.1, 1),
                target_co2=round(last_calc_data["total_co2"] * 0.85, 1)
            )
            db.add(ug)

            # Recommendation feedback record
            fb = RecommendationFeedback(
                user_id=user.id,
                recommendation_title="Adjust Thermostat to 24°C",
                category="Electricity",
                completed=True,
                estimated_reduction=6.5,
                observed_reduction=round(random.uniform(5.5, 7.5), 1)
            )
            db.add(fb)

            idx += 1

        db.commit()

    print(f"\n========================================================")
    print(f"DEMO DATA GENERATION COMPLETE SUCCESSFULLY!")
    print(f"========================================================")
    print(f"• Total Synthetic Demo Users Created: {total_users_created}")
    print(f"• City Distribution:")
    for c, cnt in CITIES_DISTRIBUTION.items():
        print(f"  - {c}: {cnt} users")
    print(f"• Total Historical Carbon Records: {total_history_records}")
    print(f"• Demo Password for All Accounts: demo123")
    print(f"• Sample Email: demo.chennai001@gmail.com")
    print(f"========================================================\n")

    db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EcoAI Demo Data Generator")
    parser.add_argument("--clean-demo-only", action="store_true", help="Delete only synthetic demo user accounts")
    parser.add_argument("--seed", action="store_true", help="Generate 150 synthetic demo users")
    args = parser.parse_args()

    if args.clean_demo_only:
        clean_demo_data()
    else:
        seed_demo_data()
