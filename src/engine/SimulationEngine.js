// ============================================
// Business Digital Twin - Simulation Engine
// ============================================
// This engine powers all financial calculations,
// scenario modeling, risk analysis, and AI insights.

// ---- Business Type Definitions ----
export const BUSINESS_TYPES = [
    {
        id: 'cafe',
        name: 'Café / Coffee Shop',
        icon: '☕',
        description: 'Coffee shop, tea house',
        defaults: {
            avgTicket: 8, dailyCustomers: 120, employees: 6,
            rent: 3500, sqft: 1200, equipmentCost: 45000,
            margins: { food: 0.65, beverage: 0.72 },
            seasonality: [0.85, 0.88, 0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.9, 1.15]
        }
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        icon: '🍽️',
        description: 'Full-service dining',
        defaults: {
            avgTicket: 28, dailyCustomers: 80, employees: 12,
            rent: 6000, sqft: 2500, equipmentCost: 95000,
            margins: { food: 0.60, beverage: 0.75 },
            seasonality: [0.80, 0.82, 0.90, 0.95, 1.05, 1.15, 1.15, 1.10, 1.0, 0.95, 0.88, 1.20]
        }
    },
    {
        id: 'gym',
        name: 'Gym / Fitness Center',
        icon: '💪',
        description: 'Fitness & wellness',
        defaults: {
            avgTicket: 50, dailyCustomers: 60, employees: 8,
            rent: 5000, sqft: 3000, equipmentCost: 120000,
            margins: { membership: 0.80, merchandise: 0.50 },
            seasonality: [1.30, 1.20, 1.10, 1.0, 0.90, 0.80, 0.75, 0.78, 0.95, 1.0, 1.05, 0.85]
        }
    },
    {
        id: 'retail',
        name: 'Retail Store',
        icon: '🛍️',
        description: 'Clothing, electronics, general',
        defaults: {
            avgTicket: 45, dailyCustomers: 50, employees: 5,
            rent: 4000, sqft: 1800, equipmentCost: 35000,
            margins: { products: 0.55, accessories: 0.65 },
            seasonality: [0.75, 0.80, 0.85, 0.90, 0.95, 1.0, 1.05, 1.0, 0.95, 1.0, 1.20, 1.55]
        }
    },
    {
        id: 'salon',
        name: 'Beauty Salon / Spa',
        icon: '💇',
        description: 'Hair, beauty, wellness',
        defaults: {
            avgTicket: 55, dailyCustomers: 15, employees: 5,
            rent: 2800, sqft: 1000, equipmentCost: 30000,
            margins: { services: 0.75, products: 0.50 },
            seasonality: [0.85, 0.90, 0.95, 1.0, 1.10, 1.15, 1.10, 1.05, 1.0, 0.95, 1.05, 1.20]
        }
    },
    {
        id: 'bakery',
        name: 'Bakery',
        icon: '🥐',
        description: 'Bread, pastries, specialty',
        defaults: {
            avgTicket: 12, dailyCustomers: 100, employees: 5,
            rent: 2500, sqft: 900, equipmentCost: 55000,
            margins: { baked: 0.68, drinks: 0.72 },
            seasonality: [0.90, 0.88, 0.95, 1.0, 1.0, 1.05, 1.05, 1.0, 1.0, 0.95, 1.05, 1.30]
        }
    },
    {
        id: 'coworking',
        name: 'Co-working Space',
        icon: '🏢',
        description: 'Shared office & workspace',
        defaults: {
            avgTicket: 200, dailyCustomers: 30, employees: 4,
            rent: 8000, sqft: 4000, equipmentCost: 60000,
            margins: { desks: 0.70, meeting: 0.80 },
            seasonality: [1.0, 1.0, 1.05, 1.05, 1.0, 0.90, 0.80, 0.85, 1.05, 1.10, 1.05, 0.85]
        }
    },
    {
        id: 'laundry',
        name: 'Laundromat',
        icon: '🧺',
        description: 'Laundry & dry cleaning',
        defaults: {
            avgTicket: 15, dailyCustomers: 40, employees: 3,
            rent: 2000, sqft: 800, equipmentCost: 80000,
            margins: { wash: 0.65, dry: 0.70 },
            seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        }
    }
];

// ---- Financial Simulation Engine ----
export class FinancialEngine {
    constructor(config) {
        this.config = { ...config };
    }

    // Calculate startup costs
    calculateStartupCosts() {
        const { equipmentCost, sqft, rent } = this.config;
        const renovation = sqft * 45; // $45/sqft renovation
        const deposit = rent * 3; // 3 months deposit
        const licenses = 2500;
        const initialInventory = equipmentCost * 0.15;
        const marketing = 5000;
        const legal = 3000;
        const insurance = 2400;
        const technology = 4000;
        const contingency = (renovation + equipmentCost + deposit + licenses + initialInventory + marketing + legal + insurance + technology) * 0.10;

        const items = {
            'Equipment & Machinery': equipmentCost,
            'Renovation & Build-out': renovation,
            'Security Deposit (3 months)': deposit,
            'Licenses & Permits': licenses,
            'Initial Inventory': Math.round(initialInventory),
            'Marketing Launch': marketing,
            'Legal & Accounting': legal,
            'Insurance (Annual)': insurance,
            'Technology & POS': technology,
            'Contingency (10%)': Math.round(contingency)
        };

        const total = Object.values(items).reduce((sum, v) => sum + v, 0);
        return { items, total };
    }

    // Calculate monthly fixed costs
    calculateFixedCosts() {
        const { rent, employees } = this.config;
        const avgSalary = 3200;
        const payroll = employees * avgSalary;
        const utilities = rent * 0.15;
        const insurance = 200;
        const marketing = rent * 0.08;
        const software = 150;
        const maintenance = rent * 0.05;
        const accounting = 400;
        const miscellaneous = 300;

        const items = {
            'Rent': rent,
            'Payroll': payroll,
            'Utilities': Math.round(utilities),
            'Insurance': insurance,
            'Marketing': Math.round(marketing),
            'Software & Tools': software,
            'Maintenance': Math.round(maintenance),
            'Accounting': accounting,
            'Miscellaneous': miscellaneous
        };

        const total = Object.values(items).reduce((sum, v) => sum + v, 0);
        return { items, total };
    }

    // Calculate monthly variable costs
    calculateVariableCosts(monthlyRevenue) {
        const cogsRate = 0.32;
        const creditCardRate = 0.028;
        const suppliesRate = 0.03;
        const wasteRate = 0.02;

        const items = {
            'Cost of Goods Sold': Math.round(monthlyRevenue * cogsRate),
            'Credit Card Fees': Math.round(monthlyRevenue * creditCardRate),
            'Supplies & Packaging': Math.round(monthlyRevenue * suppliesRate),
            'Waste & Shrinkage': Math.round(monthlyRevenue * wasteRate)
        };

        const total = Object.values(items).reduce((sum, v) => sum + v, 0);
        return { items, total };
    }

    // Calculate monthly revenue
    calculateMonthlyRevenue(month = 0) {
        const { avgTicket, dailyCustomers } = this.config;
        const businessType = BUSINESS_TYPES.find(b => b.id === this.config.businessType);
        const seasonality = businessType?.defaults?.seasonality || Array(12).fill(1.0);
        const seasonalFactor = seasonality[month % 12];
        const operatingDays = 26; // avg operating days per month

        // Ramp-up factor for new businesses (first 6 months)
        const rampUp = month < 6 ? 0.5 + (month * 0.1) : 1.0;

        const revenue = avgTicket * dailyCustomers * operatingDays * seasonalFactor * rampUp;
        return Math.round(revenue);
    }

    // Generate 24-month cash flow forecast
    generateCashFlowForecast(months = 24) {
        const startup = this.calculateStartupCosts();
        const fixed = this.calculateFixedCosts();
        const forecast = [];

        let cumulativeCashFlow = -startup.total;

        for (let m = 0; m < months; m++) {
            const revenue = this.calculateMonthlyRevenue(m);
            const variable = this.calculateVariableCosts(revenue);
            const totalCosts = fixed.total + variable.total;
            const netProfit = revenue - totalCosts;
            cumulativeCashFlow += netProfit;

            forecast.push({
                month: m + 1,
                monthLabel: getMonthLabel(m),
                revenue,
                fixedCosts: fixed.total,
                variableCosts: variable.total,
                totalCosts,
                netProfit,
                cumulativeCashFlow: Math.round(cumulativeCashFlow),
                profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0
            });
        }

        return forecast;
    }

    // Calculate break-even point
    calculateBreakEven() {
        const fixed = this.calculateFixedCosts();
        const { avgTicket } = this.config;
        const variableCostPerUnit = avgTicket * 0.378; // COGS + CC + supplies + waste
        const contributionMargin = avgTicket - variableCostPerUnit;

        const breakEvenUnits = Math.ceil(fixed.total / contributionMargin);
        const breakEvenRevenue = Math.round(breakEvenUnits * avgTicket);

        // Find break-even month from cash flow
        const forecast = this.generateCashFlowForecast(24);
        const breakEvenMonth = forecast.findIndex(f => f.cumulativeCashFlow >= 0);

        return {
            units: breakEvenUnits,
            revenue: breakEvenRevenue,
            month: breakEvenMonth >= 0 ? breakEvenMonth + 1 : null,
            contributionMargin: contributionMargin.toFixed(2),
            dailyUnitsNeeded: Math.ceil(breakEvenUnits / 26)
        };
    }

    // Calculate ROI (first year)
    calculateROI() {
        const startup = this.calculateStartupCosts();
        const forecast = this.generateCashFlowForecast(12);
        const yearlyProfit = forecast.reduce((sum, m) => sum + m.netProfit, 0);
        const roi = ((yearlyProfit / startup.total) * 100).toFixed(1);
        return {
            investment: startup.total,
            yearlyProfit: Math.round(yearlyProfit),
            roi: parseFloat(roi),
            paybackMonths: roi > 0 ? Math.ceil(startup.total / (yearlyProfit / 12)) : null
        };
    }

    // Comprehensive financial summary
    getFinancialSummary() {
        const startup = this.calculateStartupCosts();
        const fixed = this.calculateFixedCosts();
        const avgRevenue = this.calculateMonthlyRevenue(8); // mature month
        const variable = this.calculateVariableCosts(avgRevenue);
        const breakEven = this.calculateBreakEven();
        const roi = this.calculateROI();
        const forecast = this.generateCashFlowForecast(24);

        return {
            startup,
            fixedCosts: fixed,
            variableCosts: variable,
            monthlyRevenue: avgRevenue,
            monthlyProfit: avgRevenue - fixed.total - variable.total,
            profitMargin: (((avgRevenue - fixed.total - variable.total) / avgRevenue) * 100).toFixed(1),
            breakEven,
            roi,
            forecast,
            annualRevenue: forecast.slice(0, 12).reduce((s, m) => s + m.revenue, 0),
            annualProfit: forecast.slice(0, 12).reduce((s, m) => s + m.netProfit, 0)
        };
    }
}

// ---- Risk Assessment Engine ----
export class RiskEngine {
    constructor(financialSummary, config) {
        this.summary = financialSummary;
        this.config = config;
    }

    assessRisks() {
        const risks = [];
        const { startup, fixedCosts, monthlyRevenue, roi, breakEven, profitMargin } = this.summary;

        // Profit margin risk
        const margin = parseFloat(profitMargin);
        if (margin < 5) {
            risks.push({
                id: 'low_margin',
                severity: 'high',
                category: 'Financial',
                title: 'Critically Low Profit Margin',
                description: `Your profit margin is ${margin}%. Healthy businesses typically maintain 15-25%. You need to increase revenue or reduce costs immediately.`,
                suggestion: 'Consider raising prices by 10-15%, reducing staff by 1, or negotiating lower rent.',
                impact: 95
            });
        } else if (margin < 15) {
            risks.push({
                id: 'moderate_margin',
                severity: 'medium',
                category: 'Financial',
                title: 'Below-Average Profit Margin',
                description: `Your profit margin is ${margin}%. This leaves little room for unexpected expenses or downturns.`,
                suggestion: 'Optimize your supplier costs and consider premium pricing strategies.',
                impact: 60
            });
        }

        // Break-even risk
        if (breakEven.month && breakEven.month > 18) {
            risks.push({
                id: 'slow_breakeven',
                severity: 'high',
                category: 'Financial',
                title: 'Slow Break-Even Timeline',
                description: `Your business will take ${breakEven.month} months to break even. Most investors expect 12-18 months.`,
                suggestion: 'Reduce initial investment or find ways to accelerate revenue growth in the first 6 months.',
                impact: 85
            });
        } else if (breakEven.month && breakEven.month > 12) {
            risks.push({
                id: 'moderate_breakeven',
                severity: 'medium',
                category: 'Financial',
                title: 'Extended Break-Even Period',
                description: `Break-even at month ${breakEven.month}. Target under 12 months for better investor confidence.`,
                suggestion: 'Consider a phased launch to reduce upfront costs.',
                impact: 45
            });
        }

        // Rent-to-revenue ratio
        const rentRatio = (this.config.rent / monthlyRevenue) * 100;
        if (rentRatio > 15) {
            risks.push({
                id: 'high_rent',
                severity: rentRatio > 25 ? 'high' : 'medium',
                category: 'Operational',
                title: 'High Rent-to-Revenue Ratio',
                description: `Rent consumes ${rentRatio.toFixed(1)}% of monthly revenue. Industry best practice is 8-12%.`,
                suggestion: 'Negotiate rent reduction, consider a smaller space, or choose a less expensive location.',
                impact: rentRatio > 25 ? 80 : 50
            });
        }

        // Payroll burden
        const payrollRatio = (this.config.employees * 3200 / monthlyRevenue) * 100;
        if (payrollRatio > 35) {
            risks.push({
                id: 'high_payroll',
                severity: 'medium',
                category: 'Operational',
                title: 'High Labor Cost Ratio',
                description: `Payroll accounts for ${payrollRatio.toFixed(1)}% of revenue. Target 25-35% for sustainability.`,
                suggestion: 'Consider part-time staff, automation, or self-service models.',
                impact: 55
            });
        }

        // ROI risk
        if (roi.roi < 0) {
            risks.push({
                id: 'negative_roi',
                severity: 'high',
                category: 'Financial',
                title: 'Negative Return on Investment',
                description: `First-year ROI is ${roi.roi}%. Your business is projected to lose money.`,
                suggestion: 'Fundamentally restructure your cost or revenue model before investing.',
                impact: 100
            });
        } else if (roi.roi < 15) {
            risks.push({
                id: 'low_roi',
                severity: 'medium',
                category: 'Financial',
                title: 'Below-Market Returns',
                description: `ROI of ${roi.roi}% is below market alternatives. S&P 500 averages ~10% annually.`,
                suggestion: 'Your time and capital may be better deployed elsewhere.',
                impact: 40
            });
        }

        // Cash flow risks - check for negative months
        const negativeMonths = this.summary.forecast.filter(f => f.netProfit < 0).length;
        if (negativeMonths > 8) {
            risks.push({
                id: 'cash_flow_crisis',
                severity: 'high',
                category: 'Cash Flow',
                title: 'Extended Negative Cash Flow',
                description: `${negativeMonths} of 24 months show negative cash flow. This may exhaust your reserves.`,
                suggestion: 'Secure additional funding or reduce burn rate significantly.',
                impact: 90
            });
        } else if (negativeMonths > 4) {
            risks.push({
                id: 'cash_flow_concern',
                severity: 'medium',
                category: 'Cash Flow',
                title: 'Negative Cash Flow Periods',
                description: `${negativeMonths} months with negative cash flow detected. Maintain adequate reserves.`,
                suggestion: 'Build a cash reserve equal to at least 3 months of fixed costs.',
                impact: 45
            });
        }

        // Startup capital risk
        if (startup.total > 200000) {
            risks.push({
                id: 'high_capital',
                severity: 'medium',
                category: 'Financial',
                title: 'High Capital Requirement',
                description: `E£${(startup.total / 1000).toFixed(0)}K startup cost increases risk. Higher investment = longer to recoup.`,
                suggestion: 'Phase your investment. Start small and expand based on traction.',
                impact: 50
            });
        }

        // Overall risk score
        const riskScore = this.calculateOverallRiskScore(risks);

        return { risks, riskScore };
    }

    calculateOverallRiskScore(risks) {
        if (risks.length === 0) return { score: 15, level: 'Low', color: 'green' };

        const avgImpact = risks.reduce((sum, r) => sum + r.impact, 0) / risks.length;
        const highRisks = risks.filter(r => r.severity === 'high').length;

        let score = avgImpact + (highRisks * 10);
        score = Math.min(100, Math.max(0, score));

        let level, color;
        if (score >= 70) { level = 'High'; color = 'danger'; }
        else if (score >= 40) { level = 'Medium'; color = 'warning'; }
        else { level = 'Low'; color = 'success'; }

        return { score: Math.round(score), level, color };
    }
}

// ---- AI Insight Engine ----
export class AIInsightEngine {
    constructor(financialSummary, config) {
        this.summary = financialSummary;
        this.config = config;
    }

    generateInsights() {
        const insights = [];
        const { monthlyRevenue, monthlyProfit, profitMargin, breakEven, roi, forecast } = this.summary;

        // Pricing optimization
        const optimizedPrice = this.config.avgTicket * 1.1;
        const potentialRevenue = optimizedPrice * this.config.dailyCustomers * 26;
        if (parseFloat(profitMargin) < 20) {
            insights.push({
                id: 'pricing',
                category: 'Revenue',
                icon: '💰',
                title: 'Pricing Optimization Opportunity',
                description: `A 10% price increase to $${optimizedPrice.toFixed(2)} per ticket could boost monthly revenue by $${(potentialRevenue - monthlyRevenue).toLocaleString()} with minimal impact on volume.`,
                potentialImpact: `+$${((potentialRevenue - monthlyRevenue) * 12).toLocaleString()}/year`,
                priority: 'high'
            });
        }

        // Customer volume insights
        const targetCustomers = Math.ceil(breakEven.dailyUnitsNeeded * 1.2);
        if (this.config.dailyCustomers < targetCustomers) {
            insights.push({
                id: 'volume',
                category: 'Growth',
                icon: '📈',
                title: 'Customer Acquisition Focus',
                description: `You need ${targetCustomers} daily customers for a comfortable margin above break-even. Consider loyalty programs, local partnerships, and social media marketing.`,
                potentialImpact: `${targetCustomers - this.config.dailyCustomers} more customers/day needed`,
                priority: 'high'
            });
        }

        // Peak season strategy
        const businessType = BUSINESS_TYPES.find(b => b.id === this.config.businessType);
        if (businessType) {
            const peakMonth = businessType.defaults.seasonality.indexOf(Math.max(...businessType.defaults.seasonality));
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            insights.push({
                id: 'seasonality',
                category: 'Strategy',
                icon: '📊',
                title: 'Seasonal Strategy',
                description: `Your peak season is ${months[peakMonth]}. Prepare inventory and staffing 6 weeks ahead. Consider promotions during slow months to smooth revenue.`,
                potentialImpact: 'Revenue stabilization',
                priority: 'medium'
            });
        }

        // Technology recommendations
        insights.push({
            id: 'tech',
            category: 'Operations',
            icon: '🤖',
            title: 'Technology-Driven Efficiency',
            description: 'Implement POS analytics, automated inventory management, and online ordering to reduce operational costs by 8-12% and capture additional revenue channels.',
            potentialImpact: `Save $${Math.round(monthlyRevenue * 0.08).toLocaleString()}/month`,
            priority: 'medium'
        });

        // Location insights
        if (this.config.rent > monthlyRevenue * 0.12) {
            insights.push({
                id: 'location',
                category: 'Cost Reduction',
                icon: '📍',
                title: 'Location Cost Optimization',
                description: 'Your rent is above the recommended 8-12% of revenue. Consider co-sharing space, subleasing during off-hours, or negotiating a longer lease for lower monthly rates.',
                potentialImpact: `Save $${Math.round(this.config.rent * 0.15).toLocaleString()}/month`,
                priority: 'medium'
            });
        }

        // Growth strategy
        if (roi.roi > 20) {
            insights.push({
                id: 'growth',
                category: 'Growth',
                icon: '🚀',
                title: 'Expansion Readiness',
                description: `With ${roi.roi}% ROI, your model supports expansion. Consider opening a second location once you\'ve maintained profitability for 12+ months, or franchise the concept.`,
                potentialImpact: '2-3x revenue potential',
                priority: 'low'
            });
        }

        // Staff optimization
        const revenuePerEmployee = monthlyRevenue / this.config.employees;
        if (revenuePerEmployee < 8000) {
            insights.push({
                id: 'staff',
                category: 'Operations',
                icon: '👥',
                title: 'Staff Efficiency Improvement',
                description: `Revenue per employee is E£${revenuePerEmployee.toLocaleString()}. Industry target is E£8,000-E£12,000. Cross-train staff and optimize scheduling to improve productivity.`,
                potentialImpact: 'Reduce labor costs by 10-15%',
                priority: 'high'
            });
        }

        return insights;
    }

    generateExecutiveSummary() {
        const { startup, monthlyRevenue, monthlyProfit, profitMargin, breakEven, roi, annualRevenue, annualProfit } = this.summary;
        const riskEngine = new RiskEngine(this.summary, this.config);
        const { riskScore } = riskEngine.assessRisks();

        return {
            overview: `This ${this.config.businessType} business requires an initial investment of E£${startup.total.toLocaleString()} and is projected to generate E£${annualRevenue.toLocaleString()} in first-year revenue with E£${annualProfit.toLocaleString()} in net profit.`,
            keyMetrics: {
                'Total Investment': `E£${startup.total.toLocaleString()}`,
                'Monthly Revenue (Mature)': `E£${monthlyRevenue.toLocaleString()}`,
                'Monthly Profit': `E£${monthlyProfit.toLocaleString()}`,
                'Profit Margin': `${profitMargin}%`,
                'Break-Even': breakEven.month ? `Month ${breakEven.month}` : 'Not within 24 months',
                'First-Year ROI': `${roi.roi}%`,
                'Risk Level': riskScore.level
            },
            recommendation: roi.roi > 15 && riskScore.score < 60
                ? 'This business model shows strong fundamentals. Proceed with detailed planning and secure financing.'
                : roi.roi > 0
                    ? 'This model has potential but requires optimization. Address identified risks before proceeding.'
                    : 'This configuration is not viable as structured. Significant changes are needed before investing.',
            fundingReadiness: this.calculateFundingReadiness(riskScore)
        };
    }

    calculateFundingReadiness(riskScore) {
        let score = 100;
        const { profitMargin, roi, breakEven } = this.summary;

        if (parseFloat(profitMargin) < 10) score -= 20;
        if (parseFloat(profitMargin) < 5) score -= 15;
        if (roi.roi < 0) score -= 30;
        if (roi.roi < 15) score -= 10;
        if (breakEven.month > 18) score -= 15;
        if (breakEven.month > 24 || !breakEven.month) score -= 20;
        if (riskScore.score > 70) score -= 20;
        if (riskScore.score > 40) score -= 10;

        score = Math.max(0, Math.min(100, score));

        let label;
        if (score >= 80) label = 'Investor Ready';
        else if (score >= 60) label = 'Nearly Ready';
        else if (score >= 40) label = 'Needs Work';
        else label = 'Not Ready';

        return { score, label };
    }
}

// ---- Scenario Comparison Engine ----
export class ScenarioEngine {
    static createScenario(name, baseConfig, overrides = {}) {
        return {
            id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            config: { ...baseConfig, ...overrides },
            createdAt: new Date().toISOString()
        };
    }

    static compareScenarios(scenarios) {
        return scenarios.map(scenario => {
            const engine = new FinancialEngine(scenario.config);
            const summary = engine.getFinancialSummary();
            const riskEngine = new RiskEngine(summary, scenario.config);
            const risk = riskEngine.assessRisks();
            const aiEngine = new AIInsightEngine(summary, scenario.config);
            const execSummary = aiEngine.generateExecutiveSummary();

            return {
                ...scenario,
                summary,
                risk,
                executiveSummary: execSummary
            };
        });
    }

    static generatePresetScenarios(baseConfig) {
        return [
            ScenarioEngine.createScenario('Base Case', baseConfig),
            ScenarioEngine.createScenario('Optimistic (+20% Customers)', baseConfig, {
                dailyCustomers: Math.round(baseConfig.dailyCustomers * 1.2)
            }),
            ScenarioEngine.createScenario('Pessimistic (-20% Sales)', baseConfig, {
                dailyCustomers: Math.round(baseConfig.dailyCustomers * 0.8)
            }),
            ScenarioEngine.createScenario('Higher Rent (+30%)', baseConfig, {
                rent: Math.round(baseConfig.rent * 1.3)
            }),
            ScenarioEngine.createScenario('Lean Staffing (-2 employees)', baseConfig, {
                employees: Math.max(1, baseConfig.employees - 2)
            }),
            ScenarioEngine.createScenario('Premium Pricing (+15%)', baseConfig, {
                avgTicket: +(baseConfig.avgTicket * 1.15).toFixed(2)
            })
        ];
    }
}

// ---- AI Chat Advisor ----
export class AIChatAdvisor {
    constructor(financialSummary, config, risks) {
        this.summary = financialSummary;
        this.config = config;
        this.risks = risks;
    }

    generateResponse(question) {
        const q = question.toLowerCase();

        if (q.includes('profitable') || q.includes('profit') || q.includes('money')) {
            return this.profitabilityResponse();
        }
        if (q.includes('risk') || q.includes('danger') || q.includes('worry')) {
            return this.riskResponse();
        }
        if (q.includes('break') || q.includes('even') || q.includes('when')) {
            return this.breakEvenResponse();
        }
        if (q.includes('cost') || q.includes('expense') || q.includes('spend')) {
            return this.costResponse();
        }
        if (q.includes('price') || q.includes('pricing') || q.includes('charge')) {
            return this.pricingResponse();
        }
        if (q.includes('employee') || q.includes('staff') || q.includes('hire') || q.includes('team')) {
            return this.staffResponse();
        }
        if (q.includes('investor') || q.includes('funding') || q.includes('loan') || q.includes('pitch')) {
            return this.fundingResponse();
        }
        if (q.includes('location') || q.includes('rent') || q.includes('space') || q.includes('area')) {
            return this.locationResponse();
        }
        if (q.includes('grow') || q.includes('expand') || q.includes('scale') || q.includes('bigger')) {
            return this.growthResponse();
        }
        if (q.includes('compet') || q.includes('market') || q.includes('industry')) {
            return this.marketResponse();
        }
        if (q.includes('summary') || q.includes('overview') || q.includes('tell me about')) {
            return this.summaryResponse();
        }

        return this.generalResponse();
    }

    profitabilityResponse() {
        const { monthlyProfit, profitMargin, annualProfit, roi } = this.summary;
        return `📊 **Profitability Analysis**\n\nYour ${this.config.businessType} is projected to generate **$${monthlyProfit.toLocaleString()}/month** in net profit with a **${profitMargin}% profit margin**.\n\nFirst-year net profit: **$${annualProfit.toLocaleString()}**\nROI: **${roi.roi}%**\n\n${parseFloat(profitMargin) > 15 ? '✅ Your margins are healthy. Focus on consistency and gradual growth.' : '⚠️ Margins are tight. I recommend reviewing your pricing strategy and cost structure.'}`;
    }

    riskResponse() {
        const highRisks = this.risks.filter(r => r.severity === 'high');
        const medRisks = this.risks.filter(r => r.severity === 'medium');

        let response = `🛡️ **Risk Assessment**\n\n`;
        if (highRisks.length > 0) {
            response += `**🔴 ${highRisks.length} High-Risk Issues:**\n`;
            highRisks.forEach(r => { response += `• ${r.title}: ${r.suggestion}\n`; });
        }
        if (medRisks.length > 0) {
            response += `\n**🟡 ${medRisks.length} Medium-Risk Issues:**\n`;
            medRisks.forEach(r => { response += `• ${r.title}: ${r.suggestion}\n`; });
        }
        if (highRisks.length === 0 && medRisks.length === 0) {
            response += `✅ No significant risks detected. Your business model is well-structured!`;
        }
        return response;
    }

    breakEvenResponse() {
        const { breakEven } = this.summary;
        return `⏱️ **Break-Even Analysis**\n\nYou need **${breakEven.units.toLocaleString()} sales** ($${breakEven.revenue.toLocaleString()}) per month to break even.\n\nThat's approximately **${breakEven.dailyUnitsNeeded} customers per day**.\n\n${breakEven.month ? `📅 At current projections, you'll break even in **Month ${breakEven.month}**.` : '⚠️ Break-even is not projected within 24 months. Consider restructuring.'}`;
    }

    costResponse() {
        const { startup, fixedCosts } = this.summary;
        return `💵 **Cost Breakdown**\n\n**Startup Investment:** $${startup.total.toLocaleString()}\n**Monthly Fixed Costs:** $${fixedCosts.total.toLocaleString()}\n\nTop expenses:\n${Object.entries(fixedCosts.items).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `• ${k}: $${v.toLocaleString()}`).join('\n')}\n\n💡 Tip: Focus on the top 3 expenses — they likely account for 80%+ of your costs.`;
    }

    pricingResponse() {
        const { avgTicket, dailyCustomers } = this.config;
        const optimal = avgTicket * 1.1;
        return `🏷️ **Pricing Strategy**\n\nCurrent average ticket: **$${avgTicket}**\n\nMy analysis suggests a **$${optimal.toFixed(2)}** average ticket (10% increase) could significantly improve margins without notably impacting customer volume.\n\nAt your current volume of ${dailyCustomers} daily customers, this adds **$${Math.round((optimal - avgTicket) * dailyCustomers * 26).toLocaleString()}/month** in revenue.\n\n💡 Consider: bundle pricing, premium options, loyalty programs, and strategic upselling.`;
    }

    staffResponse() {
        const { employees } = this.config;
        const revPerEmp = Math.round(this.summary.monthlyRevenue / employees);
        return `👥 **Staffing Analysis**\n\nCurrent team size: **${employees} employees**\nRevenue per employee: **$${revPerEmp.toLocaleString()}/month**\nPayroll cost: **$${(employees * 3200).toLocaleString()}/month**\n\n${revPerEmp < 8000 ? '⚠️ Revenue per employee is below the $8K-$12K target. Consider cross-training and optimizing schedules.' : '✅ Staff efficiency is within healthy range.'}\n\n💡 Consider: part-time workers for peak hours, automation for repetitive tasks, and performance-based incentives.`;
    }

    fundingResponse() {
        const aiEngine = new AIInsightEngine(this.summary, this.config);
        const exec = aiEngine.generateExecutiveSummary();
        return `🏦 **Funding & Investment Readiness**\n\nFunding Readiness Score: **${exec.fundingReadiness.score}/100** (${exec.fundingReadiness.label})\n\n**Key Metrics for Investors:**\n• Total Investment Needed: $${this.summary.startup.total.toLocaleString()}\n• Projected First-Year ROI: ${this.summary.roi.roi}%\n• Break-Even: Month ${this.summary.breakEven.month || 'N/A'}\n• Profit Margin: ${this.summary.profitMargin}%\n\n${exec.fundingReadiness.score >= 70 ? '✅ Your numbers are attractive to investors. Consider SBA loans, angel investors, or small business grants.' : '⚠️ Strengthen your model before approaching investors. Focus on improving margins and reducing the break-even timeline.'}`;
    }

    locationResponse() {
        const rentRatio = ((this.config.rent / this.summary.monthlyRevenue) * 100).toFixed(1);
        return `📍 **Location & Space Analysis**\n\n• Space: **${this.config.sqft.toLocaleString()} sqft**\n• Monthly Rent: **$${this.config.rent.toLocaleString()}**\n• Rent-to-Revenue: **${rentRatio}%** (Target: 8-12%)\n\n${parseFloat(rentRatio) > 12 ? `⚠️ Your rent is ${rentRatio}% of revenue, above the recommended 8-12%. Options:\n• Negotiate a longer lease for lower monthly rates\n• Consider a slightly smaller space\n• Look for spaces in emerging neighborhoods` : `✅ Your rent-to-revenue ratio is healthy.`}\n\n💡 Key location factors: foot traffic, parking, visibility, demographics, and competitors nearby.`;
    }

    growthResponse() {
        return `🚀 **Growth Strategy**\n\nBased on your ${this.config.businessType} model:\n\n**Phase 1 (Month 1-6):** Establish operations, build customer base\n**Phase 2 (Month 6-12):** Optimize operations, reach profitability, build loyalty\n**Phase 3 (Month 12-18):** Expand services, add revenue streams\n**Phase 4 (Month 18-24):** Consider second location or franchise\n\n💡 Growth Tactics:\n• Loyalty/subscription programs for recurring revenue\n• Online presence & delivery/e-commerce\n• Strategic partnerships with complementary businesses\n• Community events & local marketing\n• Premium/VIP services tier`;
    }

    marketResponse() {
        return `🏪 **Market & Competition Analysis**\n\nFor your ${this.config.businessType} business:\n\n**Industry Benchmarks:**\n• Average profit margin: 10-18%\n• Typical break-even: 12-18 months\n• Customer retention rate: 60-70%\n• Average ticket growth: 3-5% annually\n\n**Competitive Advantages to Build:**\n• Unique brand identity & experience\n• Superior customer service\n• Technology-driven operations\n• Strong online reviews & social proof\n• Exclusive products or services\n\n💡 Research 5 direct competitors. Identify what they do well and where you can differentiate.`;
    }

    summaryResponse() {
        const aiEngine = new AIInsightEngine(this.summary, this.config);
        const exec = aiEngine.generateExecutiveSummary();
        return `📋 **Executive Summary**\n\n${exec.overview}\n\n**Key Highlights:**\n${Object.entries(exec.keyMetrics).map(([k, v]) => `• ${k}: ${v}`).join('\n')}\n\n**Recommendation:** ${exec.recommendation}`;
    }

    generalResponse() {
        return `🤖 **AI Business Advisor**\n\nI can help you with:\n• **"Is this profitable?"** - Profitability analysis\n• **"What are my risks?"** - Risk assessment\n• **"When will I break even?"** - Break-even analysis\n• **"How much does it cost?"** - Cost breakdown\n• **"What should I charge?"** - Pricing strategy\n• **"How many staff?"** - Staffing analysis\n• **"Am I investor ready?"** - Funding readiness\n• **"Is my location good?"** - Location analysis\n• **"How can I grow?"** - Growth strategy\n• **"Tell me about the market"** - Market insights\n• **"Give me a summary"** - Executive summary\n\nJust ask any business question!`;
    }
}

// ---- Helper Functions ----
function getMonthLabel(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex % 12];
}

export function formatCurrency(amount) {
    const prefix = amount < 0 ? '-E£' : 'E£';
    const abs = Math.abs(amount);
    if (abs >= 1000000) {
        return prefix + (abs / 1000000).toFixed(1) + 'M';
    }
    if (abs >= 1000) {
        return prefix + (abs / 1000).toFixed(1) + 'K';
    }
    return prefix + abs.toLocaleString();
}

export function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}
