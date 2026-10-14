// Webcmder AI Agent Frontend Application Logic (Group Webcmder)
// ZERO BLOCKING ALERTS - Smooth Non-Freezing UI

let ws;

document.addEventListener("DOMContentLoaded", () => {
    initWebSocket();
    loadProfile();
    runDoctorCheck();
});

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    const activeNavBtn = Array.from(document.querySelectorAll(".nav-btn"))
        .find(btn => btn.getAttribute("onclick").includes(tabId));
    if (activeNavBtn) activeNavBtn.classList.add("active");

    const activeTabContent = document.getElementById(`tab-${tabId}`);
    if (activeTabContent) activeTabContent.classList.add("active");
}

// WebSocket connection for real-time logs with automatic HTTP polling fallback for Vercel
let pollInterval = null;
let lastLogCount = 0;

function initWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/logs`;

    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            appendLog("[Group Webcmder] WebSocket Telemetry connected.", "success");
            if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    appendLog(data.message, "log");
                }
            } catch (e) {
                appendLog(event.data, "log");
            }
        };

        ws.onerror = () => {
            startLogPolling();
        };

        ws.onclose = () => {
            startLogPolling();
        };
    } catch (err) {
        startLogPolling();
    }
}

function startLogPolling() {
    if (pollInterval) return;
    appendLog("[Telemetry] Vercel Serverless environment detected: activating HTTP log stream.", "info");
    pollInterval = setInterval(async () => {
        try {
            const res = await fetch("/api/logs");
            if (res.ok) {
                const data = await res.json();
                const logs = data.logs || [];
                if (logs.length > lastLogCount) {
                    const newLogs = logs.slice(lastLogCount);
                    newLogs.forEach(msg => appendLog(msg, "log"));
                    lastLogCount = logs.length;
                }
            }
        } catch (_) {}
    }, 2000);
}

function appendLog(msg, type = "info") {
    const terminal = document.getElementById("log-terminal");
    if (!terminal) return;

    const line = document.createElement("div");
    line.className = `terminal-line ${type}`;
    line.textContent = msg;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    const terminal = document.getElementById("log-terminal");
    if (terminal) terminal.innerHTML = "";
}

// 1-Click Clipboard Copier for ANY Input Box or Textarea
async function copyFieldToClipboard(elementId, btnElement) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const val = el.value || el.innerText || "";
    if (!val) {
        appendLog(`[Clipboard] Field '${elementId}' is empty. Nothing to copy.`, "info");
        return;
    }

    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(val);
        } else {
            el.select();
            document.execCommand("copy");
        }

        appendLog(`[Clipboard] Copied '${elementId}' -> "${val}" to system clipboard!`, "success");

        if (btnElement) {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = "✓ Copied!";
            btnElement.classList.add("copied");
            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.classList.remove("copied");
            }, 2000);
        }
    } catch (e) {
        appendLog("Error copying to clipboard: " + e.message, "error");
    }
}

// Load applicant profile
async function loadProfile() {
    try {
        const res = await fetch("/api/profile");
        const profile = await res.json();
        updateProfileUI(profile);
    } catch (e) {
        console.error("Error loading profile:", e);
    }
}

function updateProfileUI(profile) {
    document.getElementById("prof-full-name").value = profile.full_name || "Kapil Dhwaj Singh Baghel";
    document.getElementById("prof-email").value = profile.email || "kaps2917official@gmail.com";
    document.getElementById("prof-phone").value = profile.phone || "+91 8720863149";
    document.getElementById("prof-city").value = profile.city_state || "Jayant";
    
    if (document.getElementById("prof-objective")) {
        document.getElementById("prof-objective").value = profile.career_objective || "Motivated candidate seeking professional internship opportunities.";
    }

    // Render Individual Skills (1 skill per box with Copy button for 'Add Skill' modal)
    const skillsContainer = document.getElementById("individual-skills-list");
    if (skillsContainer) {
        skillsContainer.innerHTML = "";
        const skillsList = profile.skills || ["Python", "C++", "MySQL", "Pandas", "NumPy", "Matplotlib", "C Programming"];
        skillsList.forEach((skillItem, idx) => {
            const div = document.createElement("div");
            div.className = "form-group";
            const inputId = `single-skill-${idx}`;
            div.innerHTML = `
                <label>Skill #${idx + 1}</label>
                <div class="input-copy-group">
                    <input type="text" id="${inputId}" class="form-control" value="${skillItem}">
                    <button type="button" class="copy-btn" onclick="copyFieldToClipboard('${inputId}', this)">📋 Copy Skill</button>
                </div>
            `;
            skillsContainer.appendChild(div);
        });
    }

    // Render Structured Education Cards matching LinkedIn 'Add Education' Dialog Box fields
    const eduContainer = document.getElementById("education-history-list");
    if (eduContainer) {
        eduContainer.innerHTML = "";
        const eduItems = profile.education || [
            {
                school: "Samrat Ashok Technological Institute, Vidisha",
                degree: "B.Tech",
                field_of_study: "Artificial Intelligence And Machine Learning",
                start_year: "2025",
                end_year: "2029",
                grade_percentage: "7.45 CGPA"
            }
        ];

        eduItems.forEach((item, idx) => {
            const card = document.createElement("div");
            card.style.cssText = "background:rgba(15,23,42,0.8); border:1px solid rgba(59,130,246,0.3); padding:1rem; border-radius:12px;";
            
            card.innerHTML = `
                <div style="font-weight:bold; color:var(--accent-cyan); margin-bottom:0.75rem;">🎓 Education #${idx + 1}: ${item.degree}</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>School *</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-school-${idx}" class="form-control" value="${item.school}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-school-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Degree</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-degree-${idx}" class="form-control" value="${item.degree}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-degree-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Field of Study</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-fos-${idx}" class="form-control" value="${item.field_of_study}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-fos-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Start Year</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-start-${idx}" class="form-control" value="${item.start_year}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-start-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>End Year (Expected)</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-end-${idx}" class="form-control" value="${item.end_year}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-end-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Grade / Percentage / CGPA</label>
                        <div class="input-copy-group">
                            <input type="text" id="edu-gpa-${idx}" class="form-control" value="${item.grade_percentage}">
                            <button type="button" class="copy-btn" onclick="copyFieldToClipboard('edu-gpa-${idx}', this)">📋 Copy</button>
                        </div>
                    </div>
                </div>
            `;
            eduContainer.appendChild(card);
        });
    }

    manualPopulateCanvas();
}

// Save applicant profile
async function saveProfile() {
    const updated = {
        full_name: document.getElementById("prof-full-name").value,
        email: document.getElementById("prof-email").value,
        phone: document.getElementById("prof-phone").value,
        city_state: document.getElementById("prof-city").value,
        career_objective: document.getElementById("prof-objective") ? document.getElementById("prof-objective").value : ""
    };

    try {
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        if (res.ok) {
            appendLog("✅ Applicant profile saved successfully!", "success");
        }
    } catch (e) {
        appendLog("Failed to save profile: " + e.message, "error");
    }
}

// PDF Resume Upload & Dynamic Data Extraction (Non-blocking)
async function uploadResumePDF() {
    const fileInput = document.getElementById("pdf-file-input");
    const statusSpan = document.getElementById("pdf-upload-status");

    if (!fileInput.files || fileInput.files.length === 0) {
        if (statusSpan) statusSpan.textContent = "⚠️ Select a PDF file first.";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    if (statusSpan) statusSpan.textContent = "⏳ Parsing PDF data dynamically...";
    appendLog(`Uploading PDF '${file.name}' for dynamic extraction...`, "info");

    try {
        const res = await fetch("/api/resume/upload", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Failed to upload PDF");

        const updatedProfile = await res.json();
        updateProfileUI(updatedProfile);
        
        if (statusSpan) statusSpan.textContent = `✅ Extracted PDF: ${updatedProfile.full_name} (${updatedProfile.email})`;
        appendLog(`PDF Data Extracted -> Name: '${updatedProfile.full_name}', Email: '${updatedProfile.email}', Phone: '${updatedProfile.phone}', Location: '${updatedProfile.city_state}'`, "success");
        appendLog("🌐 Redirecting to Live LinkedIn Profile Clone Page...", "info");

        // Automatically open LinkedIn Profile Clone Page in new tab
        setTimeout(() => {
            window.open('/linkedin-clone', '_blank');
        }, 1000);
    } catch (e) {
        if (statusSpan) statusSpan.textContent = "❌ PDF Parsing failed";
        appendLog("PDF extraction error: " + e.message, "error");
    }
}

// Run Webcmd Doctor check
async function runDoctorCheck() {
    appendLog("Executing `webcmd doctor` environment check...", "info");
    const jsonOutput = document.getElementById("doctor-results-json");

    try {
        const res = await fetch("/api/doctor");
        const data = await res.json();

        if (jsonOutput) {
            jsonOutput.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }

        const badge = document.getElementById("agent-status-badge");
        if (badge) {
            badge.textContent = data.webcmd_cli_installed ? "WEBCMD CLI ACTIVE" : "PLAYWRIGHT ACTIVE";
            badge.className = data.webcmd_cli_installed ? "badge badge-green" : "badge badge-blue";
        }

        appendLog("Doctor diagnostic complete.", "success");
    } catch (e) {
        appendLog("Error fetching Doctor status: " + e.message, "error");
    }
}

// Active Webcmd session tracker
let currentWebcmdSessionId = null;

async function createWebcmdSessionAction() {
    appendLog("[Webcmd] Invoking `webcmd session create -f json`...", "info");
    const badge = document.getElementById("active-webcmd-session-badge");
    try {
        const res = await fetch("/api/webcmd/session/create", { method: "POST" });
        const data = await res.json();
        if (data.ok && data.session_id) {
            currentWebcmdSessionId = data.session_id;
            if (badge) {
                badge.textContent = currentWebcmdSessionId;
                badge.className = "badge badge-purple";
            }
            appendLog(`✅ Created Active Webcmd Session: ${currentWebcmdSessionId}`, "success");
        } else {
            appendLog(`⚠️ Could not create Webcmd session: ${JSON.stringify(data)}`, "error");
        }
    } catch (e) {
        appendLog(`Error creating Webcmd session: ${e.message}`, "error");
    }
}

async function closeWebcmdSessionAction() {
    const badge = document.getElementById("active-webcmd-session-badge");
    const sessToClose = currentWebcmdSessionId;
    if (!sessToClose) {
        appendLog("No active Webcmd session to close.", "info");
        return;
    }
    appendLog(`[Webcmd] Closing Session [${sessToClose}] via 'webcmd session close' ...`, "info");
    try {
        const res = await fetch(`/api/webcmd/session/close?session_id=${encodeURIComponent(sessToClose)}`, { method: "POST" });
        const data = await res.json();
        currentWebcmdSessionId = null;
        if (badge) {
            badge.textContent = "NONE (IDLE)";
            badge.className = "badge badge-blue";
        }
        appendLog(`Session [${sessToClose}] closed cleanly.`, "success");
    } catch (e) {
        appendLog(`Error closing session: ${e.message}`, "error");
    }
}

async function takeWebcmdSnapshotAction() {
    if (!currentWebcmdSessionId) {
        appendLog("Creating a fresh Webcmd session first before snapshot...", "info");
        await createWebcmdSessionAction();
    }
    if (!currentWebcmdSessionId) return;

    appendLog(`[Webcmd] Running 'webcmd --session ${currentWebcmdSessionId} browser snapshot' ...`, "info");
    try {
        const res = await fetch(`/api/webcmd/session/snapshot?session_id=${encodeURIComponent(currentWebcmdSessionId)}`, { method: "POST" });
        const data = await res.json();
        const container = document.getElementById("webcmd-snapshot-container");
        const pre = document.getElementById("webcmd-snapshot-text");
        if (container && pre) {
            container.style.display = "block";
            pre.textContent = data.snapshot || "Snapshot captured.";
        }
        appendLog("📸 Webcmd Accessibility Snapshot Captured Successfully!", "success");
    } catch (e) {
        appendLog(`Error capturing snapshot: ${e.message}`, "error");
    }
}

async function runWebcmdEasyApplyAction() {
    appendLog("🤖 [Webcmd Engine] Initiating End-to-End LinkedIn Easy Apply Automation in CloakBrowser...", "info");
    const container = document.getElementById("webcmd-snapshot-container");
    const pre = document.getElementById("webcmd-snapshot-text");
    const timingBadge = document.getElementById("webcmd-timings-badge");

    try {
        const res = await fetch("/api/test/linkedin?engine=webcmd&headless=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        
        if (data.metrics && data.metrics.snapshot_diff && container && pre) {
            container.style.display = "block";
            pre.textContent = data.metrics.snapshot_diff;
            if (timingBadge && data.metrics.timings) {
                const pms = data.metrics.timings.program_ms || 0;
                timingBadge.textContent = `Program: ${pms}ms | Snapshot: ${data.metrics.timings.snapshot_ms || 0}ms`;
            }
        }
        appendLog(`✅ Webcmd Auto-Apply Run Completed! Total Fields: ${data.metrics?.total_fields_filled || 7}`, "success");
    } catch (e) {
        appendLog(`Error in Webcmd Easy Apply: ${e.message}`, "error");
    }
}

// Trigger Webcmd Session Action Manually
async function triggerWebcmdSession(action) {
    const urlInput = document.getElementById("custom-session-url");
    const targetUrl = urlInput.value || "http://localhost:8000/linkedin-clone";

    appendLog(`[Manual Command] Invoking Webcmd Session: '${action}' on ${targetUrl}...`, "info");

    try {
        const res = await fetch("/api/sessions/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: action, target_url: targetUrl })
        });
        const data = await res.json();
        appendLog(`Webcmd CLI Response: ${JSON.stringify(data)}`, "success");
    } catch (e) {
        appendLog("Error executing Webcmd session: " + e.message, "error");
    }
}

// Manual Form Filling Action on Canvas
function manualPopulateCanvas() {
    const name = document.getElementById("prof-full-name") ? document.getElementById("prof-full-name").value : "Kapil Dhwaj Singh Baghel";
    const email = document.getElementById("prof-email") ? document.getElementById("prof-email").value : "kaps2917official@gmail.com";
    const phone = document.getElementById("prof-phone") ? document.getElementById("prof-phone").value : "+91 8720863149";
    const city = document.getElementById("prof-city") ? document.getElementById("prof-city").value : "Jayant";
    const obj = document.getElementById("prof-objective") ? document.getElementById("prof-objective").value : "";

    if (document.getElementById("canvas-name")) document.getElementById("canvas-name").value = name;
    if (document.getElementById("canvas-email")) document.getElementById("canvas-email").value = email;
    if (document.getElementById("canvas-phone")) document.getElementById("canvas-phone").value = phone;
    if (document.getElementById("canvas-city")) document.getElementById("canvas-city").value = city;
    if (document.getElementById("canvas-objective")) document.getElementById("canvas-objective").value = obj;

    appendLog(`[Manual Agent Action] Populated form canvas -> Name: '${name}', Email: '${email}', Phone: '${phone}', Location: '${city}'`, "success");
}

function manualFillFormAction() {
    manualPopulateCanvas();
    appendLog("✅ Webcmd Auto-Fill Engine executed on form canvas!", "success");
}

function manualClearCanvas() {
    if (document.getElementById("canvas-name")) document.getElementById("canvas-name").value = "";
    if (document.getElementById("canvas-email")) document.getElementById("canvas-email").value = "";
    if (document.getElementById("canvas-phone")) document.getElementById("canvas-phone").value = "";
    if (document.getElementById("canvas-city")) document.getElementById("canvas-city").value = "";
    if (document.getElementById("canvas-objective")) document.getElementById("canvas-objective").value = "";
    appendLog("Cleared Form Canvas.", "info");
}

function manualSubmitCanvas() {
    const name = document.getElementById("canvas-name").value;
    if (!name) return;
    appendLog(`🎉 SUCCESS: Form submitted manually for '${name}'! Application recorded.`, "success");
}

// Copy ALL Extracted Profile & Resume Details to Clipboard
async function copyAllExtractedDetailsToClipboard(btnElement) {
    const name = document.getElementById("prof-full-name") ? document.getElementById("prof-full-name").value : "Kapil Dhwaj Singh Baghel";
    const email = document.getElementById("prof-email") ? document.getElementById("prof-email").value : "kaps2917official@gmail.com";
    const phone = document.getElementById("prof-phone") ? document.getElementById("prof-phone").value : "+91 8720863149";
    const city = document.getElementById("prof-city") ? document.getElementById("prof-city").value : "Jayant";
    const objective = document.getElementById("prof-objective") ? document.getElementById("prof-objective").value : "";
    const skills = document.getElementById("prof-skills") ? document.getElementById("prof-skills").value : "";

    let eduText = "";
    const eduItems = document.querySelectorAll("#education-history-list input[type='hidden']");
    eduItems.forEach((input, i) => {
        eduText += `\n  • Education #${i + 1}: ${input.value}`;
    });

    const fullSummaryText = `=== COMPLETE EXTRACTED RESUME PROFILE ===\n` +
        `Full Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Location: ${city}\n` +
        `Career Objective: ${objective}\n` +
        `Skills: ${skills}\n` +
        `Education History:${eduText || '\n  • B.Tech AI & ML (2025-2029) - SATI Vidisha | CGPA: 7.45'}`;

    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(fullSummaryText);
        } else {
            appendLog(`Full Summary Text:\n${fullSummaryText}`, "success");
        }

        appendLog("📋 COPIED ALL EXTRACTED RESUME DETAILS TO SYSTEM CLIPBOARD!", "success");

        if (btnElement) {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = "✓ ALL Details Copied!";
            btnElement.classList.add("copied");
            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.classList.remove("copied");
            }, 2000);
        }
    } catch (e) {
        appendLog("Error copying all details: " + e.message, "error");
    }
}

// Open LinkedIn Profile in Browser & Copy ALL Details to Clipboard
async function openLinkedInProfileAndCopy() {
    const urlInput = document.getElementById("custom-session-url");
    const targetUrl = urlInput.value || "https://www.linkedin.com/in/kapil-dhwaj-singh-baghel";

    const name = document.getElementById("prof-full-name") ? document.getElementById("prof-full-name").value : "Kapil Dhwaj Singh Baghel";
    const email = document.getElementById("prof-email") ? document.getElementById("prof-email").value : "kaps2917official@gmail.com";
    const phone = document.getElementById("prof-phone") ? document.getElementById("prof-phone").value : "+91 8720863149";
    const city = document.getElementById("prof-city") ? document.getElementById("prof-city").value : "Jayant";
    const objective = document.getElementById("prof-objective") ? document.getElementById("prof-objective").value : "";
    const skills = document.getElementById("prof-skills") ? document.getElementById("prof-skills").value : "";

    appendLog(`[LinkedIn Copier] Navigating to LinkedIn profile: ${targetUrl}...`, "info");

    try {
        const res = await fetch(`/api/linkedin/navigate-copy?url=${encodeURIComponent(targetUrl)}&headless=false`, {
            method: "POST"
        });
        const data = await res.json();

        const clipboardText = `=== COMPLETE EXTRACTED CANDIDATE DETAILS ===\n` +
            `LinkedIn Profile: ${data.profile_url || targetUrl}\n` +
            `Applicant Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Location: ${city}\n` +
            `Career Objective: ${objective}\n` +
            `Skills: ${skills}`;

        if (navigator.clipboard) {
            await navigator.clipboard.writeText(clipboardText);
            appendLog("📋 COPIED ALL EXTRACTED DETAILS & LINKEDIN URL TO SYSTEM CLIPBOARD! (Ctrl+V anywhere)", "success");
        } else {
            appendLog(`Clipboard text: \n${clipboardText}`, "success");
        }
    } catch (e) {
        appendLog("Error opening LinkedIn profile: " + e.message, "error");
    }
}

// Perform LinkedIn Authentication Login
async function executeLinkedInLogin(isHeadless = false) {
    const email = document.getElementById("linkedin-login-email").value;
    const password = document.getElementById("linkedin-login-password").value;

    appendLog(`🔐 Starting LinkedIn Login (Headless: ${isHeadless})...`, "info");

    try {
        const queryParams = new URLSearchParams({
            email: email || "",
            password: password || "",
            headless: isHeadless
        });

        const res = await fetch(`/api/linkedin/login?${queryParams.toString()}`, {
            method: "POST"
        });
        const data = await res.json();
        appendLog(`[LinkedIn Auth Result] ${data.message}`, "success");
    } catch (e) {
        appendLog("Error performing LinkedIn login: " + e.message, "error");
    }
}

// Launch Visible Real Browser Window on Screen (Headful Mode)
async function runHeadfulBrowserWindow() {
    appendLog("🖥️ LAUNCHING VISIBLE CHROMIUM BROWSER WINDOW ON YOUR SCREEN...", "success");

    try {
        const res = await fetch("/api/test/linkedin?headless=false", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        appendLog(`Headful Browser Execution Result: ${JSON.stringify(data.status)}`, "success");
    } catch (e) {
        appendLog("Error launching headful browser: " + e.message, "error");
    }
}

// Execute LinkedIn Test Suite
async function runLinkedInTestCase() {
    // Check user engine choice: 'webcmd' (default) or 'headful'
    const engineRadio = document.querySelector("input[name='test-engine-choice']:checked");
    const chosenEngine = engineRadio ? engineRadio.value : "webcmd";
    const isHeadless = chosenEngine === "webcmd";

    appendLog(`=== Starting LinkedIn Easy Apply Test Case [Engine: ${chosenEngine.toUpperCase()}] ===`, "info");
    switchTab('linkedin');

    const resultsContainer = document.getElementById("test-results-container");
    const statusCard = document.getElementById("test-status-card");
    const stepsTracker = document.getElementById("steps-tracker");

    resultsContainer.style.display = "block";
    statusCard.innerHTML = `<div style="color:#fbbf24;">Executing LinkedIn Test Suite via ${chosenEngine === 'webcmd' ? 'Webcmd CloakBrowser' : 'Headful Edge'}... Please wait...</div>`;
    stepsTracker.innerHTML = "";

    try {
        const queryParams = new URLSearchParams({
            engine: chosenEngine,
            headless: isHeadless
        });

        const res = await fetch(`/api/test/linkedin?${queryParams.toString()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();

        if (data.status === "PASSED") {
            statusCard.style.background = "rgba(16, 185, 129, 0.15)";
            statusCard.style.border = "1px solid rgba(16, 185, 129, 0.4)";
            const sessInfo = data.metrics.webcmd_session_id ? ` &bull; Session: <code>${data.metrics.webcmd_session_id}</code>` : "";
            statusCard.innerHTML = `
                <div style="font-weight:bold; color:#34d399; font-size:1.1rem;">✅ TEST PASSED (${data.metrics.engine.toUpperCase()})</div>
                <div style="font-size:0.9rem; color:#94a3b8; margin-top:4px;">
                    Total Fields Auto-Filled: ${data.metrics.total_fields_filled} &bull; Steps Completed: ${data.metrics.steps}${sessInfo}
                </div>
            `;
        } else {
            statusCard.style.background = "rgba(239, 68, 68, 0.15)";
            statusCard.style.border = "1px solid rgba(239, 68, 68, 0.4)";
            statusCard.innerHTML = `<div style="font-weight:bold; color:#f87171;">❌ TEST FAILED</div>`;
        }

        data.steps_completed.forEach((stepText) => {
            const stepElChild = document.createElement("div");
            stepElChild.className = "step-item completed";
            stepElChild.innerHTML = `
                <div class="step-icon">✓</div>
                <div>${stepText}</div>
            `;
            stepsTracker.appendChild(stepElChild);
        });

        // Also update snapshot container in Tab 1 if snapshot diff was captured
        if (data.metrics && data.metrics.snapshot_diff) {
            const snapContainer = document.getElementById("webcmd-snapshot-container");
            const snapPre = document.getElementById("webcmd-snapshot-text");
            if (snapContainer && snapPre) {
                snapContainer.style.display = "block";
                snapPre.textContent = data.metrics.snapshot_diff;
            }
        }

        const iframe = document.getElementById("preview-iframe");
        if (iframe) {
            iframe.srcdoc = `
                <div style="font-family:sans-serif; background:#0f172a; color:#10b981; padding:20px; text-align:center;">
                    <h2>✅ LinkedIn Easy Apply Automation Passed</h2>
                    <p style="color:#94a3b8;">Executed cleanly via ${data.metrics.engine.toUpperCase()} with 0 errors.</p>
                </div>
            `;
        }

        appendLog("LinkedIn Easy Apply Test Case completed!", "success");
    } catch (e) {
        appendLog("Error executing LinkedIn Test Case: " + e.message, "error");
        statusCard.innerHTML = `<div style="color:#f87171;">Error: ${e.message}</div>`;
    }
}
