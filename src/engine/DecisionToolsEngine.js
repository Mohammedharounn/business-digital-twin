import { FinancialEngine } from './SimulationEngine';

const EGYPT_VAT = 0.14;

function num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }
function summaryOf(config) {
    try { return new FinancialEngine(config).getFinancialSummary(); } catch { return null; }
}
function monthlyProfitOf(config) {
    const s = summaryOf(config);
    return s ? num(s.monthlyProfit) : 0;
}

export const DecisionToolsEngine = {
    /** #5 Cash runway: how long startup capital lasts at the current monthly net. */
    cashRunway(summary) {
        const cash = num(summary?.startup?.total ?? summary?.startup);
        const net = num(summary?.monthlyProfit);
        if (net >= 0) return { sustainable: true, months: Infinity, cash, burn: 0, breakEven: summary?.breakEven?.month ?? null };
        const months = Math.max(0, Math.floor(cash / Math.abs(net)));
        return { sustainable: false, months, cash, burn: Math.abs(net), breakEven: summary?.breakEven?.month ?? null };
    },

    /** #4 Loan repayment (amortized): monthly payment + totals. */
    loanSchedule(principal, annualRatePct, months) {
        const P = num(principal);
        const r = num(annualRatePct) / 100 / 12;
        const n = Math.max(1, Math.round(num(months)));
        let payment;
        if (r === 0) payment = P / n;
        else payment = (P * r) / (1 - Math.pow(1 + r, -n));
        const totalPaid = payment * n;
        const totalInterest = totalPaid - P;
        // first 6-row preview
        let balance = P;
        const rows = [];
        for (let i = 1; i <= n && rows.length < 6; i++) {
            const interest = balance * r;
            const principalPart = payment - interest;
            balance = Math.max(0, balance - principalPart);
            rows.push({ month: i, payment, interest, principal: principalPart, balance });
        }
        return { payment, totalPaid, totalInterest, months: n, principal: P, rows };
    },

    /** #6 Egypt VAT (14%) view. */
    vat(summary, rate = EGYPT_VAT) {
        const revenue = num(summary?.monthlyRevenue);
        const annualRevenue = num(summary?.annualRevenue ?? revenue * 12);
        return {
            ratePct: rate * 100,
            monthlyVat: Math.round(revenue * rate),
            annualVat: Math.round(annualRevenue * rate),
            // if prices are VAT-inclusive, the portion that is actually yours:
            netOfInclusiveVat: Math.round(revenue / (1 + rate)),
        };
    },

    /** #7 Sensitivity — which input moves profit the most (±10%). */
    sensitivity(config) {
        if (!config) return [];
        const base = monthlyProfitOf(config);
        const drivers = [
            ['avgTicket', 'Average Ticket'],
            ['dailyCustomers', 'Daily Customers'],
            ['rent', 'Monthly Rent'],
            ['employees', 'Headcount'],
            ['avgSalary', 'Avg Salary'],
            ['operatingDays', 'Operating Days'],
            ['marketingBudget', 'Marketing Budget'],
        ];
        const out = [];
        for (const [key, label] of drivers) {
            if (config[key] == null || Number(config[key]) === 0) continue;
            const up = monthlyProfitOf({ ...config, [key]: num(config[key]) * 1.1 });
            const down = monthlyProfitOf({ ...config, [key]: num(config[key]) * 0.9 });
            const swing = Math.abs(up - down);
            const impactPct = base !== 0 ? Math.round((swing / Math.abs(base)) * 100) : 0;
            out.push({ key, label, swing: Math.round(swing), impactPct, direction: up >= down ? 'up' : 'down' });
        }
        return out.sort((a, b) => b.swing - a.swing);
    },
};

export default DecisionToolsEngine;
