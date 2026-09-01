import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, profile, carbon, predict, gamification, reports, admin, simulator, budget, ocr, checkin, experiments, analytics_adv, privacy, org
from seed_data import seed

# Create DB tables & seed baseline data if needed
Base.metadata.create_all(bind=engine)
try:
    seed()
except Exception as e:
    print("Seed warning:", e)

app = FastAPI(
    title="EcoAI – AI-Based Carbon Footprint Calculator API",
    description="Backend API supporting carbon calculation, Scikit-learn AI predictions, gamification, and analytics.",
    version="1.0.0"
)

# Enable CORS for cross-origin Vercel & local frontend requests
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(carbon.router)
app.include_router(predict.router)
app.include_router(gamification.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(simulator.router)
app.include_router(budget.router)
app.include_router(ocr.router)
app.include_router(checkin.router)
app.include_router(experiments.router)
app.include_router(analytics_adv.router)
app.include_router(privacy.router)
app.include_router(org.router)


@app.get("/")
def root():
    return {
        "status": "Online",
        "app": "EcoAI – AI-Based Carbon Footprint Calculator API",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "EcoAI Backend API"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
