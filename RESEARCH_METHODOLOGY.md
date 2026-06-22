# Research Methodology — Business Digital Twin

## Abstract

This project presents a comprehensive Digital Twin framework for small-to-medium business process simulation. The system creates a virtual replica of a business entity — encompassing financial projections, risk assessment, spatial layout, and operational optimization — enabling founders and operators to make data-driven decisions before committing capital.

The framework integrates:
- A **trained Machine Learning revenue predictor** (Multiple Linear Regression via OLS)
- **Monte Carlo uncertainty quantification** (1,000 simulation iterations)
- A **closed-loop auto-calibration** mechanism that continuously improves twin fidelity

## Methodology

### 1. Data Generation
Synthetic training data is generated using parameterized business models across 8 industry verticals. Each sample varies key parameters using Gaussian noise (σ = 12.5%) around industry-calibrated defaults, producing 500 samples per type.

### 2. Model Training
Multiple Linear Regression via Normal Equation: θ = (XᵀX)⁻¹Xᵀy

Features: `avgTicket`, `dailyCustomers`, `employees`, `rent`, `sqft`, `seasonalityIndex`, `month`

### 3. Uncertainty Quantification
Monte Carlo simulation with ±15% parameter perturbation, 1,000 iterations. Results reported as P5/P25/P50/P75/P95 percentile cones.

### 4. Validation
RMSE, MAE, MAPE, R² metrics. Fidelity Score (0-100) maps MAPE to twin accuracy.

### 5. Feedback Loop
Proportional auto-calibration decomposes revenue bias into pricing vs. volume components for targeted parameter adjustment.

## Evaluation Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| RMSE | √(Σ(yᵢ - ŷᵢ)² / n) | Average prediction deviation |
| MAE | Σ|yᵢ - ŷᵢ| / n | Robust error measure |
| MAPE | Σ|yᵢ - ŷᵢ|/|yᵢ| × 100 / n | Scale-independent accuracy |
| R² | 1 - SS_res/SS_tot | Variance explained |

## Hypotheses

- **H1**: MAPE < 10% on held-out test data
- **H2**: Risk engine identifies ≥ 80% of financial risk factors
- **H3**: Top optimization strategy produces ≥ 15% higher composite score
- **H4**: Auto-calibration reduces MAPE by ≥ 30% after 3 months
- **H5**: 90% Monte Carlo CI contains actual outcome in ≥ 85% of cases

## Innovation

1. Unified framework combining financial simulation + 3D visualization + ML prediction
2. Auto-calibrating feedback loop with bias decomposition
3. Multi-vertical generalization (8 business types)
4. Monte Carlo-enhanced probabilistic decision support
5. Gamification of business planning
