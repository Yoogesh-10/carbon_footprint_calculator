from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import User, CarbonData, Prediction, Gamification, Recommendation
from app.auth import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if admin already exists
    admin = db.query(User).filter(User.email == "admin@ecoai.org").first()
    if not admin:
        admin = User(
            name="System Administrator",
            email="admin@ecoai.org",
            hashed_password=hash_password("admin123"),
            age=32,
            gender="Other",
            city="Eco City",
            occupation="Environmental Engineer",
            role="admin",
            eco_points=450,
            streak_days=12,
            level=4
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        g_admin = Gamification(
            user_id=admin.id,
            badges=["eco_pioneer", "transit_champ", "zero_waste_hero"],
            completed_challenges=["ch_meatless_3", "ch_transit_week"],
            weekly_goal_kg=200.0,
            eco_points=450,
            streak_days=12
        )
        db.add(g_admin)
        db.commit()

    # Organization User
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
            eco_points=500,
            streak_days=15,
            level=5
        )
        db.add(org_user)
        db.commit()

    # Demo User
    demo_user = db.query(User).filter(User.email == "alex@ecoai.org").first()
    if not demo_user:
        demo_user = User(
            name="Alex Morgan",
            email="alex@ecoai.org",
            hashed_password=hash_password("user123"),
            age=26,
            gender="Non-binary",
            city="San Francisco",
            occupation="Software Developer",
            role="user",
            eco_points=280,
            streak_days=5,
            level=3
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        g_user = Gamification(
            user_id=demo_user.id,
            badges=["eco_pioneer", "solar_crusader"],
            completed_challenges=["ch_ac_temp"],
            weekly_goal_kg=220.0,
            eco_points=280,
            streak_days=5
        )
        db.add(g_user)

        # Add historical carbon records
        now = datetime.utcnow()
        history = [
            (now - timedelta(days=90), 340.5, {"Transportation": 120.0, "Electricity": 110.0, "Food": 70.5, "Waste": 25.0, "Lifestyle": 15.0}),
            (now - timedelta(days=60), 312.0, {"Transportation": 105.0, "Electricity": 102.0, "Food": 65.0, "Waste": 22.0, "Lifestyle": 18.0}),
            (now - timedelta(days=30), 285.4, {"Transportation": 92.0, "Electricity": 95.0, "Food": 62.4, "Waste": 20.0, "Lifestyle": 16.0}),
            (now - timedelta(days=2), 268.0, {"Transportation": 82.0, "Electricity": 90.0, "Food": 60.0, "Waste": 18.0, "Lifestyle": 18.0})
        ]

        for dt, total, bd in history:
            c = CarbonData(
                user_id=demo_user.id,
                date=dt,
                transport_type="Public Transit",
                daily_distance=25.0,
                fuel_type="Electric Metro",
                monthly_electricity=180.0,
                ac_usage_hours=2.5,
                appliance_usage="Medium",
                diet_type="Vegetarian",
                meals_per_day=3,
                plastic_waste_kg=1.5,
                recycling_habit="Sometimes",
                waste_generated_level="Moderate",
                flight_frequency=1,
                water_usage_liters=90.0,
                shopping_frequency="Moderate",
                total_carbon_footprint=total,
                breakdown_json=bd
            )
            db.add(c)

        # Add initial prediction
        pred = Prediction(
            user_id=demo_user.id,
            predicted_emission=248.5,
            highest_emission_source="Electricity",
            ai_recommendation=[
                {
                    "title": "Upgrade to Energy-Efficient LED Lighting & Smart Plugs",
                    "category": "Electricity",
                    "impact": "High",
                    "potential_reduction_kg": 25.0,
                    "description": "Smart plugs cut vampire draw from idle electronics while LED bulbs save 75% lighting power."
                },
                {
                    "title": "Increase Public Transit Commuting to 4 Days/Week",
                    "category": "Transportation",
                    "impact": "Medium",
                    "potential_reduction_kg": 20.0,
                    "description": "Riding metro line instead of rideshare saves ~15 kg CO2 weekly."
                }
            ],
            confidence_score=0.94
        )
        db.add(pred)
        db.commit()

    # Recommendations catalog seed
    if db.query(Recommendation).count() == 0:
        recs = [
            Recommendation(
                category="Transportation",
                title="Switch to Electric Vehicle or Hybrid Commute",
                description="EVs produce zero direct tailpipe emissions and significantly reduce life-cycle carbon footprints.",
                potential_reduction_kg=85.0,
                difficulty="Hard"
            ),
            Recommendation(
                category="Electricity",
                title="Install Rooftop Solar Panels or Purchase Renewable Utility Credits",
                description="Solar offset programs allow households to run zero-carbon home electricity.",
                potential_reduction_kg=110.0,
                difficulty="Hard"
            ),
            Recommendation(
                category="Food",
                title="Adopt Meatless Mondays & Local Farmers Market Sourcing",
                description="Reducing red meat consumption saves immense methane and deforestation impact.",
                potential_reduction_kg=35.0,
                difficulty="Easy"
            ),
            Recommendation(
                category="Waste",
                title="Eliminate Single-Use Plastics with Stainless Steel & Glass",
                description="Preventing plastic production saves upstream refining CO2 and marine pollution.",
                potential_reduction_kg=22.0,
                difficulty="Easy"
            )
        ]
        db.add_all(recs)
        db.commit()

    print("Seed data inserted successfully!")
    db.close()

if __name__ == "__main__":
    seed()
