from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

class EducationItem(BaseModel):
    school: str = Field(..., example="Samrat Ashok Technological Institute, Vidisha")
    degree: str = Field(..., example="B.Tech")
    field_of_study: str = Field(..., example="Artificial Intelligence And Machine Learning")
    start_year: str = Field(default="2025", example="2025")
    end_year: str = Field(default="2029", example="2029")
    grade_percentage: str = Field(default="7.45 CGPA", example="7.45 CGPA")

class ExperienceItem(BaseModel):
    title: str = Field(..., example="AI & ML Student")
    company: str = Field(..., example="SATI Vidisha")
    duration: str = Field(..., example="2025 - 2026")
    description: str = Field(..., example="Information Technology student.")

class ApplicantProfile(BaseModel):
    full_name: str = Field(default="Kapil Dhwaj Singh Baghel")
    email: str = Field(default="kaps2917official@gmail.com")
    phone: str = Field(default="+91 8720863149")
    city_state: str = Field(default="Jayant, Sonebhadra")
    career_objective: Optional[str] = Field(default="Motivated B.Tech student skilled in Python, C/C++, MySQL, and data analysis tools.")
    linkedin_url: str = Field(default="https://linkedin.com/in/kapil-dhwaj-singh-baghel")
    github_url: str = Field(default="https://github.com/kapildhwaj")
    portfolio_url: str = Field(default="https://kapilbaghel.dev")
    resume_path: str = Field(default="uploads/kapil_baghel_resume.pdf")
    years_of_experience: int = Field(default=1)
    skills: List[str] = Field(default_factory=lambda: [
        "Python", "C++", "MySQL", "Pandas", "NumPy", "Matplotlib", "C Programming", "Data Analysis", "Problem Solving"
    ])
    education: List[EducationItem] = Field(default_factory=lambda: [
        EducationItem(
            school="Samrat Ashok Technological Institute, Vidisha",
            degree="B.Tech",
            field_of_study="Artificial Intelligence And Machine Learning",
            start_year="2025",
            end_year="2029",
            grade_percentage="7.45 CGPA"
        ),
        EducationItem(
            school="St. Joseph School, Shaktinagar",
            degree="Senior Secondary (XII), CBSE",
            field_of_study="Science",
            start_year="2021",
            end_year="2023",
            grade_percentage="84.80%"
        ),
        EducationItem(
            school="St. Joseph School, Shaktinagar",
            degree="Secondary (X), CBSE",
            field_of_study="General Science & Math",
            start_year="2019",
            end_year="2021",
            grade_percentage="94.00%"
        )
    ])
    experience: List[ExperienceItem] = Field(default_factory=lambda: [
        ExperienceItem(title="AI & Data Analysis Student", company="SATI Vidisha", duration="2025 - Present", description="Data analysis using Pandas, NumPy, Matplotlib.")
    ])
    work_authorization: str = Field(default="Yes")
    requires_sponsorship: str = Field(default="No")

class AutoApplyRequest(BaseModel):
    target_url: str = Field(..., example="https://www.linkedin.com/jobs/view/123456789")
    headless: bool = Field(default=False)
    profile: Optional[ApplicantProfile] = None

class WebcmdSessionRequest(BaseModel):
    session_id: Optional[str] = Field(default=None)
    action: str = Field(default="doctor", example="doctor")
    target_url: Optional[str] = Field(default="https://example.com")
    script: Optional[str] = Field(default=None)

class TestRunResponse(BaseModel):
    status: str
    message: str
    steps_completed: List[str]
    logs: List[str]
    metrics: dict
