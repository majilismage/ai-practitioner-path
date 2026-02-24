// app.js - Main application initialization
import { ProgressTracker } from './progress.js?v=5';
import { ContentLoader } from './content.js?v=5';
import { Router } from './router.js?v=6';

class AIPath {
    constructor() {
        this.progressTracker = new ProgressTracker();
        this.contentLoader = new ContentLoader(this.progressTracker);
        this.router = new Router(this.contentLoader, this.progressTracker);
        
        // Make router globally available for onclick handlers in content
        window.router = this.router;
        
        this.init();
    }

    async init() {
        // Load theme
        this.router.loadTheme();
        
        // Populate navigation (includes theme toggle)
        this.populateNavigation();
        
        // Bind sidebar elements (created by populateNavigation, after router's setupEventListeners)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.router.toggleTheme());
        }
        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => this.router.closeMobileMenu());
        }
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Update progress display
        this.updateProgressUI();
        
        // Load initial page
        await this.router.showPage('home');
        
        // Remove loading class
        document.body.classList.remove('loading');
        
        // Setup error handling
        this.setupErrorHandling();
    }

    updateProgressUI() {
        // Update header progress bar
        const progress = this.progressTracker.getOverallProgress();
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}% Complete`;

        // Update mission status indicators in sidebar
        for (let m = 1; m <= 5; m++) {
            const statusEl = document.getElementById(`mission-${m}-status`);
            if (statusEl && this.progressTracker.isMissionComplete(m)) {
                statusEl.classList.remove('incomplete');
                statusEl.classList.add('complete');
                statusEl.textContent = '✓';
            }
        }
    }

    populateNavigation() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const navigationHTML = `
            <button class="sidebar-close" id="sidebar-close">
                <i data-lucide="x"></i>
            </button>
            <!-- Quick Navigation -->
            <nav class="nav-section">
                <h3 class="nav-title">Navigation</h3>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-route="home"><i data-lucide="home"></i> Overview</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="resources"><i data-lucide="library"></i> Resources</a>
                    </li>
                </ul>
            </nav>

            <!-- Mission Navigation -->
            <nav class="nav-section">
                <h3 class="nav-title">Course Structure</h3>
                <ul class="nav-list">
                    ${this.generateMissionNavigation()}
                </ul>
            </nav>

            <!-- Theme Toggle -->
            <div class="sidebar-theme-toggle">
                <button class="theme-toggle" id="theme-toggle">
                    <i data-lucide="moon" id="theme-icon"></i>
                    <span id="theme-text">Dark Mode</span>
                </button>
            </div>
        `;

        sidebar.innerHTML = navigationHTML;
    }

    generateMissionNavigation() {
        const missions = [
            {
                title: "Mission 1: Foundation",
                modules: [
                    "The CRAFT of Prompting",
                    "AI in Your Office Suite", 
                    "Beyond Templates — Building Your First AI Workflow"
                ]
            },
            {
                title: "Mission 2: Strategic Implementation",
                modules: [
                    "AI Capability Map",
                    "Workflow Design for AI Integration",
                    "Risk Assessment and Compliance"
                ]
            },
            {
                title: "Mission 3: Advanced Techniques", 
                modules: [
                    "Advanced Prompting Strategies",
                    "Multi-Agent Workflows",
                    "AI-Human Collaboration Patterns"
                ]
            },
            {
                title: "Mission 4: Building AI Systems",
                modules: [
                    "Introduction to AI Agents and Tools",
                    "Building Your First AI Agent",
                    "Data Integration and API Workflows",
                    "Production AI System Design"
                ]
            },
            {
                title: "Mission 5: Advanced Practice & Leadership",
                modules: [
                    "Leading AI Transformation",
                    "Advanced Case Studies", 
                    "Building an AI-First Organization"
                ]
            }
        ];

        return missions.map((mission, missionIndex) => {
            const missionNumber = missionIndex + 1;
            const moduleLinks = mission.modules.map((moduleTitle, moduleIndex) => {
                const moduleNumber = moduleIndex + 1;
                return `
                    <a href="#" class="module-link" data-route="module-${missionNumber}-${moduleNumber}">
                        <div class="module-status" id="module-${missionNumber}-${moduleNumber}-status"></div>
                        ${moduleTitle}
                    </a>
                `;
            }).join('');

            return `
                <li class="nav-item">
                    <button class="mission-toggle" id="mission-${missionNumber}-toggle" type="button">
                        <div class="mission-status incomplete" id="mission-${missionNumber}-status">${missionNumber}</div>
                        ${mission.title}
                        <span class="mission-arrow" id="mission-${missionNumber}-arrow">▶</span>
                    </button>
                    <div class="mission-modules" id="mission-${missionNumber}-modules">
                        ${moduleLinks}
                    </div>
                </li>
            `;
        }).join('');
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
}

// Security: Validate localStorage data before use
function validateProgressData(data) {
    if (typeof data !== 'object' || data === null) return {};
    
    const validated = {};
    for (const [mission, modules] of Object.entries(data)) {
        const missionNum = parseInt(mission);
        if (isNaN(missionNum) || missionNum < 1 || missionNum > 5) continue;
        
        if (typeof modules === 'object' && modules !== null) {
            validated[missionNum] = {};
            for (const [module, timestamp] of Object.entries(modules)) {
                const moduleNum = parseInt(module);
                const maxModules = missionNum === 4 ? 4 : 3;
                
                if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > maxModules) continue;
                if (typeof timestamp === 'number' && timestamp > 0) {
                    validated[missionNum][moduleNum] = timestamp;
                }
            }
        }
    }
    
    return validated;
}

// Override localStorage getter for progress to validate data
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
    const value = originalGetItem.call(this, key);
    if (key === 'ai-practitioner-progress' && value) {
        try {
            const parsed = JSON.parse(value);
            const validated = validateProgressData(parsed);
            return JSON.stringify(validated);
        } catch (error) {
            console.warn('Invalid progress data in localStorage, resetting');
            localStorage.removeItem(key);
            return '{}';
        }
    }
    return value;
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AIPath();
});

// Fallback for module loading errors
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('.js')) {
        console.error('Module loading failed:', event.filename);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                <h1>Loading Error</h1>
                <p>Failed to load application modules. Please check your internet connection and try refreshing.</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
});