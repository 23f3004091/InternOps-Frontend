const main = document.getElementById("main");

// --- STATE MANAGEMENT ---
let currentResult = null; // Store API result here

// --- INITIAL RENDER ---
function init() {
    main.innerHTML = ""; // Clear
    
    // 1. Surface Card
    const surface = document.createElement("div");
    surface.className = "surface";
    surface.id = "surface-card";

    // 2. Header
    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `
        <img src="assets/logo-removebg.png" alt="InternOps" class="logo-img">
        <div class="header-text">
            <h1>InternOps</h1>
            <p>Smart Filter Extension</p>
        </div>
    `;

    // 3. Input View Container
    const inputView = document.createElement("div");
    inputView.id = "input-view";
    inputView.className = "control-stack";
    
    inputView.innerHTML = `
        <div class="select-wrapper">
            <label for="mode">Select Strategy</label>
            <select name="mode" id="mode">
                <option value="strict">Strict Mode</option>
                <option value="real-world" selected>Real World Scenario</option>
                <option value="brutal">Brutal Mode</option>
            </select>
        </div>
        <button id="analyze">Analyze Resume</button>
    `;

    // 4. Result View Container (Starts empty & hidden)
    const resultView = document.createElement("div");
    resultView.id = "result-view";
    resultView.className = "hidden"; 

    // Assemble
    surface.appendChild(header);
    surface.appendChild(inputView);
    surface.appendChild(resultView);
    main.appendChild(surface);

    // Event Listeners
    // NOTE: In extensions, always add listeners in JS, never in HTML onclick=""
    document.getElementById("analyze").addEventListener("click", handleAnalyzeClick);
}

// --- LOGIC ---

async function handleAnalyzeClick() {
    const btn = document.getElementById("analyze");
    const originalText = btn.innerText;

    // Loading State
    btn.classList.add("loading");
    btn.innerHTML = `<span class="spinner"></span> AI Analysis...`;

    // Fetch Result
    const data = await fetchResult(8); 

    if (data) {
        currentResult = data.final_result;
        transitionToResults();
    } else {
        btn.innerText = "Error";
        setTimeout(() => { 
            btn.classList.remove("loading");
            btn.innerText = originalText; 
        }, 2000);
    }
}

function transitionToResults() {
    const inputView = document.getElementById("input-view");
    const resultView = document.getElementById("result-view");
    
    // Hide inputs
    inputView.classList.add("hidden");
    
    // Show Results
    resultView.classList.remove("hidden");
    renderResultUI();
}

function renderResultUI() {
    const container = document.getElementById("result-view");
    
    // 1. Create Layout with ID-based buttons
    container.innerHTML = `
        <div class="tabs-container">
            <button id="tab-ats" class="tab-btn active" data-target="ats">ATS Check</button>
            <button id="tab-recruiter" class="tab-btn" data-target="recruiter">Recruiter</button>
            <button id="tab-hm" class="tab-btn" data-target="hm">Engineering</button>
        </div>
        <div id="tab-content" class="result-pane">
            </div>
        <button id="reset">Analyze Another</button>
    `;

    // 2. Attach Event Listeners (Crucial for Chrome Extensions)
    document.getElementById("tab-ats").addEventListener("click", () => switchTab('ats'));
    document.getElementById("tab-recruiter").addEventListener("click", () => switchTab('recruiter'));
    document.getElementById("tab-hm").addEventListener("click", () => switchTab('hm'));

    // Bind Reset
    document.getElementById("reset").addEventListener("click", () => {
        location.reload(); 
    });

    // Default Tab
    renderTabContent('ats');
}

function switchTab(tabName) {
    // 1. Visual: Update Active Button State
    // We use data-target to ensure we toggle the exact right button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.dataset.target === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Content: Render the data
    renderTabContent(tabName);
}

function renderTabContent(tabName) {
    const content = document.getElementById("tab-content");
    let html = "";
    
    // Helper: Create colored badge
    const getBadge = (decision) => {
        const cls = (decision === "PASS" || decision === "HIRE") ? "badge-pass" : "badge-fail";
        return `<span class="decision-badge ${cls}">${decision}</span>`;
    };

    // --- LOGIC MAPPING ---
    if (tabName === 'ats') {
        const data = currentResult.ats_result;
        html = `
            <div class="score-row">
                <div>
                    <div class="score-label">Match Score</div>
                    <div class="big-score" style="color: #8b5cf6">${data.match_score}%</div>
                </div>
                ${getBadge(data.decision)}
            </div>
            
            <div class="section-title">Missing Keywords</div>
            <div class="pill-container">
                ${data.missing_keywords.length > 0 
                    ? data.missing_keywords.map(k => `<span class="pill missing">${k}</span>`).join('') 
                    : '<span class="pill">None! Good job.</span>'}
            </div>

            <div class="section-title">ATS Feedback</div>
            <div class="text-block">${data.feedback}</div>
        `;
    } 
    else if (tabName === 'recruiter') {
        const data = currentResult.recruiter_result;
        html = `
            <div class="score-row">
                <div>
                    <div class="score-label">Career Progression</div>
                    <div class="big-score" style="color: #f59e0b">${data.career_progression_score}/100</div>
                </div>
                ${getBadge(data.decision)}
            </div>
            
            <div class="section-title">Soft Skills Detected</div>
            <div class="pill-container">
                ${data.soft_skills_detected.map(s => `<span class="pill">${s}</span>`).join('')}
            </div>

            <div class="section-title">Recruiter Notes</div>
            <div class="text-block">${data.feedback}</div>
        `;
    } 
    else if (tabName === 'hm') {
        const data = currentResult.hm_result;
        html = `
            <div class="score-row">
                <div>
                    <div class="score-label">Tech Depth</div>
                    <div class="big-score" style="color: #10b981">${data.tech_depth_score}</div>
                </div>
                 <div>
                    <div class="score-label">Impact</div>
                    <div class="big-score" style="color: #0ea5e9">${data.project_impact_score}</div>
                </div>
                ${getBadge(data.decision)}
            </div>
            
            <div class="section-title">Stack Alignment</div>
            <div class="text-block" style="border-left: 3px solid #10b981; background: var(--bg-surface);">
                ${data.stack_alignment}
            </div>

            <div class="section-title">Engineering Lead Feedback</div>
            <div class="text-block">${data.feedback.replace(/\n/g, '<br>')}</div>
        `;
    }

    // Inject with fade animation
    content.innerHTML = html;
    
    // Trigger animation restart
    content.classList.remove('result-pane');
    void content.offsetWidth; // trigger reflow
    content.classList.add('result-pane');
}

// --- API ---
async function fetchResult(analysisId){
    try{
        const res = await fetch(`http://localhost:8000/analysis_result/${analysisId}`);
        const data = await res.json()
        console.log("Final Result:", data);
        return data;
    }catch(error){
        console.error(error);
        return null;
    }
}

// Run
init();