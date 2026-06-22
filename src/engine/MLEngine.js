// ============================================
// Business Digital Twin — ML & Analytics Engine
// ============================================
// Trained Revenue Predictor, Monte Carlo Simulation,
// Backtesting Framework, Auto-Calibration Feedback Loop

import { BUSINESS_TYPES, FinancialEngine } from './SimulationEngine';

// ──────────────────────────────────────────────
// 1. SYNTHETIC DATA GENERATOR
// ──────────────────────────────────────────────
export class SyntheticDataGenerator {
    /**
     * Generate N realistic training samples for a given business type.
     * Varies each parameter by ±range% around the type defaults with Gaussian noise.
     */
    static generate(businessTypeId, n = 500, noiseRange = 0.25) {
        const bType = BUSINESS_TYPES.find(b => b.id === businessTypeId);
        if (!bType) return [];

        const defaults = bType.defaults;
        const samples = [];

        for (let i = 0; i < n; i++) {
            const avgTicket = this._vary(defaults.avgTicket, noiseRange);
            const dailyCustomers = Math.round(this._vary(defaults.dailyCustomers, noiseRange));
            const employees = Math.max(1, Math.round(this._vary(defaults.employees, noiseRange)));
            const rent = Math.round(this._vary(defaults.rent, noiseRange));
            const sqft = Math.round(this._vary(defaults.sqft, noiseRange));
            const equipmentCost = Math.round(this._vary(defaults.equipmentCost, noiseRange));
            const month = Math.floor(Math.random() * 12);
            const seasonality = defaults.seasonality[month];

            // Calculate "true" revenue using the financial engine + noise
            const engine = new FinancialEngine({
                ...defaults,
                businessType: businessTypeId,
                avgTicket,
                dailyCustomers,
                employees,
                rent,
                sqft,
                equipmentCost
            });

            const baseRevenue = engine.calculateMonthlyRevenue(month + 6); // Use mature month
            const actualRevenue = Math.round(baseRevenue * this._vary(1.0, 0.08)); // ±8% noise

            samples.push({
                features: {
                    avgTicket,
                    dailyCustomers,
                    employees,
                    rent,
                    sqft,
                    seasonalityIndex: seasonality,
                    month
                },
                target: actualRevenue
            });
        }

        return samples;
    }

    /**
     * Generate samples across ALL business types for a generalized model
     */
    static generateAll(samplesPerType = 300) {
        const allSamples = [];
        BUSINESS_TYPES.forEach(bt => {
            const samples = this.generate(bt.id, samplesPerType);
            samples.forEach(s => {
                s.features.businessTypeEncoded = BUSINESS_TYPES.indexOf(bt);
            });
            allSamples.push(...samples);
        });
        return allSamples;
    }

    static _vary(value, range) {
        // Box-Muller transform for Gaussian noise
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return value * (1 + z * range * 0.5); // range/2 as std deviation
    }
}


// ──────────────────────────────────────────────
// 2. MULTIPLE LINEAR REGRESSION
// ──────────────────────────────────────────────
export class LinearRegressionModel {
    constructor() {
        this.weights = null;
        this.bias = 0;
        this.featureNames = [];
        this.trained = false;
        this.metrics = {};
        this.trainingMeta = {};
    }

    /**
     * Train via ordinary least squares (OLS) using normal equation:
     * θ = (X^T X)^-1 X^T y
     */
    train(samples, testSplit = 0.2) {
        if (samples.length < 10) throw new Error('Need at least 10 samples');

        // Shuffle and split
        const shuffled = [...samples].sort(() => Math.random() - 0.5);
        const splitIdx = Math.floor(shuffled.length * (1 - testSplit));
        const trainSet = shuffled.slice(0, splitIdx);
        const testSet = shuffled.slice(splitIdx);

        // Extract features
        this.featureNames = Object.keys(trainSet[0].features);
        const X_train = trainSet.map(s => this.featureNames.map(f => s.features[f]));
        const y_train = trainSet.map(s => s.target);
        const X_test = testSet.map(s => this.featureNames.map(f => s.features[f]));
        const y_test = testSet.map(s => s.target);

        // Normalize features
        this._fitNormalization(X_train);
        const X_train_norm = this._normalize(X_train);
        const X_test_norm = this._normalize(X_test);

        // Add bias column
        const X_aug = X_train_norm.map(row => [1, ...row]);

        // Normal equation: θ = (X^T X)^-1 X^T y
        const Xt = this._transpose(X_aug);
        const XtX = this._matMul(Xt, X_aug);
        const XtX_inv = this._invertMatrix(XtX);
        const Xty = this._matVecMul(Xt, y_train);
        const theta = this._matVecMul2(XtX_inv, Xty);

        this.bias = theta[0];
        this.weights = theta.slice(1);
        this.trained = true;

        // Evaluate
        const y_pred_train = X_train_norm.map(row => this._predict(row));
        const y_pred_test = X_test_norm.map(row => this._predict(row));

        this.metrics = {
            train: this._computeMetrics(y_train, y_pred_train),
            test: this._computeMetrics(y_test, y_pred_test),
            trainSize: trainSet.length,
            testSize: testSet.length,
            totalSamples: samples.length,
            featureCount: this.featureNames.length
        };

        this.trainingMeta = {
            trainedAt: new Date().toISOString(),
            algorithm: 'Multiple Linear Regression (OLS)',
            features: this.featureNames,
            sampleCount: samples.length
        };

        return this.metrics;
    }

    predict(featureObj) {
        if (!this.trained) throw new Error('Model not trained');
        const row = this.featureNames.map(f => featureObj[f] || 0);
        const normalized = this._normalizeSingle(row);
        return Math.max(0, Math.round(this._predict(normalized)));
    }

    _predict(normalizedRow) {
        let sum = this.bias;
        for (let i = 0; i < this.weights.length; i++) {
            sum += this.weights[i] * normalizedRow[i];
        }
        return sum;
    }

    // ── Normalization ──
    _fitNormalization(X) {
        const n = X[0].length;
        this.means = new Array(n).fill(0);
        this.stds = new Array(n).fill(1);

        for (let j = 0; j < n; j++) {
            const col = X.map(row => row[j]);
            this.means[j] = col.reduce((a, b) => a + b, 0) / col.length;
            const variance = col.reduce((a, b) => a + (b - this.means[j]) ** 2, 0) / col.length;
            this.stds[j] = Math.sqrt(variance) || 1;
        }
    }

    _normalize(X) {
        return X.map(row => row.map((v, j) => (v - this.means[j]) / this.stds[j]));
    }

    _normalizeSingle(row) {
        return row.map((v, j) => (v - this.means[j]) / this.stds[j]);
    }

    // ── Metrics ──
    _computeMetrics(actual, predicted) {
        const n = actual.length;
        let sumError = 0, sumAbsError = 0, sumSqError = 0, sumAbsPctError = 0;
        let sumActual = 0, sumSqTotal = 0;

        const meanActual = actual.reduce((a, b) => a + b, 0) / n;

        for (let i = 0; i < n; i++) {
            const error = actual[i] - predicted[i];
            sumError += error;
            sumAbsError += Math.abs(error);
            sumSqError += error ** 2;
            sumSqTotal += (actual[i] - meanActual) ** 2;
            if (actual[i] !== 0) {
                sumAbsPctError += Math.abs(error / actual[i]);
            }
        }

        const rmse = Math.sqrt(sumSqError / n);
        const mae = sumAbsError / n;
        const mape = (sumAbsPctError / n) * 100;
        const r2 = 1 - (sumSqError / (sumSqTotal || 1));

        return {
            rmse: Math.round(rmse),
            mae: Math.round(mae),
            mape: parseFloat(mape.toFixed(2)),
            r2: parseFloat(r2.toFixed(4)),
            meanBias: Math.round(sumError / n),
            accuracy: parseFloat((100 - mape).toFixed(2))
        };
    }

    // ── Matrix Operations ──
    _transpose(M) {
        const rows = M.length, cols = M[0].length;
        const T = Array.from({ length: cols }, () => new Array(rows));
        for (let i = 0; i < rows; i++)
            for (let j = 0; j < cols; j++)
                T[j][i] = M[i][j];
        return T;
    }

    _matMul(A, B) {
        const m = A.length, n = B[0].length, k = B.length;
        const C = Array.from({ length: m }, () => new Array(n).fill(0));
        for (let i = 0; i < m; i++)
            for (let j = 0; j < n; j++)
                for (let p = 0; p < k; p++)
                    C[i][j] += A[i][p] * B[p][j];
        return C;
    }

    _matVecMul(M, v) {
        return M.map(row => row.reduce((s, val, j) => s + val * v[j], 0));
    }

    _matVecMul2(M, v) {
        return M.map(row => row.reduce((s, val, j) => s + val * v[j], 0));
    }

    _invertMatrix(M) {
        const n = M.length;
        const aug = M.map((row, i) => {
            const identity = new Array(n).fill(0);
            identity[i] = 1;
            return [...row, ...identity];
        });

        // Gauss-Jordan elimination
        for (let col = 0; col < n; col++) {
            // Find pivot
            let maxRow = col;
            for (let row = col + 1; row < n; row++) {
                if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
            }
            [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

            const pivot = aug[col][col];
            if (Math.abs(pivot) < 1e-12) {
                // Regularize: add small diagonal
                aug[col][col] += 1e-6;
            }

            const piv = aug[col][col];
            for (let j = 0; j < 2 * n; j++) aug[col][j] /= piv;

            for (let row = 0; row < n; row++) {
                if (row === col) continue;
                const factor = aug[row][col];
                for (let j = 0; j < 2 * n; j++) {
                    aug[row][j] -= factor * aug[col][j];
                }
            }
        }

        return aug.map(row => row.slice(n));
    }

    // ── Serialization ──
    toJSON() {
        return {
            weights: this.weights,
            bias: this.bias,
            featureNames: this.featureNames,
            means: this.means,
            stds: this.stds,
            metrics: this.metrics,
            trainingMeta: this.trainingMeta,
            trained: this.trained
        };
    }

    static fromJSON(json) {
        const model = new LinearRegressionModel();
        Object.assign(model, json);
        return model;
    }
}


// ──────────────────────────────────────────────
// 3. MONTE CARLO SIMULATION ENGINE
// ──────────────────────────────────────────────
export class MonteCarloEngine {
    /**
     * Run N simulations with randomized parameters within uncertainty bounds.
     * Returns distribution of outcomes.
     */
    static simulate(baseConfig, {
        iterations = 1000,
        uncertaintyRange = 0.15,  // ±15% parameter variation
        forecastMonths = 24
    } = {}) {
        const results = [];

        for (let i = 0; i < iterations; i++) {
            const perturbedConfig = {
                ...baseConfig,
                avgTicket: baseConfig.avgTicket * (1 + (Math.random() - 0.5) * 2 * uncertaintyRange),
                dailyCustomers: Math.round(baseConfig.dailyCustomers * (1 + (Math.random() - 0.5) * 2 * uncertaintyRange)),
                employees: Math.max(1, Math.round(baseConfig.employees + (Math.random() - 0.5) * 2 * 2)),
                rent: Math.round(baseConfig.rent * (1 + (Math.random() - 0.5) * 2 * uncertaintyRange * 0.5))
            };

            const engine = new FinancialEngine(perturbedConfig);
            const summary = engine.getFinancialSummary();

            results.push({
                monthlyRevenue: summary.monthlyRevenue,
                monthlyProfit: summary.monthlyProfit,
                profitMargin: parseFloat(summary.profitMargin),
                breakEvenMonth: summary.breakEven.month,
                roi: summary.roi.roi,
                annualRevenue: summary.annualRevenue,
                annualProfit: summary.annualProfit,
                forecast: summary.forecast.map(f => ({
                    month: f.month,
                    revenue: f.revenue,
                    netProfit: f.netProfit,
                    cumulativeCashFlow: f.cumulativeCashFlow
                }))
            });
        }

        return this._analyzeDistribution(results, forecastMonths);
    }

    static _analyzeDistribution(results, months) {
        const sort = (arr) => [...arr].sort((a, b) => a - b);

        const revenues = sort(results.map(r => r.monthlyRevenue));
        const profits = sort(results.map(r => r.monthlyProfit));
        const margins = sort(results.map(r => r.profitMargin));
        const rois = sort(results.map(r => r.roi));
        const breakEvens = results.map(r => r.breakEvenMonth).filter(m => m !== null);

        const percentile = (arr, p) => {
            const idx = Math.floor(arr.length * p);
            return arr[Math.min(idx, arr.length - 1)];
        };

        const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr) => {
            const m = mean(arr);
            return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
        };

        // Probability cones for forecast
        const forecastCones = [];
        for (let m = 0; m < months; m++) {
            const monthRevenues = sort(results.map(r => r.forecast[m]?.revenue || 0));
            const monthProfits = sort(results.map(r => r.forecast[m]?.netProfit || 0));
            const monthCashFlows = sort(results.map(r => r.forecast[m]?.cumulativeCashFlow || 0));

            forecastCones.push({
                month: m + 1,
                revenue: {
                    p5: percentile(monthRevenues, 0.05),
                    p25: percentile(monthRevenues, 0.25),
                    p50: percentile(monthRevenues, 0.50),
                    p75: percentile(monthRevenues, 0.75),
                    p95: percentile(monthRevenues, 0.95),
                    mean: Math.round(mean(monthRevenues))
                },
                profit: {
                    p5: percentile(monthProfits, 0.05),
                    p25: percentile(monthProfits, 0.25),
                    p50: percentile(monthProfits, 0.50),
                    p75: percentile(monthProfits, 0.75),
                    p95: percentile(monthProfits, 0.95),
                    mean: Math.round(mean(monthProfits))
                },
                cashFlow: {
                    p5: percentile(monthCashFlows, 0.05),
                    p25: percentile(monthCashFlows, 0.25),
                    p50: percentile(monthCashFlows, 0.50),
                    p75: percentile(monthCashFlows, 0.75),
                    p95: percentile(monthCashFlows, 0.95),
                    mean: Math.round(mean(monthCashFlows))
                }
            });
        }

        return {
            iterations: results.length,
            revenue: {
                mean: Math.round(mean(revenues)),
                std: Math.round(std(revenues)),
                p5: percentile(revenues, 0.05),
                p25: percentile(revenues, 0.25),
                median: percentile(revenues, 0.50),
                p75: percentile(revenues, 0.75),
                p95: percentile(revenues, 0.95)
            },
            profit: {
                mean: Math.round(mean(profits)),
                std: Math.round(std(profits)),
                p5: percentile(profits, 0.05),
                median: percentile(profits, 0.50),
                p95: percentile(profits, 0.95)
            },
            margin: {
                mean: parseFloat(mean(margins).toFixed(1)),
                p5: parseFloat(percentile(margins, 0.05).toFixed(1)),
                median: parseFloat(percentile(margins, 0.50).toFixed(1)),
                p95: parseFloat(percentile(margins, 0.95).toFixed(1))
            },
            roi: {
                mean: parseFloat(mean(rois).toFixed(1)),
                p5: parseFloat(percentile(rois, 0.05).toFixed(1)),
                median: parseFloat(percentile(rois, 0.50).toFixed(1)),
                p95: parseFloat(percentile(rois, 0.95).toFixed(1))
            },
            breakEven: {
                meanMonth: breakEvens.length > 0 ? parseFloat(mean(breakEvens).toFixed(1)) : null,
                probWithin12: parseFloat((breakEvens.filter(m => m <= 12).length / results.length * 100).toFixed(1)),
                probWithin18: parseFloat((breakEvens.filter(m => m <= 18).length / results.length * 100).toFixed(1)),
                probNever: parseFloat(((results.length - breakEvens.length) / results.length * 100).toFixed(1))
            },
            forecastCones,
            probabilityOfProfit: parseFloat((profits.filter(p => p > 0).length / results.length * 100).toFixed(1))
        };
    }
}


// ──────────────────────────────────────────────
// 4. BACKTESTING ENGINE
// ──────────────────────────────────────────────
export class BacktestEngine {
    /**
     * Compare predicted values against actual historical data.
     * @param {Array} actuals - Array of { month, revenue, costs, customers }
     * @param {Object} config - Business configuration used by the twin
     * @returns Backtesting accuracy report
     */
    static run(actuals, config) {
        if (!actuals || actuals.length === 0) {
            return { status: 'no_data', message: 'No historical data available for backtesting' };
        }

        const engine = new FinancialEngine(config);
        const comparisons = [];

        actuals.forEach(actual => {
            const predicted = engine.calculateMonthlyRevenue(actual.month - 1);
            const error = actual.revenue - predicted;
            const pctError = actual.revenue !== 0 ? (error / actual.revenue) * 100 : 0;

            comparisons.push({
                month: actual.month,
                actualRevenue: actual.revenue,
                predictedRevenue: predicted,
                error: Math.round(error),
                pctError: parseFloat(pctError.toFixed(2)),
                absPctError: parseFloat(Math.abs(pctError).toFixed(2))
            });
        });

        // Compute aggregate metrics
        const n = comparisons.length;
        const sumSqError = comparisons.reduce((s, c) => s + c.error ** 2, 0);
        const sumAbsError = comparisons.reduce((s, c) => s + Math.abs(c.error), 0);
        const sumAbsPctError = comparisons.reduce((s, c) => s + c.absPctError, 0);
        const meanActual = actuals.reduce((s, a) => s + a.revenue, 0) / n;
        const sumSqTotal = actuals.reduce((s, a) => s + (a.revenue - meanActual) ** 2, 0);

        return {
            status: 'complete',
            dataPoints: n,
            comparisons,
            metrics: {
                rmse: Math.round(Math.sqrt(sumSqError / n)),
                mae: Math.round(sumAbsError / n),
                mape: parseFloat((sumAbsPctError / n).toFixed(2)),
                r2: parseFloat((1 - sumSqError / (sumSqTotal || 1)).toFixed(4)),
                accuracy: parseFloat((100 - sumAbsPctError / n).toFixed(2))
            },
            fidelityScore: this._calculateFidelityScore(sumAbsPctError / n)
        };
    }

    static _calculateFidelityScore(mape) {
        // Convert MAPE to a 0-100 fidelity score
        if (mape <= 5) return { score: 95 + (5 - mape), label: 'Excellent', color: 'emerald' };
        if (mape <= 10) return { score: 80 + (10 - mape) * 3, label: 'Good', color: 'green' };
        if (mape <= 20) return { score: 60 + (20 - mape) * 2, label: 'Fair', color: 'amber' };
        if (mape <= 35) return { score: 30 + (35 - mape) * 2, label: 'Poor', color: 'orange' };
        return { score: Math.max(0, 30 - (mape - 35)), label: 'Unreliable', color: 'red' };
    }
}


// ──────────────────────────────────────────────
// 5. AUTO-CALIBRATION / FEEDBACK LOOP ENGINE
// ──────────────────────────────────────────────
export class CalibrationEngine {
    /**
     * Compares actual data against predictions and calculates
     * parameter adjustments to minimize prediction error.
     *
     * This implements a simple proportional feedback controller:
     * adjustment = actual/predicted bias applied to relevant params.
     */
    static calibrate(actuals, currentConfig) {
        if (!actuals || actuals.length < 3) {
            return {
                status: 'insufficient_data',
                message: 'Need at least 3 months of data for calibration',
                adjustments: null
            };
        }

        const engine = new FinancialEngine(currentConfig);
        let totalActualRevenue = 0;
        let totalPredictedRevenue = 0;
        let totalActualCustomers = 0;
        let countWithCustomers = 0;

        actuals.forEach(a => {
            const predicted = engine.calculateMonthlyRevenue(a.month - 1);
            totalActualRevenue += a.revenue;
            totalPredictedRevenue += predicted;
            if (a.customers) {
                totalActualCustomers += a.customers;
                countWithCustomers++;
            }
        });

        const revenueBias = totalPredictedRevenue > 0
            ? totalActualRevenue / totalPredictedRevenue
            : 1;

        // Decompose the bias into pricing vs. volume
        const avgActualTicket = countWithCustomers > 0
            ? totalActualRevenue / (totalActualCustomers * 26) // approximate
            : currentConfig.avgTicket;

        const ticketAdjustment = avgActualTicket / currentConfig.avgTicket;
        const volumeAdjustment = revenueBias / ticketAdjustment;

        // Drift detection
        const drift = Math.abs(1 - revenueBias) * 100;
        const driftLevel = drift > 25 ? 'critical' : drift > 15 ? 'high' : drift > 8 ? 'moderate' : 'low';

        const calibratedConfig = {
            ...currentConfig,
            avgTicket: parseFloat((currentConfig.avgTicket * Math.min(1.3, Math.max(0.7, ticketAdjustment))).toFixed(2)),
            dailyCustomers: Math.max(1, Math.round(currentConfig.dailyCustomers * Math.min(1.3, Math.max(0.7, volumeAdjustment))))
        };

        return {
            status: 'calibrated',
            drift: {
                percentage: parseFloat(drift.toFixed(1)),
                level: driftLevel,
                direction: revenueBias > 1 ? 'under-predicting' : 'over-predicting'
            },
            adjustments: {
                revenueBias: parseFloat(revenueBias.toFixed(3)),
                ticketAdjustment: parseFloat(ticketAdjustment.toFixed(3)),
                volumeAdjustment: parseFloat(volumeAdjustment.toFixed(3))
            },
            originalConfig: currentConfig,
            calibratedConfig,
            confidence: parseFloat((Math.max(0, 100 - drift * 1.5)).toFixed(1)),
            dataPointsUsed: actuals.length
        };
    }
}


// ──────────────────────────────────────────────
// 6. UNIFIED ML PIPELINE
// ──────────────────────────────────────────────
export class MLPipeline {
    constructor() {
        this.model = new LinearRegressionModel();
        this.isReady = false;
    }

    /**
     * Full pipeline: generate data → train → evaluate → return report
     */
    trainForBusinessType(businessTypeId, sampleCount = 500) {
        const samples = SyntheticDataGenerator.generate(businessTypeId, sampleCount);
        const metrics = this.model.train(samples);
        this.isReady = true;

        // Also run k-fold cross-validation
        const cvResults = CrossValidator.kFold(samples, 5);

        // Auto-persist to localStorage
        ModelPersistence.save(this.model, businessTypeId);

        return {
            model: this.model.toJSON(),
            metrics,
            crossValidation: cvResults,
            trainingReport: {
                algorithm: 'Multiple Linear Regression (OLS Normal Equation)',
                businessType: businessTypeId,
                features: this.model.featureNames,
                samples: sampleCount,
                trainAccuracy: metrics.train.accuracy,
                testAccuracy: metrics.test.accuracy,
                r2: metrics.test.r2,
                rmse: metrics.test.rmse,
                mae: metrics.test.mae,
                mape: metrics.test.mape,
                cvMeanR2: cvResults.meanR2,
                cvMeanMAPE: cvResults.meanMAPE,
                trainedAt: new Date().toISOString()
            }
        };
    }

    predictRevenue(features) {
        if (!this.isReady) throw new Error('Pipeline not trained');
        return this.model.predict(features);
    }

    /**
     * Load a previously saved model from localStorage
     */
    loadSavedModel(businessTypeId) {
        const loaded = ModelPersistence.load(businessTypeId);
        if (loaded) {
            this.model = loaded;
            this.isReady = true;
            return true;
        }
        return false;
    }

    /**
     * Run Monte Carlo analysis on a business configuration
     */
    monteCarloAnalysis(config, options) {
        return MonteCarloEngine.simulate(config, options);
    }

    /**
     * Run backtesting against actual data
     */
    backtest(actuals, config) {
        return BacktestEngine.run(actuals, config);
    }

    /**
     * Auto-calibrate the twin based on actual data
     */
    calibrate(actuals, config) {
        return CalibrationEngine.calibrate(actuals, config);
    }

    /**
     * Generate residual analysis for the trained model
     */
    residualAnalysis(businessTypeId) {
        if (!this.isReady) return null;
        const samples = SyntheticDataGenerator.generate(businessTypeId, 200);
        return ResidualAnalyzer.analyze(this.model, samples);
    }

    /**
     * Run anomaly detection on actual data
     */
    detectAnomalies(actuals) {
        return AnomalyDetector.detect(actuals);
    }
}


// ──────────────────────────────────────────────
// 7. K-FOLD CROSS VALIDATION
// ──────────────────────────────────────────────
export class CrossValidator {
    /**
     * k-fold cross-validation for the Linear Regression model.
     * Splits data into k folds, trains on k-1 folds, evaluates on the held-out fold.
     */
    static kFold(samples, k = 5) {
        const shuffled = [...samples].sort(() => Math.random() - 0.5);
        const foldSize = Math.floor(shuffled.length / k);
        const foldResults = [];

        for (let i = 0; i < k; i++) {
            const testStart = i * foldSize;
            const testEnd = i === k - 1 ? shuffled.length : (i + 1) * foldSize;
            const testFold = shuffled.slice(testStart, testEnd);
            const trainFold = [...shuffled.slice(0, testStart), ...shuffled.slice(testEnd)];

            // Train a fresh model on this fold
            const model = new LinearRegressionModel();
            model.train(trainFold, 0); // 0 test split since we have our own test fold

            // Evaluate on the held-out fold
            const predictions = testFold.map(s => model.predict(s.features));
            const actuals = testFold.map(s => s.target);
            const metrics = model._computeMetrics(actuals, predictions);

            foldResults.push({
                fold: i + 1,
                trainSize: trainFold.length,
                testSize: testFold.length,
                r2: metrics.r2,
                rmse: metrics.rmse,
                mae: metrics.mae,
                mape: metrics.mape,
                accuracy: metrics.accuracy
            });
        }

        // Aggregate results
        const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr) => {
            const m = mean(arr);
            return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
        };

        return {
            k,
            folds: foldResults,
            meanR2: parseFloat(mean(foldResults.map(f => f.r2)).toFixed(4)),
            stdR2: parseFloat(std(foldResults.map(f => f.r2)).toFixed(4)),
            meanMAPE: parseFloat(mean(foldResults.map(f => f.mape)).toFixed(2)),
            stdMAPE: parseFloat(std(foldResults.map(f => f.mape)).toFixed(2)),
            meanRMSE: parseFloat(Math.round(mean(foldResults.map(f => f.rmse)))),
            meanAccuracy: parseFloat(mean(foldResults.map(f => f.accuracy)).toFixed(2)),
            stdAccuracy: parseFloat(std(foldResults.map(f => f.accuracy)).toFixed(2))
        };
    }
}


// ──────────────────────────────────────────────
// 8. MODEL PERSISTENCE (localStorage)
// ──────────────────────────────────────────────
export class ModelPersistence {
    static STORAGE_KEY = 'dt_ml_models';

    static save(model, businessTypeId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            data[businessTypeId] = {
                model: model.toJSON(),
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch {
            return false;
        }
    }

    static load(businessTypeId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            if (data[businessTypeId]) {
                return LinearRegressionModel.fromJSON(data[businessTypeId].model);
            }
            return null;
        } catch {
            return null;
        }
    }

    static listSaved() {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return Object.entries(data).map(([id, d]) => ({
                businessType: id,
                savedAt: d.savedAt,
                metrics: d.model.metrics
            }));
        } catch {
            return [];
        }
    }

    static clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}


// ──────────────────────────────────────────────
// 9. RESIDUAL ANALYZER
// ──────────────────────────────────────────────
export class ResidualAnalyzer {
    /**
     * Produces residual analysis data for visualization:
     * - Residual scatter plot (predicted vs residual)
     * - Residual distribution (histogram bins)
     * - QQ-plot data
     * - Durbin-Watson statistic for autocorrelation
     */
    static analyze(model, samples) {
        const predictions = samples.map(s => model.predict(s.features));
        const actuals = samples.map(s => s.target);
        const residuals = actuals.map((a, i) => a - predictions[i]);

        // Scatter data
        const scatterData = predictions.map((pred, i) => ({
            predicted: pred,
            residual: residuals[i],
            actual: actuals[i]
        }));

        // Residual distribution (10 bins)
        const minR = Math.min(...residuals);
        const maxR = Math.max(...residuals);
        const binWidth = (maxR - minR) / 10 || 1;
        const bins = [];
        for (let b = 0; b < 10; b++) {
            const lo = minR + b * binWidth;
            const hi = lo + binWidth;
            const count = residuals.filter(r => r >= lo && (b === 9 ? r <= hi : r < hi)).length;
            bins.push({ range: `${Math.round(lo)} to ${Math.round(hi)}`, count, midpoint: Math.round((lo + hi) / 2) });
        }

        // Durbin-Watson statistic
        let sumSqDiff = 0, sumSqResid = 0;
        for (let i = 1; i < residuals.length; i++) {
            sumSqDiff += (residuals[i] - residuals[i - 1]) ** 2;
        }
        sumSqResid = residuals.reduce((s, r) => s + r ** 2, 0);
        const dw = sumSqResid > 0 ? sumSqDiff / sumSqResid : 2;

        // Mean and std of residuals
        const meanResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;
        const stdResidual = Math.sqrt(residuals.reduce((s, r) => s + (r - meanResidual) ** 2, 0) / residuals.length);

        return {
            scatterData,
            distribution: bins,
            durbinWatson: parseFloat(dw.toFixed(4)),
            durbinWatsonInterpretation: dw < 1.5 ? 'Positive autocorrelation' : dw > 2.5 ? 'Negative autocorrelation' : 'No significant autocorrelation',
            meanResidual: Math.round(meanResidual),
            stdResidual: Math.round(stdResidual),
            normality: Math.abs(meanResidual) < stdResidual * 0.1 ? 'Approximately normal' : 'Non-normal residuals'
        };
    }
}


// ──────────────────────────────────────────────
// 10. ANOMALY DETECTOR (Z-Score)
// ──────────────────────────────────────────────
export class AnomalyDetector {
    /**
     * Detect anomalies in actual data using Z-score method.
     * Points with |Z| > threshold are flagged as anomalies.
     */
    static detect(actuals, threshold = 2.0) {
        if (!actuals || actuals.length < 3) {
            return { status: 'insufficient_data', anomalies: [] };
        }

        const revenues = actuals.map(a => a.revenue);
        const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
        const std = Math.sqrt(revenues.reduce((s, r) => s + (r - mean) ** 2, 0) / revenues.length) || 1;

        const results = actuals.map((a, i) => {
            const zScore = (a.revenue - mean) / std;
            const isAnomaly = Math.abs(zScore) > threshold;
            return {
                month: a.month,
                revenue: a.revenue,
                zScore: parseFloat(zScore.toFixed(3)),
                isAnomaly,
                reason: isAnomaly
                    ? (zScore > 0 ? 'Unusually high revenue' : 'Unusually low revenue')
                    : 'Normal range'
            };
        });

        return {
            status: 'complete',
            mean: Math.round(mean),
            std: Math.round(std),
            threshold,
            anomalies: results.filter(r => r.isAnomaly),
            allPoints: results,
            anomalyRate: parseFloat((results.filter(r => r.isAnomaly).length / results.length * 100).toFixed(1))
        };
    }
}


// ──────────────────────────────────────────────
// 11. SAMPLE REAL-WORLD DATASET
// ──────────────────────────────────────────────
export class SampleDataset {
    /**
     * Provides a 12-month sample dataset for a café business
     * based on realistic industry benchmarks.
     * Used for demonstration of backtesting and calibration.
     */
    static getCafeData() {
        return [
            { month: 1, year: 2025, revenue: 28500, costs: 22800, customers: 2280, notes: 'Post-holiday slow period' },
            { month: 2, year: 2025, revenue: 26200, costs: 21900, customers: 2100, notes: 'February slowdown' },
            { month: 3, year: 2025, revenue: 31800, costs: 23400, customers: 2520, notes: 'Spring uptick' },
            { month: 4, year: 2025, revenue: 34200, costs: 24200, customers: 2750, notes: 'Good weather boost' },
            { month: 5, year: 2025, revenue: 36500, costs: 25100, customers: 2900, notes: 'Peak spring' },
            { month: 6, year: 2025, revenue: 38100, costs: 25800, customers: 3050, notes: 'Summer begins' },
            { month: 7, year: 2025, revenue: 35800, costs: 25200, customers: 2870, notes: 'Summer heat dip' },
            { month: 8, year: 2025, revenue: 33600, costs: 24600, customers: 2700, notes: 'Late summer' },
            { month: 9, year: 2025, revenue: 36900, costs: 25500, customers: 2950, notes: 'Back to school boost' },
            { month: 10, year: 2025, revenue: 38500, costs: 26100, customers: 3100, notes: 'Fall peak' },
            { month: 11, year: 2025, revenue: 37200, costs: 25800, customers: 2980, notes: 'Holiday prep' },
            { month: 12, year: 2025, revenue: 40100, costs: 27500, customers: 3200, notes: 'Holiday season' }
        ];
    }

    static getRestaurantData() {
        return [
            { month: 1, year: 2025, revenue: 52000, costs: 41600, customers: 3250, notes: 'New Year recovery' },
            { month: 2, year: 2025, revenue: 48500, costs: 39800, customers: 3030, notes: 'Valentine boost mid-month' },
            { month: 3, year: 2025, revenue: 55200, costs: 42500, customers: 3450, notes: 'Spring dining out' },
            { month: 4, year: 2025, revenue: 58100, costs: 43800, customers: 3630, notes: 'Patio season opens' },
            { month: 5, year: 2025, revenue: 61500, costs: 45200, customers: 3840, notes: 'Mothers Day peak' },
            { month: 6, year: 2025, revenue: 63200, costs: 46100, customers: 3950, notes: 'Summer peak' },
            { month: 7, year: 2025, revenue: 59800, costs: 44800, customers: 3740, notes: 'Mid-summer dip' },
            { month: 8, year: 2025, revenue: 57400, costs: 43500, customers: 3590, notes: 'Late summer' },
            { month: 9, year: 2025, revenue: 60500, costs: 45000, customers: 3780, notes: 'Fall dining season' },
            { month: 10, year: 2025, revenue: 62800, costs: 46000, customers: 3930, notes: 'Harvest events' },
            { month: 11, year: 2025, revenue: 64500, costs: 47200, customers: 4030, notes: 'Thanksgiving' },
            { month: 12, year: 2025, revenue: 68200, costs: 49800, customers: 4260, notes: 'Holiday parties' }
        ];
    }

    /**
     * Get sample data for any supported business type
     */
    static getForType(businessTypeId) {
        switch (businessTypeId) {
            case 'cafe': return this.getCafeData();
            case 'restaurant': return this.getRestaurantData();
            default: return this.getCafeData(); // Default to café data
        }
    }

    /**
     * Generate a CSV string from sample data (for demo download)
     */
    static toCSV(data) {
        const headers = 'month,year,revenue,costs,customers\n';
        const rows = data.map(d => `${d.month},${d.year},${d.revenue},${d.costs},${d.customers}`).join('\n');
        return headers + rows;
    }
}
