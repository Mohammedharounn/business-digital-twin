import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FinancialEngine, RiskEngine, AIInsightEngine, ScenarioEngine } from '../engine/SimulationEngine';

export function useSimulation() {
    const { user, setActiveBusiness, setScenarios, scenarios } = useAppStore();

    const processConfig = useCallback((config, shouldSave = true) => {
        // 1. Storage
        setActiveBusiness(config);
        if (shouldSave && user) {
            localStorage.setItem(`dt_config_${user.email}`, JSON.stringify(config));
        }

        // 2. Financial Core
        const engine = new FinancialEngine(config);
        const summary = engine.getFinancialSummary();

        // 3. Risk Assessment
        const riskEngine = new RiskEngine(summary, config);
        const risks = riskEngine.assessRisks();

        // 4. AI Intelligence
        const aiEngine = new AIInsightEngine(summary, config);
        const insights = aiEngine.generateInsights();

        // 5. Scenarios
        let finalScenarios = scenarios;
        if (!scenarios || scenarios.length === 0) {
            const presetScenarios = ScenarioEngine.generatePresetScenarios(config);
            finalScenarios = ScenarioEngine.compareScenarios(presetScenarios);
            setScenarios(finalScenarios);
        }

        return { summary, risks, insights, comparedScenarios: finalScenarios };
    }, [user, setActiveBusiness, setScenarios, scenarios]);

    return { processConfig };
}
