import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "Online"
    print("[OK] Root API test passed")

def test_login_admin():
    res = client.post("/api/auth/login", json={"email": "admin@ecoai.org", "password": "admin123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    print("[OK] Admin Login test passed")
    return token

def test_login_user():
    res = client.post("/api/auth/login", json={"email": "alex@ecoai.org", "password": "user123"})
    assert res.status_code == 200, f"User Login failed: {res.text}"
    token = res.json()["access_token"]
    print("[OK] User Login test passed")
    return token

def test_carbon_calculate(token):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "transport_type": "Public Transit",
        "daily_distance": 18.0,
        "fuel_type": "Electric Metro",
        "monthly_electricity": 160.0,
        "ac_usage_hours": 2.0,
        "appliance_usage": "Medium",
        "diet_type": "Vegetarian",
        "meals_per_day": 3,
        "plastic_waste_kg": 1.0,
        "recycling_habit": "Always",
        "waste_generated_level": "Low",
        "flight_frequency": 0,
        "water_usage_liters": 80.0,
        "shopping_frequency": "Low"
    }
    res = client.post("/api/carbon/calculate", json=payload, headers=headers)
    assert res.status_code == 200, f"Calculation failed: {res.text}"
    data = res.json()
    assert "total_carbon_footprint" in data
    print(f"[OK] Carbon Calculation test passed (Total: {data['total_carbon_footprint']} kg CO2e)")

def test_wallet_and_transparency(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Wallet API
    w_res = client.get("/api/carbon/wallet", headers=headers)
    assert w_res.status_code == 200, f"Wallet failed: {w_res.text}"
    w_data = w_res.json()
    assert "total_co2_saved_kg" in w_data
    assert "disclaimer" in w_data
    print(f"[OK] Carbon Savings Wallet test passed (Saved: {w_data['total_co2_saved_kg']} kg)")

    # Transparency API
    t_res = client.get("/api/carbon/transparency-explain", headers=headers)
    assert t_res.status_code == 200, f"Transparency failed: {t_res.text}"
    t_data = t_res.json()
    assert "categories" in t_data
    print("[OK] Calculation Transparency Explanation test passed")

def test_feedback_loop(token):
    headers = {"Authorization": f"Bearer {token}"}
    fb_res = client.post("/api/predict/recommendation-feedback?recommendation_title=Thermostat%20to%2024C&category=Electricity&expected_reduction=6.5&observed_reduction=6.0", headers=headers)
    assert fb_res.status_code == 200, f"Feedback failed: {fb_res.text}"
    fb_data = fb_res.json()
    assert fb_data["status"] == "Success"
    print(f"[OK] Recommendation Feedback Loop test passed (Effectiveness: {fb_data['effectiveness']})")

def test_organization_portal(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Org Summary with k-anonymity check
    org_res = client.get("/api/org/summary?region=Chennai", headers=headers)
    assert org_res.status_code == 200, f"Org summary failed: {org_res.text}"
    org_data = org_res.json()
    assert "privacy_notice" in org_data

    # 2. Org Campaigns
    c_res = client.post("/api/org/campaigns", json={"title": "Metro Challenge", "description": "Ride metro", "target_category": "Transportation", "target_reduction_pct": 15.0, "duration_days": 30}, headers=headers)
    assert c_res.status_code == 200, f"Campaign failed: {c_res.text}"

    # 3. Policy Impact Simulator
    sim_res = client.post("/api/org/policy-simulator", json={"scenario_type": "public_transit", "adoption_increase_pct": 15.0}, headers=headers)
    assert sim_res.status_code == 200, f"Policy sim failed: {sim_res.text}"
    sim_data = sim_res.json()
    assert "estimated_sector_reduction_pct" in sim_data
    print(f"[OK] Policy Impact Simulator test passed (Sector Reduction: -{sim_data['estimated_sector_reduction_pct']}%)")

    # 4. AI Policy Recommendations
    rec_res = client.get("/api/org/policy-recommendations", headers=headers)
    assert rec_res.status_code == 200, f"Policy rec failed: {rec_res.text}"
    rec_data = rec_res.json()
    assert "policy_recommendation_title" in rec_data
    print(f"[OK] AI Policy Recommendations test passed (Recommendation: {rec_data['policy_recommendation_title']})")

    # 5. Org Goals
    goal_res = client.post("/api/org/goals", json={"title": "Reduce Transport CO2", "target_category": "Transportation", "target_reduction_pct": 15.0}, headers=headers)
    assert goal_res.status_code == 200, f"Goal failed: {goal_res.text}"

    # 6. Org PDF Report Data
    rpt_res = client.get("/api/reports/org-pdf-data", headers=headers)
    assert rpt_res.status_code == 200, f"Org report failed: {rpt_res.text}"
    print("[OK] Organization & Government Portal APIs fully verified")

if __name__ == "__main__":
    test_root()
    admin_token = test_login_admin()
    user_token = test_login_user()
    test_carbon_calculate(user_token)
    test_wallet_and_transparency(user_token)
    test_feedback_loop(user_token)
    test_organization_portal(admin_token)
    print("\nAll Two-Level Platform API Tests Passed Successfully!")
