from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, ConsentRecord, CarbonData, Prediction, AuditLog
from app.schemas import ConsentUpdate, ConsentResponse, DataExportResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/privacy", tags=["Privacy & Consent Center"])

@router.get("/consent", response_model=ConsentResponse)
def get_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(ConsentRecord).filter(ConsentRecord.user_id == current_user.id).first()
    if not consent:
        consent = ConsentRecord(
            user_id=current_user.id,
            analytics_consent=False,
            ai_consent=False,
            org_consent=False
        )
        db.add(consent)
        db.commit()
        db.refresh(consent)
    return consent


@router.post("/consent", response_model=ConsentResponse)
def update_consent(
    data: ConsentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(ConsentRecord).filter(ConsentRecord.user_id == current_user.id).first()
    if not consent:
        consent = ConsentRecord(user_id=current_user.id)
        db.add(consent)
    
    consent.analytics_consent = data.analytics_consent
    consent.ai_consent = data.ai_consent
    consent.org_consent = data.org_consent
    consent.updated_at = datetime.utcnow()

    # Log consent change in AuditLog
    db.add(AuditLog(
        user_id=current_user.id,
        action="CONSENT_UPDATED",
        details_json={
            "analytics_consent": data.analytics_consent,
            "ai_consent": data.ai_consent,
            "org_consent": data.org_consent
        }
    ))

    db.commit()
    db.refresh(consent)
    return consent


@router.get("/export-data", response_model=DataExportResponse)
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(ConsentRecord).filter(ConsentRecord.user_id == current_user.id).first()
    carbon_records = db.query(CarbonData).filter(CarbonData.user_id == current_user.id).all()
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).all()

    profile_dict = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "age": current_user.age,
        "gender": current_user.gender,
        "city": current_user.city,
        "occupation": current_user.occupation,
        "household_size": current_user.household_size,
        "eco_points": current_user.eco_points,
        "carbon_goal": current_user.carbon_goal,
        "created_at": current_user.created_at.isoformat()
    }

    consent_dict = {
        "analytics_consent": consent.analytics_consent if consent else False,
        "ai_consent": consent.ai_consent if consent else False,
        "org_consent": consent.org_consent if consent else False,
        "updated_at": consent.updated_at.isoformat() if consent else None
    }

    records_list = [
        {
            "id": r.id,
            "date": r.date.isoformat(),
            "transport_type": r.transport_type,
            "daily_distance": r.daily_distance,
            "monthly_electricity": r.monthly_electricity,
            "diet_type": r.diet_type,
            "plastic_waste_kg": r.plastic_waste_kg,
            "total_carbon_footprint": r.total_carbon_footprint
        } for r in carbon_records
    ]

    predictions_list = [
        {
            "id": p.id,
            "prediction_date": p.prediction_date.isoformat(),
            "predicted_emission": p.predicted_emission,
            "highest_emission_source": p.highest_emission_source
        } for p in predictions
    ]

    db.add(AuditLog(user_id=current_user.id, action="DATA_EXPORTED", details_json={"records_exported": len(records_list)}))
    db.commit()

    return DataExportResponse(
        user_profile=profile_dict,
        consent_settings=consent_dict,
        carbon_history=records_list,
        predictions=predictions_list,
        exported_at=datetime.utcnow()
    )


@router.delete("/delete-account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    email = current_user.email

    # Log audit entry prior to user deletion
    db.add(AuditLog(user_id=user_id, action="ACCOUNT_DELETED", details_json={"deleted_user_email": email}))
    db.commit()

    # Cascade delete deletes user and all associated records linked by ForeignKey
    db.delete(current_user)
    db.commit()

    return {"message": "Your account and all associated personal records have been permanently deleted.", "deleted_user_id": user_id}
