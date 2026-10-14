# Deployment Guide: Webcmd AI Agent Auto-Applier Platform

This document explains how to deploy the **Webcmd AI Agent Platform** to production environments (Docker, Railway, Render, Fly.io, AWS, or local VPS).

---

## 1. Quick Start: Local Deployment

### Prerequisites
- Python 3.11+
- Node.js 20+ (for `@agentrhq/webcmd` CLI)

### Setup Steps
```bash
# 1. Clone or navigate to the project directory
cd webcmd-auto-applier-python

# 2. Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install Playwright browser binaries
playwright install chromium

# 5. Install Webcmd CLI globally (optional but recommended)
npm install -g @agentrhq/webcmd

# 6. Verify environment setup
python -c "from app.webcmd_agent import WebcmdAgent; import asyncio; print(asyncio.run(WebcmdAgent().run_doctor()))"

# 7. Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open `http://localhost:8000` in your browser.

---

## 2. Containerized Deployment with Docker

### 1-Command Startup with Docker Compose
```bash
docker-compose up --build -d
```

### Manual Docker Build & Run
```bash
docker build -t webcmd-auto-applier:latest .
docker run -p 8000:8000 --name webcmd_app webcmd-auto-applier:latest
```

---

## 3. Deploying to Cloud Providers

### A. Vercel Deployment (Instant Serverless Hosting)
The repository is pre-configured with `vercel.json` and `api/index.py` using `@vercel/python`.

#### Option 1: Deploy via Vercel GitHub Integration (Recommended)
1. Push your repository to GitHub (or import your repo into Vercel).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `webcmd-auto-applier-python` repository.
4. Leave Root Directory as `./` and Framework Preset as **Other**.
5. Click **Deploy**. Vercel will build the serverless functions and assign an instant HTTPS domain (e.g., `https://your-project.vercel.app`).

#### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy directly from terminal
cd webcmd-auto-applier-python
vercel
```
*(Select defaults by pressing Enter. For production deployment, run `vercel --prod`)*

> **Note on Serverless vs Containerized Automation**: Vercel Serverless executes the full Dashboard UI, PDF resume parser, Candidate Profile clones, and REST APIs with automatic HTTP log polling fallback. For continuous live background browser daemons on port 9777, containerized hosts below (Railway / Render) are also ready via `Dockerfile`.

### B. Railway.app Deployment
1. Connect your GitHub repository to Railway.
2. Select **Deploy from Dockerfile**.
3. Set Environment Variable: `PORT=8000`.
4. Railway will build the multi-runtime image and generate a public SSL URL.

### B. Render.com Deployment
1. Create a new **Web Service** on Render.
2. Choose **Docker** as the runtime.
3. Set instance size to at least 1GB RAM (required for headless browser execution).
4. Set PORT to `8000`.

### C. Fly.io Deployment
1. Install `flyctl`.
2. Run `fly launch` in the root directory.
3. Configure `fly.toml` to expose port `8000`.
4. Run `fly deploy`.

---

## 4. Running the Automated LinkedIn Test Suite

Run unit and integration tests via `pytest`:
```bash
pytest tests/test_linkedin_applier.py -v
```

Expected output:
```text
tests/test_linkedin_applier.py::test_webcmd_doctor_environment PASSED
tests/test_linkedin_applier.py::test_linkedin_easy_apply_test_case PASSED
tests/test_linkedin_applier.py::test_webcmd_session_execution PASSED
```
