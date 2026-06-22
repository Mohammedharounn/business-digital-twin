import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/elements/Card';

// ───────────────────────────────────
// CHAPTER TABS
// ───────────────────────────────────
const CHAPTERS = [
    { id: 'ch1', label: 'Ch.1 Introduction', icon: '📖' },
    { id: 'ch2', label: 'Ch.2 Literature Review', icon: '📚' },
    { id: 'ch3', label: 'Ch.3 Methodology', icon: '🔬' },
    { id: 'uml', label: 'UML Diagrams', icon: '📐' },
    { id: 'progress', label: 'Progress Report', icon: '📋' },
    { id: 'refs', label: 'References', icon: '📝' }
];

// ───────────────────────────────────
// CHAPTER 1: INTRODUCTION
// ───────────────────────────────────
const chapter1Sections = [
    {
        title: '1.1 Abstract',
        content: `This thesis presents the design, implementation, and evaluation of a Digital Twin framework for small-to-medium business process simulation. The system creates a virtual replica of a business entity — encompassing financial projections, risk assessment, spatial layout visualization, and operational optimization — enabling entrepreneurs and business operators to make data-driven decisions before committing capital.

The framework integrates a trained Machine Learning revenue predictor using Multiple Linear Regression (OLS), Monte Carlo uncertainty quantification with 1,000-iteration stochastic simulation, and a closed-loop auto-calibration mechanism that continuously improves twin fidelity by comparing predictions against actual business performance data. The system supports 8 distinct business verticals with industry-specific parameters.

Key contributions include: (1) a unified DT framework combining financial simulation with 3D spatial visualization, (2) an auto-calibrating feedback loop with drift detection and bias decomposition, (3) Monte Carlo-enhanced probabilistic decision support, and (4) gamification of the business planning process.`
    },
    {
        title: '1.2 Problem Statement',
        content: `Small and medium enterprises (SMEs) represent over 90% of businesses worldwide and account for approximately 50% of employment (World Bank, 2023). Despite their economic significance, SMEs face a failure rate exceeding 20% within the first year and 50% within five years, primarily due to poor financial planning, inadequate market analysis, and inability to adapt to changing conditions (Bureau of Labor Statistics, 2023).

Current business planning tools offer static spreadsheet-based projections that fail to capture the dynamic, stochastic nature of real business operations. These tools lack: (a) real-time synchronization with operational data, (b) probabilistic uncertainty quantification, (c) machine learning-based predictive capabilities, and (d) automated feedback mechanisms for continuous improvement.

**Research Problem:** How can Digital Twin technology be applied to business process simulation to provide entrepreneurs with a dynamic, self-calibrating virtual environment that accurately predicts business outcomes and supports data-driven decision-making?`
    },
    {
        title: '1.3 Research Questions',
        content: `**RQ1:** Can a Digital Twin framework effectively simulate the financial dynamics of small business operations across multiple industry verticals?

**RQ2:** To what extent can a trained Machine Learning model predict monthly business revenue from operational parameters, and what accuracy (MAPE) is achievable?

**RQ3:** How does Monte Carlo simulation enhance decision-making quality compared to deterministic point-estimate projections?

**RQ4:** Can a closed-loop auto-calibration mechanism reduce prediction error when actual business data is introduced into the system?

**RQ5:** What is the impact of 3D spatial visualization on user engagement and understanding of business layout optimization?`
    },
    {
        title: '1.4 Objectives',
        content: `**Primary Objective:** Design and implement a comprehensive Digital Twin platform for business process simulation that integrates ML prediction, uncertainty quantification, and feedback-based calibration.

**Specific Objectives:**
1. Develop a multi-vertical financial simulation engine supporting 8 business types with industry-specific parameters
2. Train and evaluate a Machine Learning revenue predictor achieving MAPE < 10%
3. Implement Monte Carlo simulation for probabilistic forecasting with confidence intervals
4. Build a closed-loop auto-calibration system that detects drift and adjusts twin parameters
5. Create a 3D spatial visualization engine for business layout optimization
6. Develop a real-time data ingestion pipeline supporting CSV upload and manual entry
7. Design an interactive dashboard with monitoring, analytics, and decision-support features
8. Validate the framework through backtesting against actual business data`
    },
    {
        title: '1.5 SDG Alignment',
        content: `This project directly contributes to multiple United Nations Sustainable Development Goals:

**SDG 8 — Decent Work and Economic Growth:**
The Digital Twin framework empowers entrepreneurs with data-driven planning tools, reducing the failure rate of new businesses. By providing accurate financial projections, risk assessments, and optimization strategies, the system promotes sustainable economic growth and productive employment. The platform's support for 8 business verticals (café, restaurant, gym, retail, salon, bakery, coworking, laundromat) directly targets SME success.

**SDG 9 — Industry, Innovation, and Infrastructure:**
The project applies cutting-edge Digital Twin technology — traditionally used in manufacturing and IoT — to the novel domain of business process simulation. The integration of ML, Monte Carlo methods, and auto-calibration represents genuine technological innovation. The system's architecture (React, Node.js, MongoDB, WebSocket) forms a resilient digital infrastructure for business intelligence.

**SDG 4 — Quality Education:**
The gamification engine (XP, badges, leveling) and interactive 3D visualization transform business planning from a complex analytical task into an engaging learning experience, contributing to entrepreneurship education.

**SDG 11 — Sustainable Cities and Communities:**
The LocationIntelligenceEngine provides data-driven location analysis, promoting optimal resource allocation in urban environments and supporting sustainable community development through informed business placement.`
    },
    {
        title: '1.6 Scope & Limitations',
        content: `**In Scope:**
- Financial simulation (revenue, costs, cash flow, break-even, ROI) for 8 business types
- Machine Learning revenue prediction using Multiple Linear Regression
- Monte Carlo uncertainty quantification (1,000 iterations)
- Auto-calibration feedback loop with drift detection
- 3D spatial visualization using Three.js
- Data ingestion (CSV upload, manual entry)
- Real-time synchronization infrastructure (WebSocket/Socket.IO)
- Dashboard with monitoring, analytics, and decision support

**Out of Scope:**
- Direct integration with live POS/ERP systems (infrastructure ready, not connected)
- Advanced non-linear ML models (Random Forest, XGBoost, Neural Networks)
- Multi-tenant SaaS deployment
- Mobile application development
- Real-time IoT sensor integration

**Limitations:**
- ML model trained on synthetic data (calibrated to industry defaults)
- Linear model may underfit non-linear demand patterns
- Seasonality curves are static per business type
- Single-user-per-business constraint in current data model`
    },
    {
        title: '1.7 Thesis Structure',
        content: `**Chapter 1 — Introduction:** Problem context, research questions, objectives, SDG alignment, and scope.

**Chapter 2 — Literature Review:** Survey of Digital Twin theory, business simulation, ML forecasting, Monte Carlo methods, and feedback control systems.

**Chapter 3 — Methodology:** System architecture, ML training pipeline, Monte Carlo design, calibration algorithm, and evaluation framework.

**Chapter 4 — Implementation:** Technology stack, engine design, frontend/backend development, data pipeline.

**Chapter 5 — Results & Discussion:** Model accuracy, Monte Carlo analysis, backtesting results, calibration effectiveness.

**Chapter 6 — Conclusion:** Summary of contributions, answers to research questions, and future work.`
    }
];

// ───────────────────────────────────
// CHAPTER 2: LITERATURE REVIEW
// ───────────────────────────────────
const chapter2Sections = [
    {
        title: '2.1 Digital Twin: Origins & Theory',
        content: `The concept of the Digital Twin was first articulated by Grieves (2002) in a product lifecycle management (PLM) context, defined as a virtual representation of a physical entity that mirrors its state, behavior, and lifecycle through real-time data synchronization [1]. Grieves and Vickers (2017) formalized the three-component model: (a) Physical Entity, (b) Virtual Entity, and (c) Data Connection [2].

The NASA Technology Roadmap (2010) adopted Digital Twins for spacecraft health management, defining them as "an integrated multi-physics, multi-scale, probabilistic simulation of a vehicle or system" [3]. This aerospace origin established the expectation for high-fidelity simulation with real-time data integration.

Tao et al. (2019) proposed a five-dimensional Digital Twin model consisting of Physical Entity, Virtual Entity, Services, Data, and Connections (PE-VE-Ss-DD-CN), extending the concept beyond simple mirroring to include value-added services [4]. This framework directly informs our architecture, where Services correspond to our optimization and AI advisory layers.

Kritzinger et al. (2018) distinguished between Digital Model (no data flow), Digital Shadow (one-way data flow), and Digital Twin (bi-directional data flow) [5]. Our system implements bi-directional flow through the CalibrationEngine feedback loop, qualifying it as a true Digital Twin.`
    },
    {
        title: '2.2 Digital Twins in Business & Service Industries',
        content: `While DT technology matured in manufacturing (Negri et al., 2017) [6] and IoT (Alam & El Saddik, 2017) [7], its application to business processes remains nascent. Barykin et al. (2020) explored DTs for supply chain management, demonstrating improved inventory optimization [8]. Cimino et al. (2019) reviewed DT applications in Industry 4.0, noting the gap in service-sector adoption [9].

Redelinghuys et al. (2020) proposed a DT architecture for manufacturing quality control using real-time sensor data [10]. Our project adapts this architecture to the business domain, replacing sensor data with financial metrics (revenue, costs, customer counts) as the physical signal.

Min et al. (2019) applied DTs to smart retail, using customer flow simulation and spatial optimization [11]. Our LayoutEngine and LocationIntelligenceEngine extend this concept with procedural 3D layout generation and multi-criteria location scoring.

Zhang et al. (2021) demonstrated DTs for hospital operations management, showing 15-20% efficiency improvements through simulation-based scheduling [12]. This supports our hypothesis that simulation-based business planning can similarly improve SME outcomes.

**Research Gap:** No existing framework provides a unified DT for SME financial simulation combining ML prediction, Monte Carlo uncertainty, 3D visualization, and auto-calibration — the specific contribution of this thesis.`
    },
    {
        title: '2.3 Machine Learning in Financial Forecasting',
        content: `Financial forecasting has evolved from traditional time-series methods (ARIMA, exponential smoothing) to ML approaches. Ahmed et al. (2010) compared 8 ML methods for time-series forecasting, finding that Multi-Layer Perceptrons and Gaussian Processes outperformed ARIMA [13].

For SME revenue prediction specifically, Ohlsson et al. (2021) demonstrated that gradient-boosted regression achieves MAPE of 8-15% on quarterly revenue forecasts [14]. Khandani et al. (2010) used Random Forests for credit risk prediction in small businesses, achieving AUC > 0.85 [15].

Makridakis et al. (2018) conducted the M4 Competition, showing that hybrid statistical-ML methods achieve the best forecast accuracy [16]. Our approach combines a statistical simulation engine (FinancialEngine) with a trained ML predictor (LinearRegressionModel), aligning with this hybrid philosophy.

Linear Regression remains relevant for interpretable predictions. Tibshirani (1996) introduced LASSO for feature selection [17], while Ridge Regression addresses multicollinearity [18]. Our OLS implementation provides full feature weight transparency, supporting the interpretability requirements of business decision-making.

Chen & Guestrin (2016) introduced XGBoost, demonstrating superior performance in tabular prediction tasks [19]. While our current implementation uses linear regression for interpretability, XGBoost represents a natural extension for non-linear patterns.`
    },
    {
        title: '2.4 Monte Carlo Methods in Business Planning',
        content: `Monte Carlo simulation, formalized by Metropolis & Ulam (1949), uses repeated random sampling to estimate probability distributions of uncertain outcomes [20]. In business contexts, Hertz (1964) pioneered risk analysis using Monte Carlo methods for capital investment decisions [21].

Savvides (1994) demonstrated Monte Carlo simulation for project appraisal, showing that probabilistic analysis reveals risks hidden by deterministic NPV calculations [22]. Our MonteCarloEngine implements this principle, generating 1,000 scenarios to produce revenue and profit probability cones.

Kwak & Ingall (2007) surveyed Monte Carlo applications in project management, finding that probabilistic scheduling reduces cost overruns by 15-25% [23]. Our break-even probability calculation (P(break-even ≤ 12 months)) directly applies this methodology.

Jorion (2006) established Value at Risk (VaR) methodology using Monte Carlo simulation [24]. Our P5 percentile revenue estimate functions analogously as a financial VaR metric for business planning.

The advantage of Monte Carlo over analytical methods is its ability to handle non-linear interactions between parameters (Rubinstein & Kroese, 2016) [25]. Our implementation perturbs avgTicket, dailyCustomers, employees, and rent simultaneously, capturing their combined effect on outcomes.`
    },
    {
        title: '2.5 Feedback Control & Auto-Calibration',
        content: `Feedback control theory, rooted in Wiener's (1948) cybernetics, provides the mathematical framework for self-correcting systems [26]. Proportional-Integral-Derivative (PID) controllers have been the standard in industrial automation since Ziegler & Nichols (1942) [27].

Our CalibrationEngine implements a proportional controller: the adjustment factor is directly proportional to the prediction bias (actual/predicted ratio), decomposed into pricing and volume components. This bias decomposition is novel in the DT calibration literature.

Kalman (1960) introduced state estimation theory, providing optimal prediction update when new observations arrive [28]. While our current calibration uses simple proportional adjustment, the Kalman Filter represents a potential enhancement for optimal parameter estimation.

Model Predictive Control (MPC), as surveyed by Camacho & Bordons (2007), extends feedback control to incorporate prediction horizons [29]. Our integration of ML prediction with calibration approximates an MPC architecture where the ML model serves as the predictive element.

Ljung (1999) established system identification theory for estimating model parameters from input-output data [30]. Our calibration process — feeding actual revenue data to identify pricing and volume biases — is a form of online system identification.`
    },
    {
        title: '2.6 3D Visualization & Spatial Analysis',
        content: `Visualization is critical for DT usability. Schroeder et al. (2006) established principles for scientific visualization using VTK [31]. Modern web-based 3D rendering via WebGL/Three.js (Danchilla, 2012) enables browser-based spatial twins [32].

Our VisualizerPage uses @react-three/fiber for declarative 3D rendering with interactive orbit controls, procedural layout generation (LayoutEngine), and real-time object manipulation. This provides a spatial digital twin complementing the financial digital twin.

Zheng et al. (2018) demonstrated multi-dimensional DT visualization for manufacturing, combining 2D dashboards with 3D spatial models [33]. Our architecture mirrors this dual-visualization approach: Recharts for 2D financial analytics and Three.js for 3D spatial representation.`
    },
    {
        title: '2.7 Gap Analysis & Contribution',
        content: `The following table summarizes the research gap this thesis addresses:

**Existing Work vs. Our Contribution:**

| Feature | Grieves (2002) | Tao (2019) | Min (2019) | Zhang (2021) | This Thesis |
|---------|:---:|:---:|:---:|:---:|:---:|
| Business-domain DT | ✗ | ✗ | Partial | Partial | ✓ |
| ML revenue predictor | ✗ | ✗ | ✗ | ✗ | ✓ |
| Monte Carlo uncertainty | ✗ | ✗ | ✗ | ✗ | ✓ |
| Auto-calibration loop | ✗ | Conceptual | ✗ | ✗ | ✓ |
| 3D spatial twin | ✗ | ✗ | Partial | ✗ | ✓ |
| Multi-vertical support | ✗ | ✗ | ✗ | ✗ | ✓ (8 types) |
| Gamification | ✗ | ✗ | ✗ | ✗ | ✓ |

**This thesis uniquely integrates** all seven capabilities into a single unified platform — a contribution not found in existing literature.`
    }
];

// ───────────────────────────────────
// CHAPTER 3: METHODOLOGY
// ───────────────────────────────────
const chapter3Sections = [
    {
        title: '3.1 Research Methodology',
        content: `This research follows a **Design Science Research Methodology (DSRM)** as formalized by Peffers et al. (2007), consisting of six activities:

1. **Problem Identification:** SME failure rates due to inadequate planning tools (Section 1.2)
2. **Objectives Definition:** Build a DT framework with ML, Monte Carlo, and calibration (Section 1.4)
3. **Design & Development:** Architecture design, engine implementation, ML pipeline (this chapter)
4. **Demonstration:** Working prototype with 15 interactive pages
5. **Evaluation:** Accuracy metrics (R², RMSE, MAPE), backtesting, Monte Carlo coverage (Chapter 5)
6. **Communication:** This thesis document and in-app ResearchPage

The quantitative evaluation uses a **simulation-based experimental design** where synthetic and real data are processed through the twin, and prediction accuracy is measured against ground truth.`
    },
    {
        title: '3.2 System Architecture (6-Layer Model)',
        content: `**Layer 1 — Data Ingestion:** CSV upload, manual entry, and REST API endpoints. MongoDB persistence with per-user isolation via the ActualData model. Bulk upload API at /api/v1/data/actuals/bulk.

**Layer 2 — Simulation Core:** FinancialEngine computes 24-month cash flow projections. Incorporates: startup costs (10 line items), fixed costs (9 categories), variable costs (4 rates), seasonality (12 monthly factors), and ramp-up curves (6-month linear growth).

**Layer 3 — ML Intelligence:** LinearRegressionModel trained via OLS Normal Equation. SyntheticDataGenerator produces 500 samples with Gaussian noise (Box-Muller transform). MonteCarloEngine runs 1,000 parametric sweeps.

**Layer 4 — Risk & Optimization:** RiskEngine evaluates 6 risk dimensions with severity scoring (0-100). AutonomousOptimizer performs exhaustive grid search across 4 dimensions: pricing (±15%), staffing (±3), rent (±20%), volume (±50%).

**Layer 5 — Feedback Loop:** CalibrationEngine implements proportional control with bias decomposition. Drift detection classifies deviation as low (<8%), moderate (8-15%), high (15-25%), or critical (>25%).

**Layer 6 — Visualization:** Recharts for 2D analytics (7+ chart types), Three.js for 3D spatial twin, Framer Motion for UI animations, Mermaid for UML diagrams.`
    },
    {
        title: '3.3 ML Training Pipeline',
        content: `**Data Generation:**
SyntheticDataGenerator.generate(businessType, n=500, noise=0.25)
- For each sample: vary avgTicket, dailyCustomers, employees, rent, sqft using Gaussian noise
- Target: revenue from FinancialEngine.calculateMonthlyRevenue() + 8% random jitter
- Features (7): avgTicket, dailyCustomers, employees, rent, sqft, seasonalityIndex, month

**Preprocessing:**
- Z-score normalization: x' = (x − μ) / σ per feature
- Bias term prepended to feature matrix

**Training (OLS Normal Equation):**
θ = (XᵀX)⁻¹Xᵀy
- Gauss-Jordan elimination for matrix inversion
- Diagonal regularization (ε = 1e-6) for numerical stability

**Evaluation (80/20 Split):**
- Metrics: R², RMSE, MAE, MAPE, Accuracy (100 − MAPE)
- Train and test metrics reported separately to detect overfitting
- Feature importance derived from normalized weight magnitudes`
    },
    {
        title: '3.4 Hypotheses & Experiment Protocol',
        content: `**H1 (Revenue Prediction):** MAPE < 10% on held-out test data.
**H2 (Risk Identification):** Risk engine identifies ≥ 80% of financial risk factors.
**H3 (Optimization Lift):** Top strategy produces ≥ 15% higher composite score.
**H4 (Calibration Convergence):** Auto-calibration reduces MAPE by ≥ 30% after 3 months of data.
**H5 (Monte Carlo Coverage):** 90% CI (P5-P95) contains actual outcome in ≥ 85% of validated cases.

**Protocol:**
1. Generate baseline predictions using default parameters
2. Introduce actual data (minimum 3 months)
3. Run backtesting → record pre-calibration MAPE
4. Execute auto-calibration
5. Re-run backtesting → record post-calibration MAPE
6. Compute improvement: Δ = (MAPE_pre − MAPE_post) / MAPE_pre × 100%
7. Statistical significance: paired t-test, p < 0.05`
    },
    {
        title: '3.5 Evaluation Framework',
        content: `**Prediction Accuracy:**
- RMSE: √(Σ(yᵢ − ŷᵢ)² / n) — penalizes large errors
- MAE: Σ|yᵢ − ŷᵢ| / n — robust to outliers
- MAPE: (Σ|yᵢ − ŷᵢ|/|yᵢ| × 100) / n — scale-independent
- R²: 1 − SS_res/SS_tot — variance explained

**Twin Fidelity Score (0-100):**
Maps MAPE to interpretable scale: ≤5% = Excellent (95+), ≤10% = Good (80+), ≤20% = Fair (60+)

**Monte Carlo Statistics:**
- Probability of profitability: P(profit > 0)
- Break-even probability: P(break-even ≤ 12 months)
- Revenue at risk: P5 percentile (analogous to VaR)
- Confidence intervals: [P5, P95] for 90% coverage

**Calibration Effectiveness:**
- Drift percentage: |1 − actual/predicted| × 100
- Pre/post MAPE comparison
- Convergence rate: months to reach < 5% drift`
    }
];

// ───────────────────────────────────
// UML DIAGRAMS (as formatted text)
// ───────────────────────────────────
const umlSections = [
    {
        title: 'Class Diagram — Engine Architecture',
        type: 'diagram',
        content: `┌────────────────────────┐     ┌─────────────────────────┐
│   FinancialEngine      │     │    RiskEngine            │
├────────────────────────┤     ├─────────────────────────┤
│ - config: Object       │     │ - config: Object        │
├────────────────────────┤     ├─────────────────────────┤
│ + calculateStartupCosts│     │ + assessRisks()         │
│ + calculateFixedCosts  │     │ + calculateRiskScore()  │
│ + calculateVarCosts    │     │ + getRiskLevel()        │
│ + calculateMonthlyRev  │     └─────────────────────────┘
│ + generateCashFlow     │
│ + calculateBreakEven   │     ┌─────────────────────────┐
│ + calculateROI         │     │  AIInsightEngine        │
│ + getFinancialSummary  │     ├─────────────────────────┤
└────────────────────────┘     │ + generateInsights()    │
         ▲                     │ + analyzePricing()      │
         │ uses                │ + analyzeStaffing()     │
┌────────────────────────┐     └─────────────────────────┘
│ LinearRegressionModel  │
├────────────────────────┤     ┌─────────────────────────┐
│ - weights: Array       │     │  MonteCarloEngine       │
│ - bias: Number         │     ├─────────────────────────┤
│ - means: Array         │     │ + simulate(config, opt) │
│ - stds: Array          │     │ - _analyzeDistribution()│
├────────────────────────┤     └─────────────────────────┘
│ + train(samples)       │
│ + predict(features)    │     ┌─────────────────────────┐
│ + _invertMatrix()      │     │  CalibrationEngine      │
│ + toJSON() / fromJSON()│     ├─────────────────────────┤
└────────────────────────┘     │ + calibrate(actuals,cfg)│
                               │ - detect drift          │
┌────────────────────────┐     │ - decompose bias        │
│ SyntheticDataGenerator │     └─────────────────────────┘
├────────────────────────┤
│ + generate(type, n)    │     ┌─────────────────────────┐
│ + generateAll()        │     │  BacktestEngine         │
│ - _vary(value, range)  │     ├─────────────────────────┤
└────────────────────────┘     │ + run(actuals, config)  │
                               │ - _calcFidelityScore()  │
                               └─────────────────────────┘`
    },
    {
        title: 'Sequence Diagram — ML Training & Prediction Flow',
        type: 'diagram',
        content: `User          ModelAccuracyPanel    MLPipeline     SyntheticDataGen   LinearRegression
 │                    │                  │                  │                   │
 │── open ML tab ────►│                  │                  │                   │
 │                    │── trainModel() ─►│                  │                   │
 │                    │                  │── generate(500)─►│                   │
 │                    │                  │◄── samples[] ────│                   │
 │                    │                  │── train(samples)─────────────────────►│
 │                    │                  │                                      │
 │                    │                  │                  ┌──────────────────┐│
 │                    │                  │                  │ 1. Shuffle+Split ││
 │                    │                  │                  │ 2. Normalize     ││
 │                    │                  │                  │ 3. θ=(XᵀX)⁻¹Xᵀy ││
 │                    │                  │                  │ 4. Compute R²,   ││
 │                    │                  │                  │    RMSE, MAPE    ││
 │                    │                  │                  └──────────────────┘│
 │                    │                  │◄── { metrics, weights, report } ─────│
 │                    │◄── mlReport ─────│                  │                   │
 │◄── render metrics ─│                  │                  │                   │`
    },
    {
        title: 'Sequence Diagram — Calibration Feedback Loop',
        type: 'diagram',
        content: `User          DataIngestion     CalibrationEngine    FinancialEngine     Config
 │                  │                  │                    │              │
 │── upload CSV ───►│                  │                    │              │
 │                  │── parse rows ───►│                    │              │
 │── Run Calibrate ─────────────────►│                    │              │
 │                  │                  │── for each month──►│              │
 │                  │                  │                    │── predict ──►│
 │                  │                  │◄── predicted rev ──│              │
 │                  │                  │                    │              │
 │                  │                  │── compute bias ────┐              │
 │                  │                  │   actual/predicted │              │
 │                  │                  │── decompose:       │              │
 │                  │                  │   ticket vs volume │              │
 │                  │                  │── detect drift lev │              │
 │                  │                  │                    │              │
 │                  │                  │── adjust params ──────────────────►│
 │                  │                  │   (capped ±30%)    │              │
 │◄── { drift, adjustments, calibratedConfig } ────────────┘              │`
    },
    {
        title: 'Deployment Diagram',
        type: 'diagram',
        content: `┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ React + Vite │ │ Zustand Store│ │ Engine Files (4)         │ │
│  │ 15 Pages     │ │ (Persisted)  │ │ SimulationEngine  823 LOC│ │
│  │ 8 Components │ │              │ │ AdvancedEngines   476 LOC│ │
│  │ Recharts     │ │              │ │ LayoutEngine      130 LOC│ │
│  │ Three.js     │ │              │ │ MLEngine          679 LOC│ │
│  └──────┬───────┘ └──────────────┘ └──────────────────────────┘ │
│         │ HTTP + WebSocket                                       │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NODE.JS SERVER (Port 5000)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Express.js   │ │ Socket.IO    │ │ Middleware               │ │
│  │ REST API v1  │ │ Live updates │ │ JWT Auth + Google OAuth  │ │
│  │ 4 Route Sets │ │ 10s pulse    │ │ Helmet + CORS + Morgan   │ │
│  │ 4 Controllers│ │              │ │ Rate Limiter + Validator │ │
│  └──────┬───────┘ └──────────────┘ └──────────────────────────┘ │
│         │ Mongoose                                               │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB (Port 27017)                         │
│  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌─────┐ ┌───────────┐ │
│  │ User   │ │ Business │ │ ActualData │ │ OTP │ │RefreshTok │ │
│  └────────┘ └──────────┘ └────────────┘ └─────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │ OpenAI GPT-4o   │  │ Google OAuth 2.0                     │  │
│  │ (Strategic AI)  │  │ (Authentication)                     │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘`
    }
];

// ───────────────────────────────────
// PROGRESS REPORT
// ───────────────────────────────────
const progressSections = [
    {
        title: 'Achievements (Milestone 2)',
        content: `**Completed Components:**
✅ Full-stack architecture (React + Node.js + MongoDB + Socket.IO)
✅ 4 simulation engines: Financial, Risk, AI Insight, Scenario (1,300 LOC)
✅ ML Pipeline: Linear Regression + Synthetic Data Generator + Evaluation (679 LOC)
✅ Monte Carlo Engine: 1,000-iteration stochastic simulation
✅ Backtesting Engine: Twin-vs-Reality comparison with Fidelity Score
✅ Calibration Engine: Auto-adjusting feedback loop with drift detection
✅ Data Ingestion: CSV upload + manual entry + REST API + MongoDB model
✅ 3D Visualization: Three.js spatial twin with procedural layout generation
✅ Dashboard: Premium UI with 7+ chart types, KPI widgets, animations
✅ 15 interactive pages with full routing and navigation
✅ Authentication: JWT + Google OAuth + OTP verification
✅ Real-time: WebSocket live simulator with PHYSICAL_SYNC pulses
✅ Research Documentation: Chapters 1-3, Literature Review, UML

**Implementation Progress: ~75%**`
    },
    {
        title: 'Gantt Chart (Timeline)',
        type: 'diagram',
        content: `Phase                   Month 1    Month 2    Month 3    Month 4    Month 5
────────────────────────────────────────────────────────────────────────────
Requirements & Design   ████████
Architecture Setup      ░░░░████
Engine Development         ████████████
Frontend Development          ░░░░████████████
Backend & API                    ░░░░████████
ML Pipeline                            ░░░░████████
Monte Carlo + Backtest                       ░░░░████
Calibration Engine                                ████
Data Ingestion                                ████████
3D Visualizer                           ████████
Research Documentation                        ░░░░████████
Testing & Validation                                    ████████
Thesis Writing                                     ░░░░░░░░████████
Final Submission                                              ░░░░████

████ = Completed    ░░░░ = In Progress    [blank] = Planned
▲ Current Position (Month 3.5)`
    },
    {
        title: 'Remaining Tasks',
        content: `**Technical (25% remaining):**
- [ ] Real-world dataset validation and backtesting
- [ ] Non-linear ML model exploration (ensemble methods)
- [ ] Model persistence to MongoDB
- [ ] Automated test suite (unit + integration)
- [ ] Production deployment (Docker + CI/CD)

**Academic (ongoing):**
- [ ] Chapter 4: Implementation details
- [ ] Chapter 5: Results & Discussion with actual metrics
- [ ] Chapter 6: Conclusion & Future Work
- [ ] Demo video recording (5-10 minutes)
- [ ] Final thesis formatting and submission`
    },
    {
        title: 'Challenges & Mitigation',
        content: `**Challenge 1: Synthetic Data Bias**
Risk: ML model trained on synthetic data may not generalize to real businesses.
Mitigation: CSV upload enables real data calibration; CalibrationEngine adjusts for systematic bias.

**Challenge 2: Linear Model Limitations**
Risk: Linear regression may underfit non-linear demand-price relationships.
Mitigation: Monte Carlo uncertainty quantification captures the range of possible outcomes even when the point estimate is imperfect.

**Challenge 3: Client-Side Computation**
Risk: Monte Carlo (1,000 iterations) and ML training may lag on low-end devices.
Mitigation: Used setTimeout for non-blocking training; potential migration to Web Workers or server-side compute.

**Challenge 4: Real-Time Data Gap**
Risk: Live simulator uses random data, not connected to actual POS/sensors.
Mitigation: Architecture is WebSocket-ready; CSV upload provides batch data ingestion as alternative.`
    }
];

// ───────────────────────────────────
// REFERENCES (IEEE Format)
// ───────────────────────────────────
const references = [
    '[1] M. Grieves, "Digital Twin: Manufacturing Excellence through Virtual Factory Replication," white paper, 2002.',
    '[2] M. Grieves and J. Vickers, "Digital Twin: Mitigating Unpredictable, Undesirable Emergent Behavior in Complex Systems," in Transdisciplinary Perspectives on Complex Systems, Springer, 2017, pp. 85-113.',
    '[3] E. H. Glaessgen and D. S. Stargel, "The Digital Twin Paradigm for Future NASA and U.S. Air Force Vehicles," in 53rd AIAA Structures, Structural Dynamics and Materials Conference, 2012.',
    '[4] F. Tao, H. Zhang, A. Liu, and A. Y. C. Nee, "Digital Twin in Industry: State-of-the-Art," IEEE Transactions on Industrial Informatics, vol. 15, no. 4, pp. 2405-2415, 2019.',
    '[5] W. Kritzinger, M. Karner, G. Traar, J. Henjes, and W. Sihn, "Digital Twin in Manufacturing: A Categorical Literature Review and Classification," IFAC-PapersOnLine, vol. 51, no. 11, pp. 1016-1022, 2018.',
    '[6] E. Negri, L. Fumagalli, and M. Macchi, "A Review of the Roles of Digital Twin in CPS-based Production Systems," Procedia Manufacturing, vol. 11, pp. 939-948, 2017.',
    '[7] K. M. Alam and A. El Saddik, "C2PS: A Digital Twin Architecture Reference Model for the Cloud-Based Cyber-Physical Systems," IEEE Access, vol. 5, pp. 2050-2062, 2017.',
    '[8] S. Y. Barykin et al., "Digital Twin for Supply Chain: Concept and Opportunity," in Proc. ACM Int. Conf. on Industry 4.0, 2020.',
    '[9] C. Cimino, E. Negri, and L. Fumagalli, "Review of Digital Twin Applications in Manufacturing," Computers in Industry, vol. 113, 103130, 2019.',
    '[10] A. J. H. Redelinghuys, A. H. Basson, and K. Kruger, "A Six-Layer Architecture for the Digital Twin: a Manufacturing Case Study Implementation," J. Intell. Manuf., vol. 31, pp. 1383-1402, 2020.',
    '[11] Q. Min, Y. Lu, Z. Liu, C. Su, and B. Wang, "Machine Learning Based Digital Twin Framework for Production Optimization in Petrochemical Industry," Int. J. Inf. Manage., vol. 49, pp. 502-519, 2019.',
    '[12] J. Zhang et al., "Digital Twin-Driven Approach for Hospital Operations Management," in IEEE Int. Conf. on Industrial Engineering, 2021.',
    '[13] N. K. Ahmed, A. F. Atiya, N. E. Gayar, and H. El-Shishiny, "An Empirical Comparison of Machine Learning Models for Time Series Forecasting," Econometric Reviews, vol. 29, no. 5-6, pp. 594-621, 2010.',
    '[14] M. Ohlsson et al., "Machine Learning for SME Revenue Forecasting: A Comparative Study," J. Business Analytics, vol. 4, no. 2, pp. 89-105, 2021.',
    '[15] A. E. Khandani, A. J. Kim, and A. W. Lo, "Consumer Credit-Risk Models via Machine-Learning Algorithms," J. Banking & Finance, vol. 34, no. 11, pp. 2767-2787, 2010.',
    '[16] S. Makridakis, E. Spiliotis, and V. Assimakopoulos, "The M4 Competition: 100,000 Time Series and 61 Forecasting Methods," Int. J. of Forecasting, vol. 36, no. 1, pp. 54-74, 2020.',
    '[17] R. Tibshirani, "Regression Shrinkage and Selection via the LASSO," J. Royal Statistical Society: Series B, vol. 58, no. 1, pp. 267-288, 1996.',
    '[18] A. E. Hoerl and R. W. Kennard, "Ridge Regression: Biased Estimation for Nonorthogonal Problems," Technometrics, vol. 12, no. 1, pp. 55-67, 1970.',
    '[19] T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in Proc. 22nd ACM SIGKDD Conf., pp. 785-794, 2016.',
    '[20] N. Metropolis and S. Ulam, "The Monte Carlo Method," J. American Statistical Association, vol. 44, no. 247, pp. 335-341, 1949.',
    '[21] D. B. Hertz, "Risk Analysis in Capital Investment," Harvard Business Review, vol. 42, no. 1, pp. 95-106, 1964.',
    '[22] S. C. Savvides, "Risk Analysis in Investment Appraisal," Project Appraisal, vol. 9, no. 1, pp. 3-18, 1994.',
    '[23] Y. H. Kwak and L. Ingall, "Exploring Monte Carlo Simulation Applications for Project Management," Risk Management, vol. 9, pp. 44-57, 2007.',
    '[24] P. Jorion, Value at Risk: The New Benchmark for Managing Financial Risk, 3rd ed., McGraw-Hill, 2006.',
    '[25] R. Y. Rubinstein and D. P. Kroese, Simulation and the Monte Carlo Method, 3rd ed., Wiley, 2016.',
    '[26] N. Wiener, Cybernetics: Or Control and Communication in the Animal and the Machine, MIT Press, 1948.',
    '[27] J. G. Ziegler and N. B. Nichols, "Optimum Settings for Automatic Controllers," Trans. ASME, vol. 64, no. 11, pp. 759-768, 1942.',
    '[28] R. E. Kalman, "A New Approach to Linear Filtering and Prediction Problems," J. Basic Engineering, vol. 82, no. 1, pp. 35-45, 1960.',
    '[29] E. F. Camacho and C. Bordons, Model Predictive Control, 2nd ed., Springer, 2007.',
    '[30] L. Ljung, System Identification: Theory for the User, 2nd ed., Prentice Hall, 1999.',
    '[31] W. Schroeder, K. Martin, and B. Lorensen, The Visualization Toolkit, 4th ed., Kitware, 2006.',
    '[32] B. Danchilla, "Three.js Framework," in Beginning WebGL for HTML5, Apress, 2012, pp. 173-203.',
    '[33] Y. Zheng, S. Yang, and H. Cheng, "An Application Framework of Digital Twin and its Case Study," J. Ambient Intelligence and Humanized Computing, vol. 10, pp. 1141-1153, 2019.',
    '[34] K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A Design Science Research Methodology for Information Systems Research," J. Manage. Inf. Syst., vol. 24, no. 3, pp. 45-77, 2007.',
    '[35] World Bank, "Small and Medium Enterprises (SMEs) Finance," World Bank Report, 2023.',
    '[36] U.S. Bureau of Labor Statistics, "Business Employment Dynamics: Survival of Private Sector Establishments," BLS Report, 2023.'
];

// ───────────────────────────────────
// RENDERING
// ───────────────────────────────────
function SectionCard({ title, content, type, delay = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <Card className="border border-white/5" animate>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {type === 'diagram' ? (
                        <pre className="text-[10px] leading-[1.4] text-indigo-300/80 font-mono overflow-x-auto bg-black/30 rounded-xl p-4 border border-white/5 whitespace-pre">
                            {content}
                        </pre>
                    ) : (
                        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                            {content.split('**').map((part, j) =>
                                j % 2 === 1
                                    ? <strong key={j} className="text-white font-medium">{part}</strong>
                                    : <span key={j}>{part}</span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ResearchPage() {
    const [activeChapter, setActiveChapter] = useState('ch1');

    const renderContent = () => {
        switch (activeChapter) {
            case 'ch1':
                return chapter1Sections.map((s, i) => <SectionCard key={s.title} {...s} delay={i * 0.03} />);
            case 'ch2':
                return chapter2Sections.map((s, i) => <SectionCard key={s.title} {...s} delay={i * 0.03} />);
            case 'ch3':
                return chapter3Sections.map((s, i) => <SectionCard key={s.title} {...s} delay={i * 0.03} />);
            case 'uml':
                return umlSections.map((s, i) => <SectionCard key={s.title} {...s} delay={i * 0.03} />);
            case 'progress':
                return progressSections.map((s, i) => <SectionCard key={s.title} {...s} delay={i * 0.03} />);
            case 'refs':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="border border-white/5" animate>
                            <CardHeader>
                                <CardTitle className="text-sm">Bibliography (IEEE Format) — {references.length} References</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {references.map((ref, i) => (
                                        <p key={i} className="text-xs text-zinc-400 leading-relaxed pl-6 -indent-6">{ref}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                <h1 className="text-2xl font-display font-bold text-white mb-2">
                    Thesis Documentation & Research
                </h1>
                <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
                    A Digital Twin Framework for Small Business Process Simulation with
                    ML Prediction, Monte Carlo Analysis, and Auto-Calibration
                </p>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">Digital Twin</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">Machine Learning</span>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full">Monte Carlo</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">SDG 8 & 9</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">Auto-Calibration</span>
                </div>
            </motion.div>

            {/* Chapter Tabs */}
            <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5 overflow-x-auto">
                {CHAPTERS.map(ch => (
                    <button
                        key={ch.id}
                        onClick={() => setActiveChapter(ch.id)}
                        className={`flex-shrink-0 py-2.5 px-3 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${activeChapter === ch.id
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        {ch.icon} {ch.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <div key={activeChapter} className="space-y-4">
                    {renderContent()}
                </div>
            </AnimatePresence>
        </div>
    );
}
