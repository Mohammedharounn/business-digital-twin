// ============================================
// Business Digital Twin — Advanced Engines
// ============================================
// Gamification, Location Intelligence,
// Autonomous Optimization, Weekly Reports

import { FinancialEngine, RiskEngine, AIInsightEngine, ScenarioEngine, formatCurrency } from './SimulationEngine';

// ---- Gamification Engine ----
export class GamificationEngine {
    static BADGES = [
        { id: 'first_twin', name: 'First Twin', icon: '🎯', desc: 'Created your first business digital twin', category: 'Milestone', xp: 100 },
        { id: 'scenario_explorer', name: 'Scenario Explorer', icon: '🔄', desc: 'Created 3 or more scenarios', category: 'Simulation', xp: 150 },
        { id: 'risk_tamer', name: 'Risk Tamer', icon: '🛡️', desc: 'Achieved a risk score below 30', category: 'Achievement', xp: 300 },
        { id: 'profit_hunter', name: 'Profit Hunter', icon: '💰', desc: 'Reached 20%+ profit margin', category: 'Financial', xp: 250 },
        { id: 'roi_champion', name: 'ROI Champion', icon: '🏆', desc: 'Achieved 30%+ ROI in first year', category: 'Financial', xp: 350 },
        { id: 'ai_curious', name: 'AI Curious', icon: '🤖', desc: 'Asked 10+ questions to AI advisor', category: 'Engagement', xp: 120 },
        { id: 'optimizer', name: 'Optimizer', icon: '⚡', desc: 'Ran the autonomous optimization engine', category: 'Advanced', xp: 200 },
        { id: 'investor_ready', name: 'Investor Ready', icon: '🏦', desc: 'Achieved 70%+ funding readiness score', category: 'Milestone', xp: 400 },
        { id: 'report_generator', name: 'Report Master', icon: '📄', desc: 'Generated your first PDF report', category: 'Engagement', xp: 100 },
        { id: 'location_scout', name: 'Location Scout', icon: '📍', desc: 'Compared 3+ locations', category: 'Advanced', xp: 180 },
        { id: 'week_streak_3', name: '3-Week Streak', icon: '🔥', desc: 'Active for 3 consecutive weeks', category: 'Engagement', xp: 200 },
        { id: 'week_streak_8', name: '8-Week Streak', icon: '🌟', desc: 'Active for 8 consecutive weeks', category: 'Engagement', xp: 500 },
        { id: 'multi_business', name: 'Portfolio Builder', icon: '📁', desc: 'Created twins for 3+ business types', category: 'Milestone', xp: 300 },
        { id: 'break_even_fast', name: 'Fast Track', icon: '🚀', desc: 'Achieved break-even within 6 months', category: 'Financial', xp: 350 },
        { id: 'cost_cutter', name: 'Cost Cutter', icon: '✂️', desc: 'Reduced costs 15%+ via optimization', category: 'Achievement', xp: 250 },
    ];

    static LEVELS = [
        { level: 1, name: 'Aspiring Founder', minXp: 0, icon: '🌱' },
        { level: 2, name: 'Business Explorer', minXp: 200, icon: '🔍' },
        { level: 3, name: 'Strategy Apprentice', minXp: 500, icon: '📊' },
        { level: 4, name: 'Financial Thinker', minXp: 1000, icon: '💡' },
        { level: 5, name: 'Growth Strategist', minXp: 1800, icon: '📈' },
        { level: 6, name: 'Risk Manager', minXp: 2800, icon: '🛡️' },
        { level: 7, name: 'Business Architect', minXp: 4000, icon: '🏗️' },
        { level: 8, name: 'Visionary Founder', minXp: 5500, icon: '🚀' },
        { level: 9, name: 'Serial Entrepreneur', minXp: 7500, icon: '🏆' },
        { level: 10, name: 'Digital Twin Master', minXp: 10000, icon: '👑' },
    ];

    static evaluateBadges(userData) {
        const earned = [];
        const { scenarioCount, riskScore, profitMargin, roi, chatQuestions, optimizationRuns, fundingScore, reportsGenerated, locationsCompared, streakWeeks, businessTypes, breakEvenMonth, costReduction } = userData;

        if (userData.hasTwin) earned.push('first_twin');
        if (scenarioCount >= 3) earned.push('scenario_explorer');
        if (riskScore <= 30) earned.push('risk_tamer');
        if (profitMargin >= 20) earned.push('profit_hunter');
        if (roi >= 30) earned.push('roi_champion');
        if (chatQuestions >= 10) earned.push('ai_curious');
        if (optimizationRuns >= 1) earned.push('optimizer');
        if (fundingScore >= 70) earned.push('investor_ready');
        if (reportsGenerated >= 1) earned.push('report_generator');
        if (locationsCompared >= 3) earned.push('location_scout');
        if (streakWeeks >= 3) earned.push('week_streak_3');
        if (streakWeeks >= 8) earned.push('week_streak_8');
        if (businessTypes >= 3) earned.push('multi_business');
        if (breakEvenMonth && breakEvenMonth <= 6) earned.push('break_even_fast');
        if (costReduction >= 15) earned.push('cost_cutter');

        return earned;
    }

    static getLevel(xp) {
        let current = GamificationEngine.LEVELS[0];
        for (const lvl of GamificationEngine.LEVELS) {
            if (xp >= lvl.minXp) current = lvl;
        }
        const nextLvl = GamificationEngine.LEVELS.find(l => l.minXp > xp);
        return {
            ...current,
            currentXp: xp,
            nextLevel: nextLvl || null,
            xpToNext: nextLvl ? nextLvl.minXp - xp : 0,
            progress: nextLvl ? ((xp - current.minXp) / (nextLvl.minXp - current.minXp)) * 100 : 100
        };
    }

    static calculateXp(earnedBadgeIds) {
        return earnedBadgeIds.reduce((total, id) => {
            const badge = GamificationEngine.BADGES.find(b => b.id === id);
            return total + (badge?.xp || 0);
        }, 0);
    }
}


// ---- Location Intelligence Engine ----
export class LocationIntelligenceEngine {
    static LOCATIONS = [
        { id: 'downtown', name: 'Downtown / City Center', rentMultiplier: 1.8, footTraffic: 95, demographics: 'Young professionals, tourists', competition: 'High', demandScore: 88, icon: '🏙️' },
        { id: 'suburban', name: 'Suburban / Residential Area', rentMultiplier: 0.8, footTraffic: 55, demographics: 'Families, commuters', competition: 'Medium', demandScore: 65, icon: '🏡' },
        { id: 'mall', name: 'Shopping Mall', rentMultiplier: 2.2, footTraffic: 90, demographics: 'Mixed, shoppers', competition: 'Very High', demandScore: 82, icon: '🏬' },
        { id: 'university', name: 'University District', rentMultiplier: 1.1, footTraffic: 78, demographics: 'Students, academics', competition: 'Medium-High', demandScore: 75, icon: '🎓' },
        { id: 'business', name: 'Business District', rentMultiplier: 1.5, footTraffic: 70, demographics: 'Office workers', competition: 'Medium', demandScore: 72, icon: '🏢' },
        { id: 'highway', name: 'Highway / Transit Hub', rentMultiplier: 1.0, footTraffic: 60, demographics: 'Commuters, travelers', competition: 'Low-Medium', demandScore: 58, icon: '🛣️' },
        { id: 'industrial', name: 'Industrial / Warehouse', rentMultiplier: 0.5, footTraffic: 20, demographics: 'Workers, limited public', competition: 'Low', demandScore: 30, icon: '🏭' },
        { id: 'tourist', name: 'Tourist / Entertainment', rentMultiplier: 2.0, footTraffic: 85, demographics: 'Tourists, nightlife', competition: 'High', demandScore: 80, icon: '🎭' },
    ];

    static scoreLocation(locationId, businessConfig) {
        const loc = this.LOCATIONS.find(l => l.id === locationId);
        if (!loc) return null;

        const baseRent = businessConfig.rent || 4000;
        const adjustedRent = Math.round(baseRent * loc.rentMultiplier);
        const revenue = businessConfig.avgTicket * businessConfig.dailyCustomers * 26;
        const trafficBoost = loc.footTraffic / 100;
        const adjustedRevenue = Math.round(revenue * trafficBoost * (1 + (loc.demandScore / 200)));
        const rentToRevenue = ((adjustedRent / adjustedRevenue) * 100).toFixed(1);

        // Profitability score
        const engine = new FinancialEngine({
            ...businessConfig,
            rent: adjustedRent,
            dailyCustomers: Math.round(businessConfig.dailyCustomers * trafficBoost)
        });
        const summary = engine.getFinancialSummary();
        const riskEngine = new RiskEngine(summary, { ...businessConfig, rent: adjustedRent });
        const risk = riskEngine.assessRisks();

        // Composite score (0-100)
        let score = 0;
        score += loc.footTraffic * 0.25;
        score += loc.demandScore * 0.25;
        score += Math.max(0, Math.min(25, (100 - parseFloat(rentToRevenue) * 4) * 0.25));
        score += Math.max(0, (100 - risk.riskScore.score) * 0.25);
        score = Math.round(Math.min(100, Math.max(0, score)));

        return {
            location: loc,
            adjustedRent,
            adjustedRevenue,
            rentToRevenue: parseFloat(rentToRevenue),
            monthlyProfit: summary.monthlyProfit,
            profitMargin: summary.profitMargin,
            breakEven: summary.breakEven.month,
            roi: summary.roi.roi,
            riskScore: risk.riskScore.score,
            riskLevel: risk.riskScore.level,
            profitabilityScore: score,
            insights: this.generateLocationInsights(loc, parseFloat(rentToRevenue), businessConfig)
        };
    }

    static compareLocations(locationIds, businessConfig) {
        return locationIds.map(id => this.scoreLocation(id, businessConfig)).filter(Boolean);
    }

    static generateLocationInsights(loc, rentToRevenue, config) {
        const insights = [];

        if (loc.footTraffic >= 80) {
            insights.push({ type: 'positive', text: `High foot traffic (${loc.footTraffic}/100) drives organic customer acquisition` });
        } else if (loc.footTraffic < 50) {
            insights.push({ type: 'warning', text: `Low foot traffic (${loc.footTraffic}/100) — you'll need strong marketing` });
        }

        if (rentToRevenue > 15) {
            insights.push({ type: 'warning', text: `Rent-to-revenue ratio of ${rentToRevenue}% exceeds the 8-12% target` });
        } else if (rentToRevenue <= 10) {
            insights.push({ type: 'positive', text: `Excellent rent-to-revenue ratio of ${rentToRevenue}%` });
        }

        if (loc.competition === 'Very High' || loc.competition === 'High') {
            insights.push({ type: 'warning', text: `${loc.competition} competition — differentiation is critical` });
        } else if (loc.competition === 'Low') {
            insights.push({ type: 'positive', text: `Low competition gives you first-mover advantage` });
        }

        insights.push({ type: 'info', text: `Primary demographics: ${loc.demographics}` });

        return insights;
    }
}


// ---- Autonomous Optimization Engine ----
export class AutonomousOptimizer {
    static generateOptimizations(baseConfig, financialData) {
        const strategies = [];

        // Strategy 1: Price optimization sweep
        for (let pctChange = -15; pctChange <= 30; pctChange += 5) {
            if (pctChange === 0) continue;
            const newTicket = +(baseConfig.avgTicket * (1 + pctChange / 100)).toFixed(2);
            // Demand elasticity: ~0.5 elasticity (1% price increase → 0.5% customer decrease)
            const elasticity = pctChange > 0 ? -0.5 : -0.3; // less elastic for decreases
            const custChange = pctChange * elasticity;
            const newCust = Math.round(baseConfig.dailyCustomers * (1 + custChange / 100));

            strategies.push({
                type: 'pricing',
                name: `${pctChange > 0 ? '+' : ''}${pctChange}% Price ${pctChange > 0 ? 'Increase' : 'Decrease'}`,
                description: `Adjust avg ticket to $${newTicket} (${pctChange > 0 ? 'higher margins' : 'volume play'})`,
                config: { ...baseConfig, avgTicket: newTicket, dailyCustomers: newCust },
                icon: '🏷️'
            });
        }

        // Strategy 2: Staffing optimization
        for (let delta = -3; delta <= 3; delta++) {
            if (delta === 0) continue;
            const newEmp = Math.max(1, baseConfig.employees + delta);
            if (newEmp === baseConfig.employees) continue;
            strategies.push({
                type: 'staffing',
                name: `${delta > 0 ? '+' : ''}${delta} Staff ${delta > 0 ? '(Expand)' : '(Lean)'}`,
                description: delta > 0
                    ? `Add ${delta} employee(s) for better service capacity`
                    : `Reduce by ${Math.abs(delta)} employee(s) to cut labor costs`,
                config: { ...baseConfig, employees: newEmp },
                icon: '👥'
            });
        }

        // Strategy 3: Rent negotiation
        [0.85, 0.90, 0.95, 1.10, 1.20].forEach(mult => {
            const pct = Math.round((mult - 1) * 100);
            strategies.push({
                type: 'rent',
                name: `${pct >= 0 ? '+' : ''}${pct}% Rent Change`,
                description: mult < 1
                    ? `Negotiate ${Math.abs(pct)}% rent reduction (save $${Math.round(baseConfig.rent * (1 - mult))}/mo)`
                    : `Model a ${pct}% rent increase scenario`,
                config: { ...baseConfig, rent: Math.round(baseConfig.rent * mult) },
                icon: '🏠'
            });
        });

        // Strategy 4: Customer volume strategies
        [0.7, 0.85, 1.15, 1.30, 1.50].forEach(mult => {
            const pct = Math.round((mult - 1) * 100);
            strategies.push({
                type: 'growth',
                name: `${pct >= 0 ? '+' : ''}${pct}% Customer Volume`,
                description: mult > 1
                    ? `Marketing-driven ${pct}% increase in daily customers`
                    : `${Math.abs(pct)}% customer decline stress test`,
                config: { ...baseConfig, dailyCustomers: Math.round(baseConfig.dailyCustomers * mult) },
                icon: '📈'
            });
        });

        // Strategy 5: Combined optimizations
        strategies.push({
            type: 'combined',
            name: 'Lean & Premium',
            description: 'Fewer staff + higher prices: premium positioning with lower overhead',
            config: {
                ...baseConfig,
                employees: Math.max(2, baseConfig.employees - 2),
                avgTicket: +(baseConfig.avgTicket * 1.20).toFixed(2),
                dailyCustomers: Math.round(baseConfig.dailyCustomers * 0.90)
            },
            icon: '⚡'
        });

        strategies.push({
            type: 'combined',
            name: 'Volume Play',
            description: 'Lower prices + more customers: high-volume, affordable positioning',
            config: {
                ...baseConfig,
                avgTicket: +(baseConfig.avgTicket * 0.85).toFixed(2),
                dailyCustomers: Math.round(baseConfig.dailyCustomers * 1.25)
            },
            icon: '📊'
        });

        strategies.push({
            type: 'combined',
            name: 'Maximum Efficiency',
            description: 'Optimized staffing + rent negotiation + slight price increase',
            config: {
                ...baseConfig,
                employees: Math.max(2, baseConfig.employees - 1),
                rent: Math.round(baseConfig.rent * 0.90),
                avgTicket: +(baseConfig.avgTicket * 1.08).toFixed(2)
            },
            icon: '🎯'
        });

        strategies.push({
            type: 'combined',
            name: 'Growth Investment',
            description: 'More staff + marketing-driven volume + premium positioning',
            config: {
                ...baseConfig,
                employees: baseConfig.employees + 2,
                dailyCustomers: Math.round(baseConfig.dailyCustomers * 1.30),
                avgTicket: +(baseConfig.avgTicket * 1.10).toFixed(2)
            },
            icon: '🚀'
        });

        return strategies;
    }

    static evaluateStrategies(strategies) {
        return strategies.map(s => {
            const engine = new FinancialEngine(s.config);
            const summary = engine.getFinancialSummary();
            const riskEngine = new RiskEngine(summary, s.config);
            const risk = riskEngine.assessRisks();

            // Composite optimization score
            const margin = parseFloat(summary.profitMargin);
            const roi = summary.roi.roi;
            const riskPenalty = risk.riskScore.score;
            const beBonus = summary.breakEven.month ? Math.max(0, 25 - summary.breakEven.month) : 0;

            const score = Math.round(
                Math.min(100, Math.max(0,
                    margin * 1.5 +
                    roi * 0.8 +
                    beBonus * 2 -
                    riskPenalty * 0.5 +
                    30 // base
                ))
            );

            return {
                ...s,
                results: {
                    monthlyRevenue: summary.monthlyRevenue,
                    monthlyProfit: summary.monthlyProfit,
                    profitMargin: summary.profitMargin,
                    startupCost: summary.startup.total,
                    breakEvenMonth: summary.breakEven.month,
                    roi: summary.roi.roi,
                    riskScore: risk.riskScore.score,
                    riskLevel: risk.riskScore.level,
                    riskColor: risk.riskScore.color
                },
                score
            };
        }).sort((a, b) => b.score - a.score);
    }

    static getTopRecommendations(baseConfig, financialData, count = 5) {
        const strategies = this.generateOptimizations(baseConfig, financialData);
        const evaluated = this.evaluateStrategies(strategies);
        return evaluated.slice(0, count);
    }
}


// ---- Weekly Report Engine ----
export class WeeklyReportEngine {
    static generateWeeklyReport(financialData, riskData, businessConfig, scenarios) {
        const aiEngine = new AIInsightEngine(financialData, businessConfig);
        const execSummary = aiEngine.generateExecutiveSummary();
        const insights = aiEngine.generateInsights();
        const optimizer = AutonomousOptimizer.getTopRecommendations(businessConfig, financialData, 3);

        // Trend analysis (simulating week-over-week)
        const trendData = this.generateTrendAnalysis(financialData);

        return {
            generatedAt: new Date().toISOString(),
            period: this.getReportPeriod(),
            summary: {
                headline: this.generateHeadline(financialData, riskData),
                healthScore: this.calculateHealthScore(financialData, riskData),
                keyMetrics: {
                    monthlyRevenue: financialData.monthlyRevenue,
                    monthlyProfit: financialData.monthlyProfit,
                    profitMargin: financialData.profitMargin,
                    riskScore: riskData.riskScore.score,
                    riskLevel: riskData.riskScore.level,
                    breakEven: financialData.breakEven.month,
                    roi: financialData.roi.roi,
                    fundingScore: execSummary.fundingReadiness.score
                }
            },
            trends: trendData,
            alerts: this.generateAlerts(financialData, riskData),
            opportunities: insights.filter(i => i.priority === 'high').slice(0, 3),
            topOptimizations: optimizer,
            cashFlowForecast: {
                next3Months: financialData.forecast.slice(0, 3),
                negativeCashFlowMonths: financialData.forecast.filter(m => m.netProfit < 0).length,
                totalPositiveMonths: financialData.forecast.filter(m => m.netProfit > 0).length
            },
            recommendation: execSummary.recommendation,
            scenarioCount: scenarios?.length || 0
        };
    }

    static generateHeadline(financialData, riskData) {
        const margin = parseFloat(financialData.profitMargin);
        const risk = riskData.riskScore.level;

        if (margin > 20 && risk === 'Low') return '🟢 Your business twin is performing excellently!';
        if (margin > 15 && risk !== 'High') return '🟡 Solid performance with room for optimization';
        if (margin > 5) return '🟠 Your business needs attention in key areas';
        return '🔴 Critical issues detected — immediate action recommended';
    }

    static calculateHealthScore(financialData, riskData) {
        let score = 50; // Base
        const margin = parseFloat(financialData.profitMargin);
        const risk = riskData.riskScore.score;

        score += Math.min(20, margin); // Up to +20 for margin
        score += Math.max(-20, (50 - risk) * 0.4); // Risk adjustment
        score += financialData.roi.roi > 0 ? 10 : -10; // ROI bonus/penalty
        score += financialData.breakEven.month && financialData.breakEven.month <= 12 ? 10 : -5;

        return Math.round(Math.min(100, Math.max(0, score)));
    }

    static generateAlerts(financialData, riskData) {
        const alerts = [];

        if (parseFloat(financialData.profitMargin) < 10) {
            alerts.push({ severity: 'warning', icon: '⚠️', title: 'Low Profit Margin', text: `Margin at ${financialData.profitMargin}% — below the 15% industry benchmark` });
        }

        const negMonths = financialData.forecast.filter(m => m.netProfit < 0).length;
        if (negMonths > 6) {
            alerts.push({ severity: 'danger', icon: '🔴', title: 'Extended Negative Cash Flow', text: `${negMonths} of 24 months show negative cash flow` });
        }

        if (riskData.riskScore.score >= 60) {
            alerts.push({ severity: 'danger', icon: '🛡️', title: 'High Risk Score', text: `Risk score of ${riskData.riskScore.score}/100 — mitigation needed` });
        }

        if (financialData.roi.roi < 0) {
            alerts.push({ severity: 'danger', icon: '📉', title: 'Negative ROI', text: `First-year ROI is ${financialData.roi.roi}% — restructuring needed` });
        }

        if (!financialData.breakEven.month) {
            alerts.push({ severity: 'danger', icon: '⏱️', title: 'No Break-Even', text: 'Break-even not projected within 24 months' });
        }

        if (alerts.length === 0) {
            alerts.push({ severity: 'success', icon: '✅', title: 'All Clear', text: 'No critical alerts — your model is healthy!' });
        }

        return alerts;
    }

    static generateTrendAnalysis(financialData) {
        // Simulate trends from forecast data
        const early = financialData.forecast.slice(0, 6);
        const mid = financialData.forecast.slice(6, 12);
        const late = financialData.forecast.slice(12, 18);

        const avgEarly = early.reduce((s, m) => s + m.netProfit, 0) / early.length;
        const avgMid = mid.reduce((s, m) => s + m.netProfit, 0) / mid.length;
        const avgLate = late.length > 0 ? late.reduce((s, m) => s + m.netProfit, 0) / late.length : avgMid;

        return {
            profitTrend: avgMid > avgEarly ? 'improving' : 'declining',
            profitChange: avgEarly !== 0 ? Math.round(((avgMid - avgEarly) / Math.abs(avgEarly)) * 100) : 0,
            revenueGrowth: Math.round(((mid[mid.length - 1]?.revenue || 0) - (early[0]?.revenue || 1)) / (early[0]?.revenue || 1) * 100),
            outlook: avgLate > avgMid ? 'positive' : 'cautious',
            earlyAvg: Math.round(avgEarly),
            midAvg: Math.round(avgMid),
            lateAvg: Math.round(avgLate)
        };
    }

    static getReportPeriod() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
            from: weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            to: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
    }
}
