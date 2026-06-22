import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
    persist(
        (set) => ({
            // User & Auth State
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            ownerEmail: null,
            setOwner: (email) => set({ ownerEmail: email }),

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    ownerEmail: null,
                    activeBusiness: null,
                    scenarios: [],
                    projects: [],
                    activeProjectId: null
                });
                Object.keys(localStorage).filter(k => k.startsWith('dt_')).forEach(k => localStorage.removeItem(k));
                localStorage.removeItem('business-twin-storage');
            },

            resetStore: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    ownerEmail: null,
                    activeBusiness: null,
                    scenarios: [],
                    projects: [],
                    activeProjectId: null,
                    theme: 'dark'
                });
                Object.keys(localStorage).filter(k => k.startsWith('dt_')).forEach(k => localStorage.removeItem(k));
                localStorage.removeItem('business-twin-storage');
            },

            // Business Context — NOT persisted to localStorage (comes from DB)
            activeBusiness: null,
            scenarios: [],
            setActiveBusiness: (business) => set({ activeBusiness: business }),
            setScenarios: (scenarios) => set({ scenarios }),

            // Multi-project state
            projects: [],
            activeProjectId: null,
            setProjects: (projects) => set({ projects }),
            setActiveProjectId: (id) => set({ activeProjectId: id }),

            // Clear all project data (for "New Project" flow)
            clearProjectData: () => {
                set({ activeBusiness: null, scenarios: [], activeProjectId: null });
                Object.keys(localStorage).filter(k => k.startsWith('dt_config_')).forEach(k => localStorage.removeItem(k));
            },

            // UI State — these ARE safe to persist
            isSidebarOpen: true,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

            // Global Settings
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

            // Language / localization
            language: 'en',
            setLanguage: (language) => set({ language }),
            toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'ar' : 'en' })),
        }),
        {
            name: 'business-twin-storage',
            // Only persist UI preferences + activeProjectId, NOT full business data
            partialize: (state) => ({
                theme: state.theme,
                language: state.language,
                isSidebarOpen: state.isSidebarOpen,
                ownerEmail: state.ownerEmail,
                activeProjectId: state.activeProjectId,
            }),
        }
    )
);
