// router.js - Navigation and routing functionality
export class Router {
    constructor(contentLoader, progressTracker) {
        this.contentLoader = contentLoader;
        this.progressTracker = progressTracker;
        this.currentPage = 'home';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme);
        }

        // Logo navigation
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }

        // Mission toggles
        for (let i = 1; i <= 5; i++) {
            const missionToggle = document.getElementById(`mission-${i}-toggle`);
            if (missionToggle) {
                missionToggle.addEventListener('click', () => this.toggleMission(i));
            }
        }

        // Module links
        for (let mission = 1; mission <= 5; mission++) {
            const moduleCount = mission === 4 ? 4 : 3;
            for (let module = 1; module <= moduleCount; module++) {
                const moduleElement = document.querySelector(`[data-route="module-${mission}-${module}"]`);
                if (moduleElement) {
                    moduleElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showModule(mission, module);
                    });
                }
            }
        }

        // Recall toggles (delegated event listener)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('recall-toggle') || e.target.closest('.recall-toggle')) {
                const button = e.target.classList.contains('recall-toggle') ? e.target : e.target.closest('.recall-toggle');
                this.toggleRecall(button);
            }
        });

        // Navigation links (delegated)
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-route]');
            if (navLink) {
                e.preventDefault();
                const route = navLink.getAttribute('data-route');
                if (route.startsWith('module-')) {
                    const [, mission, module] = route.match(/module-(\d+)-(\d+)/);
                    this.showModule(parseInt(mission), parseInt(module));
                } else {
                    this.showPage(route);
                }
            }
        });
    }

    async showPage(page) {
        try {
            // Show loading
            this.showLoading(true);

            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

            // Load and show content
            const mainContent = document.getElementById('main-content');
            
            if (page === 'home') {
                const homeContent = await this.contentLoader.loadHomeContent();
                mainContent.innerHTML = this.contentLoader.sanitizeHTML(homeContent);
                
                // Initialize homepage components
                this.initializeHomepage();
                
                // Render Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            } else {
                // Handle other pages (resources, etc.)
                mainContent.innerHTML = `<div class="page"><div class="content-header"><h1 class="page-title">Page: ${page}</h1></div></div>`;
            }

            // Update nav
            this.updateNavigation(page);
            
            this.currentPage = page;
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page content');
        } finally {
            this.showLoading(false);
        }
    }

    async showModule(mission, module) {
        try {
            // Show loading
            this.showLoading(true);

            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

            // Load module content
            const moduleContent = await this.contentLoader.loadModuleContent(mission, module);
            
            // Generate recall challenge if needed
            let recallChallenge = '';
            if (mission > 1) {
                recallChallenge = this.contentLoader.generateRecallChallenge(mission);
            }

            // Build complete module page
            const completePage = `
                <div class="page active">
                    ${recallChallenge}
                    ${moduleContent}
                    
                    <div class="checkbox">
                        <input type="checkbox" id="complete-${mission}-${module}" 
                               ${this.progressTracker.isModuleComplete(mission, module) ? 'checked' : ''}
                               data-mission="${mission}" data-module="${module}">
                        <label for="complete-${mission}-${module}">Mark this module as complete</label>
                    </div>

                    <div class="module-nav">
                        <button class="nav-button" id="prev-module" data-direction="-1">← Previous</button>
                        <button class="nav-button" id="next-module" data-direction="1">Next →</button>
                    </div>
                </div>
            `;

            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = this.contentLoader.sanitizeHTML(completePage);

            // Setup module-specific event listeners
            this.setupModuleEventListeners(mission, module);

            // Update nav
            this.updateNavigation(`module-${mission}-${module}`);
            
            // Expand mission if needed
            this.ensureMissionExpanded(mission);
            
            // Render Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            this.currentPage = `module-${mission}-${module}`;
        } catch (error) {
            console.error('Error loading module:', error);
            this.showError(`Failed to load module ${mission}-${module}`);
        } finally {
            this.showLoading(false);
        }
    }

    setupModuleEventListeners(mission, module) {
        // Module completion checkbox
        const checkbox = document.getElementById(`complete-${mission}-${module}`);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.progressTracker.setModuleCompletion(mission, module, e.target.checked);
            });
        }

        // Navigation buttons
        const prevButton = document.getElementById('prev-module');
        const nextButton = document.getElementById('next-module');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.navigateModule(mission, module, -1));
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.navigateModule(mission, module, 1));
        }

        // Update button states
        this.updateNavigationButtons(mission, module);
    }

    updateNavigationButtons(mission, module) {
        const prevButton = document.getElementById('prev-module');
        const nextButton = document.getElementById('next-module');
        
        if (prevButton) {
            prevButton.disabled = (mission === 1 && module === 1);
        }
        
        if (nextButton) {
            nextButton.disabled = (mission === 5 && module === 3);
        }
    }

    navigateModule(currentMission, currentModule, direction) {
        // Calculate next module
        let nextMission = currentMission;
        let nextModule = currentModule + direction;

        // Handle module boundaries
        const moduleCount = currentMission === 4 ? 4 : 3;
        if (nextModule > moduleCount) {
            nextMission++;
            nextModule = 1;
        } else if (nextModule < 1) {
            nextMission--;
            nextModule = nextMission === 4 ? 4 : 3;
        }

        // Check bounds
        if (nextMission < 1 || nextMission > 5) return;

        // Navigate
        this.showModule(nextMission, nextModule);
    }

    navigateToMission(mission) {
        // Navigate to first module of the mission
        this.showModule(mission, 1);
    }

    navigateToModule(mission, module) {
        // Navigate to specific module
        this.showModule(mission, module);
    }

    toggleMission(mission) {
        const modules = document.getElementById(`mission-${mission}-modules`);
        const arrow = document.getElementById(`mission-${mission}-arrow`);
        const toggle = document.getElementById(`mission-${mission}-toggle`);

        if (!modules || !arrow || !toggle) return;

        if (modules.classList.contains('expanded')) {
            modules.classList.remove('expanded');
            arrow.textContent = '▶';
            toggle.classList.remove('active');
        } else {
            // Close other missions
            for (let i = 1; i <= 5; i++) {
                if (i !== mission) {
                    const otherModules = document.getElementById(`mission-${i}-modules`);
                    const otherArrow = document.getElementById(`mission-${i}-arrow`);
                    const otherToggle = document.getElementById(`mission-${i}-toggle`);
                    
                    if (otherModules) otherModules.classList.remove('expanded');
                    if (otherArrow) otherArrow.textContent = '▶';
                    if (otherToggle) otherToggle.classList.remove('active');
                }
            }

            modules.classList.add('expanded');
            arrow.textContent = '▼';
            toggle.classList.add('active');
        }
    }

    ensureMissionExpanded(mission) {
        const modules = document.getElementById(`mission-${mission}-modules`);
        if (modules && !modules.classList.contains('expanded')) {
            this.toggleMission(mission);
        }
    }

    toggleRecall(button) {
        const content = button.nextElementSibling;
        const arrow = button.querySelector('span');
        
        if (!content || !arrow) return;
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            arrow.textContent = '▼';
        } else {
            content.classList.add('expanded');
            arrow.textContent = '▲';
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeText = document.getElementById('theme-text');
        
        if (body.getAttribute('data-theme') === 'light') {
            body.removeAttribute('data-theme');
            if (themeText) themeText.innerHTML = '🌙 Dark Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            if (themeText) themeText.innerHTML = '☀️ Light Mode';
            localStorage.setItem('theme', 'light');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.setAttribute('data-theme', 'light');
            const themeText = document.getElementById('theme-text');
            if (themeText) themeText.innerHTML = '☀️ Light Mode';
        }
    }

    updateNavigation(currentPage) {
        // Update nav link states
        document.querySelectorAll('.nav-link, .module-link').forEach(link => {
            link.classList.remove('active');
        });

        // Find and activate current nav item
        const currentNavItem = document.querySelector(`[data-route="${currentPage}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
        }
    }

    initializeHomepage() {
        // Load autonomy spectrum diagram
        this.loadAutonomySpectrum();
        
        // Journey map progress is updated by the main app's updateProgressUI()
    }

    loadAutonomySpectrum() {
        const container = document.getElementById('autonomy-spectrum');
        if (container) {
            // Create the autonomy spectrum SVG
            container.innerHTML = `
                <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.1" />
                            <stop offset="50%" stop-color="var(--accent)" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="var(--success)" stop-opacity="0.1" />
                        </linearGradient>
                    </defs>
                    
                    <rect x="50" y="80" width="700" height="40" fill="url(#spectrumGrad)" rx="20"/>
                    
                    <!-- Spectrum labels -->
                    <text x="100" y="75" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="bold">Manual</text>
                    <text x="300" y="75" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="bold">Assisted</text>
                    <text x="500" y="75" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="bold">Augmented</text>
                    <text x="700" y="75" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="bold">Autonomous</text>
                    
                    <!-- Current position marker -->
                    <circle cx="350" cy="100" r="8" fill="var(--accent)" stroke="var(--bg-primary)" stroke-width="3"/>
                    <text x="350" y="140" text-anchor="middle" fill="var(--accent)" font-size="12" font-weight="bold">You are here</text>
                    
                    <!-- Target position -->
                    <circle cx="550" cy="100" r="8" fill="var(--success)" stroke="var(--bg-primary)" stroke-width="3"/>
                    <text x="550" y="140" text-anchor="middle" fill="var(--success)" font-size="12" font-weight="bold">Course goal</text>
                </svg>
            `;
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    showError(message) {
        console.error(message);
        // Could implement a proper error display here
    }
}