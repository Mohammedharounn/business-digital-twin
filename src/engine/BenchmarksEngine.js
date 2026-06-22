/**
 * BenchmarksEngine — indicative Egypt SME market benchmarks & comparable businesses.
 *
 * Figures are realistic, research-informed reference ranges for pre-launch planning
 * (monthly EGP). They are presented as INDICATIVE benchmarks, not live market feeds —
 * the platform compares a user's configuration against these to ground its forecasts.
 */

// Per-vertical benchmarks (monthly, EGP). rentPerSqft = E£ / sq.ft / month.
const VERTICAL_BENCHMARKS = {
    cafe:       { label: 'Café',            rentPerSqft: [12, 20, 34],  staff: [3, 6, 10],   avgTicket: [45, 90, 160],   margin: [10, 18, 26] },
    restaurant: { label: 'Restaurant',      rentPerSqft: [14, 24, 40],  staff: [6, 12, 22],  avgTicket: [120, 220, 420], margin: [8, 15, 22] },
    gym:        { label: 'Gym / Fitness',   rentPerSqft: [9, 16, 28],   staff: [4, 8, 14],   avgTicket: [350, 650, 1200], margin: [18, 28, 40] },
    retail:     { label: 'Retail Store',    rentPerSqft: [16, 28, 50],  staff: [2, 5, 9],    avgTicket: [120, 280, 600], margin: [12, 22, 34] },
    salon:      { label: 'Beauty Salon',    rentPerSqft: [12, 22, 38],  staff: [3, 6, 11],   avgTicket: [150, 320, 700], margin: [22, 34, 48] },
    bakery:     { label: 'Bakery',          rentPerSqft: [11, 18, 30],  staff: [3, 7, 12],   avgTicket: [40, 80, 150],   margin: [14, 24, 32] },
    coworking:  { label: 'Co-Working Space',rentPerSqft: [10, 18, 32],  staff: [2, 4, 8],    avgTicket: [900, 1800, 3500], margin: [20, 32, 45] },
    laundry:    { label: 'Laundromat',      rentPerSqft: [8, 14, 24],   staff: [2, 4, 7],    avgTicket: [60, 120, 240],  margin: [16, 26, 38] },
};

// City rent multiplier vs national typical (applied to displayed benchmark, indicative).
const CITY_MULTIPLIER = {
    cairo: 1.25, 'new cairo': 1.45, giza: 1.1, '6th of october': 1.05,
    alexandria: 1.0, mansoura: 0.85, tanta: 0.8, default: 1.0,
};

// Egypt SME financing reference (annual %). CBE-style initiatives at the low end.
const SME_LOAN_RATES = { subsidized: 8, typical: 15, highRisk: 22 };

// Anonymized comparable businesses per vertical (monthly, EGP).
const COMPARABLES = {
    cafe: [
        { name: 'Specialty café · New Cairo', revenue: 420000, staff: 7, rent: 55000, margin: 19 },
        { name: 'Neighborhood café · Giza',   revenue: 240000, staff: 5, rent: 32000, margin: 15 },
        { name: 'Kiosk café · Alexandria',    revenue: 150000, staff: 3, rent: 18000, margin: 12 },
    ],
    restaurant: [
        { name: 'Casual dining · Maadi',      revenue: 980000, staff: 16, rent: 120000, margin: 14 },
        { name: 'Fast-casual · Nasr City',    revenue: 540000, staff: 10, rent: 70000,  margin: 12 },
        { name: 'Family restaurant · Tanta',  revenue: 300000, staff: 8,  rent: 35000,  margin: 16 },
    ],
    gym: [
        { name: 'Boutique studio · Zamalek',  revenue: 620000, staff: 9, rent: 90000, margin: 30 },
        { name: 'Community gym · 6th Oct',    revenue: 380000, staff: 7, rent: 48000, margin: 26 },
        { name: 'Budget gym · Mansoura',      revenue: 190000, staff: 4, rent: 22000, margin: 22 },
    ],
    retail: [
        { name: 'Apparel store · City Stars',  revenue: 700000, staff: 6, rent: 110000, margin: 24 },
        { name: 'Electronics shop · Giza',     revenue: 450000, staff: 4, rent: 55000,  margin: 18 },
        { name: 'Gift shop · Alexandria',      revenue: 180000, staff: 2, rent: 24000,  margin: 22 },
    ],
    salon: [
        { name: 'Premium salon · New Cairo',   revenue: 480000, staff: 8, rent: 60000, margin: 36 },
        { name: 'Unisex salon · Heliopolis',   revenue: 280000, staff: 6, rent: 34000, margin: 32 },
        { name: 'Local salon · Tanta',         revenue: 130000, staff: 3, rent: 14000, margin: 28 },
    ],
    bakery: [
        { name: 'Artisan bakery · Maadi',      revenue: 360000, staff: 8, rent: 42000, margin: 24 },
        { name: 'Patisserie · Nasr City',      revenue: 240000, staff: 6, rent: 30000, margin: 22 },
        { name: 'Bread bakery · Giza',         revenue: 150000, staff: 4, rent: 16000, margin: 20 },
    ],
    coworking: [
        { name: 'Premium hub · Smart Village', revenue: 850000, staff: 6, rent: 140000, margin: 34 },
        { name: 'Startup space · Downtown',    revenue: 460000, staff: 4, rent: 70000,  margin: 30 },
        { name: 'Small studio · Alexandria',   revenue: 210000, staff: 2, rent: 28000,  margin: 26 },
    ],
    laundry: [
        { name: 'Self-service · New Cairo',    revenue: 220000, staff: 4, rent: 30000, margin: 28 },
        { name: 'Laundry + dry-clean · Giza',  revenue: 150000, staff: 3, rent: 18000, margin: 24 },
        { name: 'Corner laundromat · Tanta',   revenue: 85000,  staff: 2, rent: 9000,  margin: 20 },
    ],
};

function cityMultiplier(location = '') {
    const key = String(location || '').toLowerCase().trim();
    for (const c of Object.keys(CITY_MULTIPLIER)) {
        if (key.includes(c)) return CITY_MULTIPLIER[c];
    }
    return CITY_MULTIPLIER.default;
}

function position(value, [low, typ, high]) {
    // Returns delta % vs typical and a band label.
    const deltaPct = typ ? Math.round(((value - typ) / typ) * 100) : 0;
    let band = 'typical';
    if (value < low) band = 'below';
    else if (value > high) band = 'above';
    return { deltaPct, band, low, typ, high };
}

export const BenchmarksEngine = {
    VERTICAL_BENCHMARKS,
    SME_LOAN_RATES,

    getBenchmark(businessType) {
        return VERTICAL_BENCHMARKS[businessType] || VERTICAL_BENCHMARKS.cafe;
    },

    getComparables(businessType) {
        return COMPARABLES[businessType] || COMPARABLES.cafe;
    },

    /** Compare a user's config against benchmarks. Returns metric rows + financing estimate. */
    analyze(config = {}) {
        const bt = config.businessType || 'cafe';
        const bench = this.getBenchmark(bt);
        const mult = cityMultiplier(config.location);

        const sqft = Number(config.sqft) || 1000;
        const rent = Number(config.rent) || 0;
        const employees = Number(config.employees) || 0;
        const avgTicket = Number(config.avgTicket) || 0;

        const userRentPerSqft = sqft ? rent / sqft : 0;
        const benchRent = bench.rentPerSqft.map(v => Math.round(v * mult));

        const rows = [
            { metric: 'Rent (E£ / sq.ft / month)', user: Math.round(userRentPerSqft), ...position(userRentPerSqft, benchRent) },
            { metric: 'Headcount', user: employees, ...position(employees, bench.staff) },
            { metric: 'Average Ticket (E£)', user: avgTicket, ...position(avgTicket, bench.avgTicket) },
        ];

        // Financing estimate on startup capital (if available via summary), else equipment+rent proxy.
        const startup = Number(config.equipmentCost || 0) + Number(config.renovationBudget || 0) + rent * 3;
        const annualInterest = Math.round(startup * (SME_LOAN_RATES.typical / 100));

        return {
            verticalLabel: bench.label,
            cityMultiplier: mult,
            rows,
            startupEstimate: Math.round(startup),
            financing: {
                subsidized: Math.round(startup * (SME_LOAN_RATES.subsidized / 100)),
                typical: annualInterest,
                highRisk: Math.round(startup * (SME_LOAN_RATES.highRisk / 100)),
            },
            comparables: this.getComparables(bt),
        };
    },
};

export default BenchmarksEngine;
