import pytest
import pytest_asyncio
from app.models import ApplicantProfile
from app.webcmd_agent import WebcmdAgent

@pytest.fixture
def default_profile():
    return ApplicantProfile(
        full_name="Jane Doe",
        email="jane.doe@example.com",
        phone="+1 (555) 987-6543",
        city_state="Seattle, WA",
        years_of_experience=5,
        work_authorization="yes",
        requires_sponsorship="no"
    )

@pytest.mark.asyncio
async def test_webcmd_doctor_environment():
    agent = WebcmdAgent()
    doc_result = await agent.run_doctor()
    assert doc_result is not None
    assert "checks" in doc_result
    assert doc_result["webcmd_cli_installed"] is True

@pytest.mark.asyncio
async def test_webcmd_session_execution():
    agent = WebcmdAgent()
    session_res = await agent.create_session()
    assert session_res is not None
    if session_res.get("ok"):
        sess_id = session_res["session_id"]
        assert sess_id.startswith("session_")
        # Clean up session
        close_res = await agent.close_session(sess_id)
        assert close_res["ok"] is True

@pytest.mark.asyncio
async def test_linkedin_easy_apply_test_case(default_profile):
    agent = WebcmdAgent()
    res = await agent.run_linkedin_easy_apply_test(
        profile=default_profile,
        headless=True,
        engine="headful"
    )
    
    assert res["status"] == "PASSED"
    assert res["metrics"]["success"] is True
    assert res["metrics"]["total_fields_filled"] >= 7
    assert len(res["steps_completed"]) >= 5
    assert "Application Submitted Successfully" in res["steps_completed"][-1]
