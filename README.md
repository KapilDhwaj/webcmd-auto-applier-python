# Webcmder AI Agent Auto-Applier Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com)
[![Webcmd](https://img.shields.io/badge/Webcmd-@agentrhq/webcmd%20v0.7.4-purple.svg)](https://github.com/agentrhq/webcmd)
[![Browser](https://img.shields.io/badge/CloakBrowser-Stealth%20Chromium-orange.svg)](https://cloakbrowser.dev)
[![Tests](https://img.shields.io/badge/Pytest-3%20Passed-brightgreen.svg)](tests/test_linkedin_applier.py)

A production AI Agent platform built by **Group Webcmder** deeply integrating **Webcmd browser infrastructure** (`@agentrhq/webcmd`), dynamic PDF resume extraction, and an automated **LinkedIn Easy Apply workflow runner**.

---

## 🌟 Genuine Webcmd Integration Architecture

Unlike generic automation scripts, this platform deeply integrates **Webcmd's official browser infrastructure**:

1. **Webcmd Session Lifecycle Management**:
   - `webcmd session create -f json`: Spawns isolated, independent browser session contexts with distinct session IDs (`session_...`).
   - `webcmd session close <session-id>`: Cleans up leases and memory cleanly.
2. **CloakBrowser Stealth Execution**:
   - Sends deterministic Playwright programs directly into Webcmd's stealth runtime via `webcmd --session <id> browser run --stdin`.
   - Bypasses anti-bot bot detection on career portals and applicant tracking systems.
3. **Webcmd Compact Accessibility Snapshots & Diffing**:
   - Inspects the live DOM through `webcmd browser snapshot` and captures automatic `snapshotDiff`.
   - Collapses token consumption by up to 90% compared to raw HTML dumps.
4. **Dual Execution Engine**:
   - **Engine 1 (Webcmd CloakBrowser - Default)**: Official background Webcmd daemon runner with full telemetry, timings, and snapshot diffs.
   - **Engine 2 (Headful Microsoft Edge)**: Visible on-screen browser runner for live presentations and human validation.
5. **Dynamic PDF Resume Parser**:
   - Extracts candidate contact info, education history, GPA/percentages, and skills from any uploaded PDF resume with 1-click clipboard buttons.

---

## 📁 Repository Structure

```text
webcmd-auto-applier-python/
├── app/
│   ├── main.py              # FastAPI server, Webcmd REST API & WebSocket telemetry
│   ├── webcmd_agent.py      # Core Webcmd CLI bridge (session, run, snapshot, apply)
│   ├── models.py            # Pydantic schemas for applicant profile & sessions
│   ├── pdf_parser.py        # Dynamic PDF resume extraction engine
│   └── static/              # Dashboard UI & clones
│       ├── index.html       # Webcmd Control Panel & Glassmorphism dashboard
│       ├── linkedin_clone.html # LinkedIn clone test harness
│       ├── internshala_clone.html # Internshala clone test harness
│       ├── css/style.css    # Modern dark-mode UI design system
│       └── js/app.js        # Frontend Webcmd session & telemetry integration
├── tests/
│   └── test_linkedin_applier.py # Automated Pytest suite verifying Webcmd lifecycle
├── Dockerfile               # Multi-runtime production container (Python + Node + Webcmd)
├── docker-compose.yml       # Docker Compose setup
├── DEPLOYMENT.md            # Cloud deployment instructions
├── requirements.txt         # Python dependencies
└── README.md                # Documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.6+`
- **Python**: `3.11+`
- **Webcmd CLI**: `npm install -g @agentrhq/webcmd`

### 2. Verify Webcmd Environment
```bash
webcmd doctor
```
*(Ensures Webcmd daemon and CloakBrowser are ready on port 9777)*

### 3. Install Dependencies
```bash
pip install -r requirements.txt
playwright install chromium
```

### 4. Run Automated Test Suite
```bash
python -m pytest tests/test_linkedin_applier.py -v
```

### 5. Start the Webcmd Platform
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Visit **`http://localhost:8000`** to access the Webcmd Dashboard.
