import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useAppStore } from './store/useAppStore'
import { useSimulation } from './hooks/useSimulation'
import api from './lib/api'

// Pages
import LandingPage from './pages/LandingPage'
import BusinessBuilder from './pages/BusinessBuilder'
import Dashboard from './pages/Dashboard'
import ScenarioPage from './pages/ScenarioPage'
import ReportsPage from './pages/ReportsPage'
import LocationPage from './pages/LocationPage'
import OptimizationPage from './pages/OptimizationPage'
import WeeklyReportPage from './pages/WeeklyReportPage'
import VisualizerPage from './pages/VisualizerPage'
import AuthPage from './pages/AuthPage'
import MarketplacePage from './pages/MarketplacePage'
import CollaborationPage from './pages/CollaborationPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ResearchPage from './pages/ResearchPage'
import ModelAccuracyPanel from './components/ModelAccuracyPanel'
import DatasetExplorer from './pages/DatasetExplorer'
import ProjectSelector from './pages/ProjectSelector'
import BenchmarksPage from './pages/BenchmarksPage'
import GamificationPage from './pages/GamificationPage'
import PublicTwinView from './pages/PublicTwinView'
import DecisionToolsPage from './pages/DecisionToolsPage'
import SmartActionBar from './components/SmartActionBar'
import GuidedTour from './components/GuidedTour'
import { enableAutoTranslate, disableAutoTranslate } from './lib/autoTranslate'

// Components
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import AIChatPanel from './components/AIChatPanel'
import { Button } from './components/elements/Button'
import { Card } from './components/elements/Card'
import { motion, AnimatePresence } from 'framer-motion'

// Derive a readable project name even when the user left businessName blank
function deriveProjectName(config) {
    if (config?.projectName && config.projectName.trim()) return config.projectName.trim();
    if (config?.businessName && config.businessName.trim()) return config.businessName.trim();
    const t = config?.businessType;
    const nice = t ? t.charAt(0).toUpperCase() + t.slice(1) : 'New';
    return `${nice} Project`;
}

export const PAGES = {
    LANDING: 'landing',
    AUTH: 'auth',
    BUILDER: 'builder',
    PROJECT_SELECTOR: 'project-selector',
    DASHBOARD: 'dashboard',
    SCENARIOS: 'scenarios',
    REPORTS: 'reports',
    LOCATION: 'location',
    OPTIMIZATION: 'optimization',
    WEEKLY_REPORT: 'weekly_report',
    VISUALIZER: 'visualizer',
    MARKETPLACE: 'marketplace',
    COLLABORATION: 'collaboration',
    RESET_PASSWORD: 'reset-password',
    ML_ANALYTICS: 'ml_analytics',
    RESEARCH: 'research',
    DATASETS: 'datasets',
    BENCHMARKS: 'benchmarks',
    GAMIFICATION: 'gamification',
    DECISION_TOOLS: 'decision_tools'
};

function AppContent() {
    const { user, loading: authLoading } = useAuth();
    const {
        activeBusiness,
        scenarios,
        isSidebarOpen,
        toggleSidebar,
        setScenarios,
        setActiveBusiness,
        setActiveProjectId,
        activeProjectId,
        clearProjectData,
        resetStore,
        ownerEmail,
        setOwner,
        theme,
        language
    } = useAppStore();

    // Apply theme (light/dark) and language direction (LTR/RTL) to the document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('light', theme === 'light');
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        root.lang = language || 'en';
    }, [theme, language]);

    // Whole-page auto-translation: translate everything to Arabic, restore on English
    useEffect(() => {
        if (language === 'ar') enableAutoTranslate('ar');
        else disableAutoTranslate();
    }, [language]);

    const [currentPage, setCurrentPage] = useState(() => {
        const path = window.location.pathname.substring(1).split('/')[0];
        if (path && Object.values(PAGES).includes(path)) return path;
        return PAGES.LANDING;
    });
    const [chatOpen, setChatOpen] = useState(false);
    const [results, setResults] = useState(null);
    const [socket, setSocket] = useState(null);
    const [showTour, setShowTour] = useState(false);

    // Show the guided tour once for new users
    useEffect(() => {
        if (user && !localStorage.getItem('dt_tour_seen')) {
            const tmr = setTimeout(() => setShowTour(true), 1200);
            return () => clearTimeout(tmr);
        }
    }, [user]);
    const closeTour = () => { setShowTour(false); localStorage.setItem('dt_tour_seen', '1'); };
    const { processConfig } = useSimulation();
    const projectSelectorShownRef = useRef(false);

    // 🌐 INITIALIZE WEBSOCKET
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const newSocket = io(apiUrl.replace('/api/v1', ''), {
            transports: ['websocket'],
            reconnection: true
        });
        newSocket.on('connect', () => console.log('[Socket] Connected to Neural Core'));
        newSocket.on('live-update', (pulse) => console.log('[Socket] Physical Pulse:', pulse));
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    // ─── 🛡️ STORE GUARDIAN: Detect account change and wipe state ───
    useEffect(() => {
        if (!user) return;

        if (ownerEmail && ownerEmail !== user.email) {
            console.warn(`[Guardian] User mismatch (${ownerEmail} vs ${user.email}). Wiping store.`);
            resetStore();
            setResults(null);
            setOwner(user.email);
            projectSelectorShownRef.current = false;
        }

        if (!ownerEmail && user.email) {
            setOwner(user.email);
        }
    }, [user, ownerEmail, resetStore, setOwner]);

    // Sync history
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state?.page) setCurrentPage(event.state.page);
            else setCurrentPage(PAGES.LANDING);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (currentPage === PAGES.RESET_PASSWORD) return;
        const currentPathName = window.location.pathname.substring(1).split('/')[0] || PAGES.LANDING;
        if (currentPathName !== currentPage) {
            const path = currentPage === PAGES.LANDING ? '/' : `/${currentPage}`;
            if (window.location.pathname !== path) {
                if (currentPage === PAGES.DASHBOARD && (window.location.pathname === '/' || window.location.pathname === '/auth')) {
                    window.history.replaceState({ page: currentPage }, '', path);
                } else {
                    window.history.pushState({ page: currentPage }, '', path);
                }
            }
        }
    }, [currentPage]);

    // ─── Auth redirect + project loading ───────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            if (results) setResults(null);
            projectSelectorShownRef.current = false;
            return;
        }

        // Process activeBusiness into results if not done yet
        if (activeBusiness && !results) {
            try {
                setResults(processConfig(activeBusiness, false));
            } catch (e) {
                console.error('Failed to process active business:', e);
            }
        }

        // A just-logged-in user ALWAYS lands on the project selector.
        // (Deep refreshes on /dashboard, /visualizer, etc. keep their page
        //  because currentPage is restored from the URL, not AUTH/LANDING.)
        if (currentPage === PAGES.AUTH || currentPage === PAGES.LANDING) {
            if (projectSelectorShownRef.current) return;
            projectSelectorShownRef.current = true;
            setCurrentPage(PAGES.PROJECT_SELECTOR);
        }
    }, [user, authLoading, results, currentPage, processConfig, activeBusiness]);

    // Redirect to landing if not logged in and trying to access app pages
    useEffect(() => {
        if (!authLoading && !user && currentPage !== PAGES.LANDING && currentPage !== PAGES.AUTH && currentPage !== PAGES.RESET_PASSWORD) {
            setCurrentPage(PAGES.LANDING);
        }
    }, [user, authLoading, currentPage]);

    // SYNC TO CLOUD — Real DB persistence (debounced auto-save)
    useEffect(() => {
        if (!user || !activeBusiness || !results) return;
        const syncTimeout = setTimeout(async () => {
            // Read the freshest projectId to avoid stale-closure duplicate creates
            const currentProjectId = useAppStore.getState().activeProjectId;
            try {
                const payload = {
                    projectId: currentProjectId || undefined,
                    projectName: deriveProjectName(activeBusiness),
                    businessName: activeBusiness.businessName,
                    businessType: activeBusiness.businessType,
                    location: activeBusiness.location,
                    avgTicket: activeBusiness.avgTicket,
                    config: activeBusiness,
                    summary: results.summary,
                    risks: results.risks,
                    insights: results.insights || [],
                    scenarios: scenarios || []
                };
                const res = await api.post('/business', payload);
                if (res.data?.data?._id && res.data.data._id !== currentProjectId) {
                    setActiveProjectId(res.data.data._id);
                }
                // Keep the local projects list fresh
                const saved = res.data?.data;
                if (saved) {
                    const list = useAppStore.getState().projects;
                    const idx = list.findIndex(p => p._id === saved._id);
                    const next = idx >= 0
                        ? list.map(p => (p._id === saved._id ? saved : p))
                        : [saved, ...list];
                    useAppStore.getState().setProjects(next);
                }
                console.log('[Sync] Project saved to cloud ✓', saved?._id);
            } catch (err) {
                console.error('[Sync] Cloud sync FAILED:', err.response?.data || err.message);
            }
        }, 2000);
        return () => clearTimeout(syncTimeout);
    }, [user, activeBusiness, results, scenarios]);

    const handleCompleteBuilder = async (config) => {
        const processed = processConfig(config);
        setActiveBusiness(config);
        setResults(processed);
        setCurrentPage(PAGES.DASHBOARD);

        // Persist immediately (don't wait for the debounced auto-save)
        const currentProjectId = useAppStore.getState().activeProjectId;
        try {
            const res = await api.post('/business', {
                projectId: currentProjectId || undefined,
                projectName: deriveProjectName(config),
                businessName: config.businessName,
                businessType: config.businessType,
                location: config.location,
                avgTicket: config.avgTicket,
                config,
                summary: processed.summary,
                risks: processed.risks,
                insights: processed.insights || [],
                scenarios: useAppStore.getState().scenarios || []
            });
            const saved = res.data?.data;
            if (saved?._id) {
                setActiveProjectId(saved._id);
                const list = useAppStore.getState().projects;
                const idx = list.findIndex(p => p._id === saved._id);
                useAppStore.getState().setProjects(
                    idx >= 0 ? list.map(p => (p._id === saved._id ? saved : p)) : [saved, ...list]
                );
            }
            console.log('[Builder] Project persisted ✓', saved?._id);
        } catch (err) {
            console.error('[Builder] Failed to persist project:', err.response?.data || err.message);
        }
    };

    // Create an EMPTY project record immediately, then enter the builder
    const handleStartNewProject = useCallback(async () => {
        clearProjectData();
        setResults(null);
        projectSelectorShownRef.current = true; // don't auto-show selector again
        try {
            const res = await api.post('/business', { projectName: 'Untitled Project' });
            const created = res.data?.data;
            if (created?._id) {
                setActiveProjectId(created._id);
                const list = useAppStore.getState().projects;
                useAppStore.getState().setProjects([created, ...list]);
                console.log('[NewProject] Empty project created ✓', created._id);
            }
        } catch (err) {
            console.error('[NewProject] Failed to create project record:', err.response?.data || err.message);
        }
        setCurrentPage(PAGES.BUILDER);
    }, [clearProjectData, setActiveProjectId]);

    const handleOpenProject = useCallback((project) => {
        // activeBusiness & activeProjectId already set by ProjectSelector
        try {
            const processed = processConfig(project.config, false);
            setResults(processed);
        } catch (e) {
            console.error('Failed to process project config:', e);
        }
        setCurrentPage(PAGES.DASHBOARD);
    }, [processConfig]);

    // Public read-only investor share view — no auth required
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/twin/')) {
        return <PublicTwinView />;
    }

    if (authLoading) return null;

    if (currentPage === PAGES.LANDING) {
        return <LandingPage onGetStarted={() => setCurrentPage(user ? PAGES.PROJECT_SELECTOR : PAGES.AUTH)} onLogin={() => setCurrentPage(PAGES.AUTH)} />;
    }

    if (currentPage === PAGES.AUTH) {
        return <AuthPage onBack={() => setCurrentPage(PAGES.LANDING)} />;
    }

    if (currentPage === PAGES.RESET_PASSWORD) {
        return <ResetPasswordPage onBack={() => setCurrentPage(PAGES.LANDING)} />;
    }

    if (currentPage === PAGES.PROJECT_SELECTOR) {
        return (
            <ProjectSelector
                onContinue={() => setCurrentPage(PAGES.DASHBOARD)}
                onNewProject={handleStartNewProject}
                onOpenProject={handleOpenProject}
            />
        );
    }

    if (currentPage === PAGES.BUILDER) {
        return <BusinessBuilder onComplete={handleCompleteBuilder} onBack={() => setCurrentPage(PAGES.LANDING)} />;
    }

    const renderPage = () => {
        if (!activeBusiness) {
            return (
                <div className="flex items-center justify-center p-8 h-[calc(100vh-120px)]">
                    <Card className="max-w-md w-full p-12 text-center" animate>
                        <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">🏗️</div>
                        <h2 className="text-xl font-display font-bold text-white mb-3 tracking-tight">System Initialization Required</h2>
                        <p className="text-zinc-500 mb-10 leading-relaxed text-sm font-medium">
                            The neural engine requires a business archetype to begin spatial mapping and financial synthesis.
                        </p>
                        <Button className="w-full" onClick={() => setCurrentPage(PAGES.BUILDER)}>
                            Begin System Node Config
                        </Button>
                    </Card>
                </div>
            );
        }

        const commonProps = {
            financialData: results?.summary,
            riskData: results?.risks,
            insights: results?.insights,
            businessConfig: activeBusiness,
            scenarios,
            setScenarios
        };

        switch (currentPage) {
            case PAGES.DASHBOARD: return <Dashboard {...commonProps} />;
            case PAGES.SCENARIOS: return <ScenarioPage {...commonProps} />;
            case PAGES.REPORTS: return <ReportsPage {...commonProps} />;
            case PAGES.LOCATION: return <LocationPage businessConfig={activeBusiness} />;
            case PAGES.OPTIMIZATION: return <OptimizationPage businessConfig={activeBusiness} financialData={results?.summary} />;
            case PAGES.WEEKLY_REPORT: return <WeeklyReportPage {...commonProps} />;
            case PAGES.VISUALIZER: return <VisualizerPage businessConfig={activeBusiness} />;
            case PAGES.MARKETPLACE: return (
                <MarketplacePage
                    businessConfig={activeBusiness}
                    onEquipmentAdded={(updatedConfig) => {
                        const merged = { ...(activeBusiness || {}), ...updatedConfig };
                        setActiveBusiness(merged);
                        try { setResults(processConfig(merged, false)); } catch (_) {}
                    }}
                />
            );
            case PAGES.COLLABORATION: return <CollaborationPage />;
            case PAGES.ML_ANALYTICS: return <ModelAccuracyPanel businessConfig={activeBusiness} financialData={results?.summary} />;
            case PAGES.RESEARCH: return <ResearchPage />;
            case PAGES.DATASETS: return <DatasetExplorer />;
            case PAGES.BENCHMARKS: return <BenchmarksPage businessConfig={activeBusiness} />;
            case PAGES.GAMIFICATION: return <GamificationPage {...commonProps} />;
            case PAGES.DECISION_TOOLS: return <DecisionToolsPage businessConfig={activeBusiness} financialData={results?.summary} />;
            default: return <Dashboard {...commonProps} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-bg-deep overflow-hidden">
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                isOpen={isSidebarOpen}
                businessType={activeBusiness?.businessType}
            />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <TopBar
                    currentPage={currentPage}
                    onToggleSidebar={toggleSidebar}
                    onToggleChat={() => setChatOpen(!chatOpen)}
                    businessConfig={activeBusiness}
                    onNewProject={() => setCurrentPage(PAGES.PROJECT_SELECTOR)}
                />
                <div className="flex-1 p-6 md:p-8">
                    {currentPage === PAGES.DASHBOARD && activeBusiness && (
                        <SmartActionBar config={activeBusiness} summary={results?.summary} risks={results?.risks} />
                    )}
                    {renderPage()}
                </div>
            </main>
            {results?.summary && (
                <AIChatPanel
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    financialData={results.summary}
                    businessConfig={activeBusiness}
                    risks={results.risks?.risks || []}
                />
            )}

            {/* Guided tour + floating launcher */}
            <GuidedTour open={showTour} onClose={closeTour} />
            <button
                onClick={() => setShowTour(true)}
                title="Take a guided tour"
                className="fixed bottom-6 left-6 z-[80] w-11 h-11 rounded-full bg-brand-primary/90 hover:bg-brand-primary text-white text-lg shadow-xl flex items-center justify-center transition-all hover:scale-110"
            >
                ?
            </button>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
