from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.models.onboarding import OnboardingPayload, UserWithProfile
from app.models.user import SkillProfileOut, SkillProfileUpdate, UserOut
from app.services import db_service as db
from app.services.onboarding_service import compute_skill_profile

router = APIRouter()


@router.post("/onboarding/complete", response_model=UserWithProfile)
def complete_onboarding(payload: OnboardingPayload):
    raw_answers = payload.model_dump()
    computed = compute_skill_profile(raw_answers)

    with get_db() as conn:
        user = db.create_user(conn, name=computed["name"], role=computed["role"])

        profile = db.create_skill_profile(
            conn,
            user_id=user["id"],
            general_coding_comfort=computed["general_coding_comfort"],
            frontend_comfort=computed["frontend_comfort"],
            backend_comfort=computed["backend_comfort"],
            database_comfort=computed["database_comfort"],
            devops_comfort=computed["devops_comfort"],
            mobile_comfort=computed["mobile_comfort"],
            data_science_comfort=computed["data_science_comfort"],
            known_languages=computed["known_languages"],
            known_frameworks=computed["known_frameworks"],
            ai_tools=computed["ai_tools"],
            project_interests=computed["project_interests"],
            raw_onboarding_answers=raw_answers,
        )

    return {"user": user, "profile": profile}


@router.get("/users/{user_id}/profile", response_model=UserWithProfile)
def get_user_profile(user_id: str):
    with get_db() as conn:
        user = db.get_user(conn, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        profile = db.get_skill_profile_by_user(conn, user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
    return {"user": user, "profile": profile}


@router.put("/users/{user_id}/profile", response_model=UserWithProfile)
def update_user_profile(user_id: str, updates: SkillProfileUpdate):
    with get_db() as conn:
        user = db.get_user(conn, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        profile = db.get_skill_profile_by_user(conn, user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        fields = updates.model_dump(exclude_none=True)
        if fields:
            profile = db.update_skill_profile(conn, profile["id"], **fields)

    return {"user": user, "profile": profile}
