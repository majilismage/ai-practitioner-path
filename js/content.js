// content.js - Content loading and rendering functionality
export class ContentLoader {
    constructor(progressTracker) {
        this.progressTracker = progressTracker;
        this.cache = new Map();
    }

    async loadModuleContent(mission, module) {
        const cacheKey = `module-${mission}-${module}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`/content/mission-${mission}/module-${mission}-${module}.html`);
            
            if (!response.ok) {
                throw new Error(`Failed to load module content: ${response.status}`);
            }

            const content = await response.text();
            this.cache.set(cacheKey, content);
            return content;
        } catch (error) {
            console.warn(`Could not load module ${mission}-${module}:`, error);
            return this.getPlaceholderContent(mission, module);
        }
    }

    async loadHomeContent() {
        try {
            const response = await fetch('/content/home.html');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('Could not load home content:', error);
        }
        return this.getDefaultHomeContent();
    }

    getPlaceholderContent(mission, module) {
        return `
            <div class="content-header">
                <div class="page-subtitle">Module ${mission}.${module}</div>
                <h1 class="page-title">Module Coming Soon</h1>
                <p class="module-briefing">This module is currently being developed. Please check back later.</p>
            </div>
            <div class="content-body">
                <div class="card">
                    <h3 class="card-title">Module in Development</h3>
                    <div class="card-content">
                        <p>
                            This module will be available soon. In the meantime, you can explore the other available modules 
                            or check out the resource library for additional learning materials.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultHomeContent() {
        return `
            <div class="content-header">
                <div class="hero-section">
                    <h1 class="hero-title">The AI Practitioner's Path</h1>
                    <p class="hero-subtitle">
                        A 5-week intensive programme designed to transform how enterprise professionals 
                        use AI — from basic prompting to building production systems that multiply your impact.
                    </p>
                </div>
            </div>
            <div class="content-body">
                <div class="card animate-in animate-in-delay-3">
                    <h3 class="card-title">Current State of AI Autonomy</h3>
                    <div class="diagram-container">
                        <h4 class="diagram-title">The Autonomy Spectrum: Where We Are & Where We're Going</h4>
                        <div id="autonomy-spectrum"></div>
                    </div>
                </div>

                <div class="card animate-in animate-in-delay-4">
                    <h3 class="card-title">Your Learning Journey</h3>
                    <div class="journey-map" id="journey-map">
                        ${this.generateJourneyMap()}
                    </div>
                </div>

                <div class="card animate-in animate-in-delay-5">
                    <h3 class="card-title">Course Structure</h3>
                    <div class="card-content">
                        <p>This programme is structured as 5 progressive missions, each building on the previous:</p>
                        <ul>
                            <li><strong>Mission 1:</strong> Foundation - Master the fundamentals of effective AI collaboration</li>
                            <li><strong>Mission 2:</strong> Mental Models - Understand what AI can and can't do strategically</li>
                            <li><strong>Mission 3:</strong> Professional Application - Deploy AI tools in real work contexts</li>
                            <li><strong>Mission 4:</strong> Agent Systems - Build AI agents that work independently</li>
                            <li><strong>Mission 5:</strong> Production Systems - Scale and maintain AI solutions safely</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    generateJourneyMap() {
        const missions = [
            { title: "Foundation", modules: "3 modules" },
            { title: "Mental Models", modules: "3 modules" },
            { title: "Professional Application", modules: "3 modules" },
            { title: "Agent Systems", modules: "4 modules" },
            { title: "Production Systems", modules: "3 modules" }
        ];

        return missions.map((mission, index) => `
            <div class="journey-mission" onclick="router.navigateToMission(${index + 1})">
                <div class="journey-mission-number" id="journey-${index + 1}">${index + 1}</div>
                <div class="journey-mission-title">${mission.title}</div>
                <div class="journey-mission-modules">${mission.modules}</div>
            </div>
        `).join('');
    }

    formatContent(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .split('\n\n')
            .map(paragraph => {
                const trimmed = paragraph.trim();
                
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const items = paragraph.split('\n').filter(line => line.trim());
                    return '<ul>' + items.map(item => `<li>${item.replace(/^[\-\*]\s*/, '')}</li>`).join('') + '</ul>';
                }
                
                if (trimmed.startsWith('1. ') || /^\d+\.\s/.test(trimmed)) {
                    const items = paragraph.split('\n').filter(line => line.trim());
                    return '<ol>' + items.map(item => `<li>${item.replace(/^\d+\.\s*/, '')}</li>`).join('') + '</ol>';
                }
                
                return `<p>${paragraph}</p>`;
            })
            .join('');
    }

    generateRecallChallenge(mission) {
        const challenges = {
            2: [
                "Explain the CRAFT framework in one sentence without looking it up.",
                "Name two specific things Microsoft Copilot does exceptionally well.",
                "What's the difference between using AI as a tool vs. building an AI system?"
            ],
            3: [
                "Which AI model would you choose for creative brainstorming and why?",
                "What is a context window and why does it matter?",
                "Describe one key insight from your capability mapping exercise."
            ],
            4: [
                "What's the difference between Claude Code and regular Claude chat?",
                "Name three MCP primitives and give an example of each.",
                "When would you use a development environment vs regular chat?"
            ],
            5: [
                "What's the difference between a Skill and an Agent?",
                "Name three things OpenClaw can do that a Claude chat subscription cannot.",
                "What are guardrails in the context of AI agents, and why do they matter?"
            ]
        };

        const questions = challenges[mission] || [];
        if (questions.length === 0) return '';

        return `
            <div class="recall-challenge">
                <button class="recall-toggle" type="button" data-mission="${mission}">
                    🧠 Recall Challenge: Mission ${mission-1} Review
                    <span>▼</span>
                </button>
                <div class="recall-content">
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">
                            Before diving into new material, test your retention from the previous mission:
                        </p>
                        <ol class="recall-questions">
                            ${questions.map(q => `<li>${q}</li>`).join('')}
                        </ol>
                        <p style="color: var(--text-muted); font-size: 14px; margin-top: 16px;">
                            Don't look back at the previous modules. Write down your answers, then check them later.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    sanitizeHTML(html) {
        // Basic HTML sanitization - in a real app you'd use a library like DOMPurify
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove script tags and other potentially dangerous elements
        const scripts = div.querySelectorAll('script, object, embed, iframe');
        scripts.forEach(script => script.remove());
        
        // Remove on* attributes
        const elements = div.querySelectorAll('*');
        elements.forEach(el => {
            for (const attr of el.attributes) {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            }
        });
        
        return div.innerHTML;
    }
}