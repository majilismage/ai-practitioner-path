/**
 * AI Practitioner's Path - Progress Tracker
 * Secure progress tracking with localStorage and validation
 */

export class ProgressTracker {
    constructor() {
        this.storageKey = 'ai-practitioner-progress';
        this.progress = {};
        this.listeners = new Map();
        
        // Course structure definition
        this.courseStructure = {
            totalMissions: 5,
            modulesPerMission: {
                1: 3, 2: 3, 3: 3, 4: 4, 5: 3
            }
        };
    }

    init() {
        this.loadProgress();
        this.validateProgress();
    }

    // Load progress from localStorage with validation
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Validate the loaded data structure
                if (this.isValidProgressData(parsed)) {
                    this.progress = parsed;
                } else {
                    console.warn('Invalid progress data found, resetting');
                    this.progress = {};
                    this.saveProgress();
                }
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
            this.progress = {};
        }
    }

    // Validate progress data structure and values
    isValidProgressData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check each mission
        for (const [missionStr, modules] of Object.entries(data)) {
            const mission = parseInt(missionStr);
            
            // Validate mission number
            if (!mission || mission < 1 || mission > this.courseStructure.totalMissions) {
                return false;
            }

            // Validate modules structure
            if (!modules || typeof modules !== 'object') {
                return false;
            }

            // Check each module
            for (const [moduleStr, timestamp] of Object.entries(modules)) {
                const module = parseInt(moduleStr);
                const maxModules = this.courseStructure.modulesPerMission[mission];
                
                // Validate module number
                if (!module || module < 1 || module > maxModules) {
                    return false;
                }

                // Validate timestamp
                if (!this.isValidTimestamp(timestamp)) {
                    return false;
                }
            }
        }

        return true;
    }

    isValidTimestamp(timestamp) {
        // Check if it's a valid timestamp (number) and not in the future
        return typeof timestamp === 'number' && 
               timestamp > 0 && 
               timestamp <= Date.now() &&
               timestamp > new Date('2020-01-01').getTime(); // Reasonable minimum date
    }

    // Validate and clean up progress data
    validateProgress() {
        let hasChanges = false;

        for (const [missionStr, modules] of Object.entries(this.progress)) {
            const mission = parseInt(missionStr);
            
            // Remove invalid missions
            if (!mission || mission < 1 || mission > this.courseStructure.totalMissions) {
                delete this.progress[missionStr];
                hasChanges = true;
                continue;
            }

            // Check modules in this mission
            const maxModules = this.courseStructure.modulesPerMission[mission];
            for (const [moduleStr, timestamp] of Object.entries(modules)) {
                const module = parseInt(moduleStr);
                
                // Remove invalid modules or timestamps
                if (!module || module < 1 || module > maxModules || !this.isValidTimestamp(timestamp)) {
                    delete modules[moduleStr];
                    hasChanges = true;
                }
            }

            // Remove empty missions
            if (Object.keys(modules).length === 0) {
                delete this.progress[missionStr];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            this.saveProgress();
            this.emit('progressUpdate');
        }
    }

    // Save progress to localStorage
    saveProgress() {
        try {
            const serialized = JSON.stringify(this.progress);
            localStorage.setItem(this.storageKey, serialized);
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Could implement fallback storage here (e.g., IndexedDB)
        }
    }

    // Set module completion status
    setModuleCompletion(mission, module, completed) {
        // Validate inputs
        if (!this.isValidMissionModule(mission, module)) {
            console.error('Invalid mission/module:', mission, module);
            return false;
        }

        if (completed) {
            // Mark as complete with current timestamp
            if (!this.progress[mission]) {
                this.progress[mission] = {};
            }
            this.progress[mission][module] = Date.now();
        } else {
            // Remove completion
            if (this.progress[mission]) {
                delete this.progress[mission][module];
                
                // Clean up empty mission object
                if (Object.keys(this.progress[mission]).length === 0) {
                    delete this.progress[mission];
                }
            }
        }

        this.saveProgress();
        this.emit('progressUpdate');
        return true;
    }

    // Check if module is complete
    isModuleComplete(mission, module) {
        if (!this.isValidMissionModule(mission, module)) {
            return false;
        }

        return !!(this.progress[mission] && this.progress[mission][module]);
    }

    // Check if entire mission is complete
    isMissionComplete(mission) {
        if (!this.isValidMission(mission)) {
            return false;
        }

        const maxModules = this.courseStructure.modulesPerMission[mission];
        
        for (let module = 1; module <= maxModules; module++) {
            if (!this.isModuleComplete(mission, module)) {
                return false;
            }
        }
        
        return true;
    }

    // Get completion timestamp for a module
    getModuleCompletionTime(mission, module) {
        if (!this.isValidMissionModule(mission, module)) {
            return null;
        }

        return this.progress[mission]?.[module] || null;
    }

    // Get overall progress percentage
    getOverallProgress() {
        const totalModules = this.getTotalModules();
        const completedModules = this.getCompletedModules();
        
        if (totalModules === 0) return 0;
        return Math.round((completedModules / totalModules) * 100);
    }

    // Get total number of modules
    getTotalModules() {
        return Object.values(this.courseStructure.modulesPerMission).reduce((sum, count) => sum + count, 0);
    }

    // Get number of completed modules
    getCompletedModules() {
        let completed = 0;
        
        for (let mission = 1; mission <= this.courseStructure.totalMissions; mission++) {
            const maxModules = this.courseStructure.modulesPerMission[mission];
            for (let module = 1; module <= maxModules; module++) {
                if (this.isModuleComplete(mission, module)) {
                    completed++;
                }
            }
        }
        
        return completed;
    }

    // Get progress for each mission
    getMissionProgress() {
        const missionProgress = {};
        
        for (let mission = 1; mission <= this.courseStructure.totalMissions; mission++) {
            const maxModules = this.courseStructure.modulesPerMission[mission];
            let completedModules = 0;
            
            for (let module = 1; module <= maxModules; module++) {
                if (this.isModuleComplete(mission, module)) {
                    completedModules++;
                }
            }
            
            missionProgress[mission] = {
                completed: completedModules,
                total: maxModules,
                percentage: Math.round((completedModules / maxModules) * 100)
            };
        }
        
        return missionProgress;
    }

    // Get raw progress data (for debugging or export)
    getProgress() {
        return { ...this.progress };
    }

    // Reset all progress (with confirmation)
    resetProgress(confirm = false) {
        if (!confirm) {
            console.warn('Progress reset requires confirmation');
            return false;
        }

        this.progress = {};
        this.saveProgress();
        this.emit('progressUpdate');
        return true;
    }

    // Import progress from external source
    importProgress(progressData) {
        if (!this.isValidProgressData(progressData)) {
            console.error('Invalid progress data for import');
            return false;
        }

        this.progress = { ...progressData };
        this.saveProgress();
        this.emit('progressUpdate');
        return true;
    }

    // Export progress for backup
    exportProgress() {
        return {
            data: { ...this.progress },
            exportedAt: Date.now(),
            version: '1.0'
        };
    }

    // Get learning analytics
    getAnalytics() {
        const analytics = {
            overallProgress: this.getOverallProgress(),
            missionProgress: this.getMissionProgress(),
            completedModules: this.getCompletedModules(),
            totalModules: this.getTotalModules(),
            startedMissions: Object.keys(this.progress).length,
            lastActivity: null,
            studyStreak: 0,
            averageCompletionTime: null
        };

        // Calculate last activity
        let lastTimestamp = 0;
        for (const mission of Object.values(this.progress)) {
            for (const timestamp of Object.values(mission)) {
                if (timestamp > lastTimestamp) {
                    lastTimestamp = timestamp;
                }
            }
        }
        analytics.lastActivity = lastTimestamp || null;

        return analytics;
    }

    // Validation helpers
    isValidMission(mission) {
        const missionNum = parseInt(mission);
        return missionNum >= 1 && missionNum <= this.courseStructure.totalMissions;
    }

    isValidMissionModule(mission, module) {
        if (!this.isValidMission(mission)) {
            return false;
        }

        const missionNum = parseInt(mission);
        const moduleNum = parseInt(module);
        const maxModules = this.courseStructure.modulesPerMission[missionNum];
        
        return moduleNum >= 1 && moduleNum <= maxModules;
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error('Progress event callback error:', error);
                }
            });
        }
    }

    // Get next recommended module
    getNextRecommendedModule() {
        // Find the first incomplete module
        for (let mission = 1; mission <= this.courseStructure.totalMissions; mission++) {
            const maxModules = this.courseStructure.modulesPerMission[mission];
            for (let module = 1; module <= maxModules; module++) {
                if (!this.isModuleComplete(mission, module)) {
                    return { mission, module };
                }
            }
        }
        
        return null; // All modules complete
    }

    // Check if user can access a module (based on prerequisites)
    canAccessModule(mission, module) {
        // For now, allow access to any module
        // Could implement prerequisite logic here
        return this.isValidMissionModule(mission, module);
    }
}

export default ProgressTracker;