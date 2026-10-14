import asyncio
import json
import os
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse

from app.models import ApplicantProfile, AutoApplyRequest, WebcmdSessionRequest, TestRunResponse
from app.webcmd_agent import WebcmdAgent
from app.pdf_parser import ResumePDFParser

app = FastAPI(
    title="Webcmder AI Agent Auto-Applier Platform",
    description="Deployable AI Agent Platform built by Group Webcmder integrating Webcmd infrastructure and PDF resume extraction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_log(self, log_msg: str):
        LOG_BUFFER.append(log_msg)
        if len(LOG_BUFFER) > 100:
            LOG_BUFFER.pop(0)
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps({"type": "log", "message": log_msg}))
            except Exception:
                pass

manager = ConnectionManager()
LOG_BUFFER: List[str] = ["[System] Group Webcmder AI Agent initialized."]
CURRENT_PROFILE = ApplicantProfile()

@app.get("/api/logs")
async def get_recent_logs():
    return {"logs": LOG_BUFFER}

static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h1>Webcmder AI Agent Platform running. Loading Dashboard...</h1>")

@app.get("/linkedin-clone")
async def read_linkedin_clone():
    return FileResponse(os.path.join(static_dir, "linkedin_clone.html"))

@app.get("/internshala-clone")
async def read_internshala_clone():
    return FileResponse(os.path.join(static_dir, "internshala_clone.html"))

@app.get("/api/download/pdf")
async def download_presentation_pdf():
    pdf_file = os.path.join(os.path.dirname(__file__), "..", "Group_Webcmder_Presentation_Summary.pdf")
    if os.path.exists(pdf_file):
        return FileResponse(pdf_file, media_type="application/pdf", filename="Group_Webcmder_Presentation_Summary.pdf")
    return HTMLResponse("<h1>PDF not found. Running generator...</h1>")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "project": "Webcmder AI Agent Auto-Applier",
        "author_group": "Group Webcmder",
        "version": "1.0.0",
        "engine": "Python FastAPI + Playwright + Webcmd CLI + pypdf"
    }

@app.get("/api/doctor")
async def webcmd_doctor():
    agent = WebcmdAgent()
    res = await agent.run_doctor()
    res["project_author"] = "Group Webcmder"
    return res

@app.get("/api/profile", response_model=ApplicantProfile)
async def get_profile():
    return CURRENT_PROFILE

@app.post("/api/profile", response_model=ApplicantProfile)
async def update_profile(profile: ApplicantProfile):
    global CURRENT_PROFILE
    CURRENT_PROFILE = profile
    return CURRENT_PROFILE

@app.post("/api/resume/upload", response_model=ApplicantProfile)
async def upload_resume_pdf(file: UploadFile = File(...)):
    global CURRENT_PROFILE
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF document (.pdf)")

    contents = await file.read()
    await manager.broadcast_log(f"[PDF Parser] Uploaded PDF '{file.filename}' ({len(contents)} bytes). Extracting fields...")

    parsed_profile = ResumePDFParser.parse_resume_to_profile(contents, filename=file.filename)
    CURRENT_PROFILE = parsed_profile

    await manager.broadcast_log(f"[PDF Parser] Extracted -> Name: '{parsed_profile.full_name}', Email: '{parsed_profile.email}', Phone: '{parsed_profile.phone}', Skills: {parsed_profile.skills}")
    return CURRENT_PROFILE

@app.post("/api/sessions/execute")
async def execute_session(req: WebcmdSessionRequest):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)

    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    session_res = await agent.execute_webcmd_session(
        action=req.action,
        target_url=req.target_url,
        session_id=req.session_id,
        script=req.script
    )
    return session_res

@app.post("/api/webcmd/session/create")
async def create_webcmd_session_api():
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)
    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    return await agent.create_session()

@app.post("/api/webcmd/session/run")
async def run_webcmd_script_api(req: WebcmdSessionRequest):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)
    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    if not req.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    script = req.script or f'await page.goto("{req.target_url or "https://example.com"}"); return await page.title();'
    return await agent.run_browser_script(req.session_id, script)

@app.post("/api/webcmd/session/snapshot")
async def take_webcmd_snapshot_api(session_id: str):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)
    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    return await agent.take_snapshot(session_id)

@app.post("/api/webcmd/session/close")
async def close_webcmd_session_api(session_id: str):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)
    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    return await agent.close_session(session_id)

@app.post("/api/linkedin/navigate-copy")
async def navigate_linkedin_and_copy(url: Optional[str] = "https://www.linkedin.com/in/kapil-dhwaj-singh-baghel", headless: bool = False):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)

    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    res = await agent.navigate_and_copy_linkedin_profile(profile_url=url, headless=headless)
    return res

@app.post("/api/linkedin/login")
async def login_linkedin_api(email: Optional[str] = None, password: Optional[str] = None, headless: bool = False):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)

    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    res = await agent.login_to_linkedin(email=email, password=password, headless=headless)
    return res

@app.post("/api/test/linkedin", response_model=TestRunResponse)
async def run_linkedin_test(
    req_profile: Optional[ApplicantProfile] = None,
    headless: bool = True,
    engine: str = "webcmd"
):
    async def log_broadcaster(msg: str):
        await manager.broadcast_log(msg)

    target_profile = req_profile or CURRENT_PROFILE
    agent = WebcmdAgent(log_callback=lambda m: asyncio.create_task(log_broadcaster(m)))
    res = await agent.run_linkedin_easy_apply_test(
        profile=target_profile,
        headless=headless,
        engine=engine
    )
    return res

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_text(json.dumps({"type": "info", "message": "Connected to Group Webcmder AI Agent live execution stream"}))
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
