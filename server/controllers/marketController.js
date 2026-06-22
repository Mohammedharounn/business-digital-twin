const https = require('https');

const UA = 'BusinessDigitalTwin/1.0 (graduation project)';
const cache = new Map(); // key -> { exp, data }

function httpGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': UA, ...headers }, timeout: 15000 }, (r) => {
            let d = '';
            r.on('data', (c) => (d += c));
            r.on('end', () => resolve({ status: r.statusCode, body: d }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function getCached(key, ttlMs) {
    const c = cache.get(key);
    if (c && Date.now() < c.exp) return c.data;
    return null;
}
function setCached(key, data, ttlMs) { cache.set(key, { exp: Date.now() + ttlMs, data }); }

// @desc  Live USD→EGP exchange rate   @route GET /api/v1/market/fx
exports.getFx = async (req, res) => {
    try {
        const cached = getCached('fx', 6 * 3600e3);
        if (cached) return res.json({ success: true, ...cached, cached: true });
        const r = await httpGet('https://open.er-api.com/v6/latest/USD');
        const j = JSON.parse(r.body);
        const rate = j?.rates?.EGP;
        if (!rate) throw new Error('no rate');
        const data = { rate: Math.round(rate * 100) / 100, base: 'USD', symbol: 'EGP', date: j.time_last_update_utc || null, source: 'exchangerate-api' };
        setCached('fx', data, 6 * 3600e3);
        res.json({ success: true, ...data });
    } catch {
        res.json({ success: true, rate: 50, base: 'USD', symbol: 'EGP', source: 'fallback', date: null });
    }
};

// @desc  Live Egypt lending interest rate (World Bank)   @route GET /api/v1/market/loan-rate
exports.getLoanRate = async (req, res) => {
    try {
        const cached = getCached('loan', 24 * 3600e3);
        if (cached) return res.json({ success: true, ...cached, cached: true });
        const r = await httpGet('https://api.worldbank.org/v2/country/EGY/indicator/FR.INR.LEND?format=json&per_page=60');
        const j = JSON.parse(r.body);
        const row = (j[1] || []).find((x) => x.value != null);
        if (!row) throw new Error('no data');
        const data = { rate: Math.round(row.value * 100) / 100, year: row.date, source: 'World Bank · Egypt lending interest rate' };
        setCached('loan', data, 24 * 3600e3);
        res.json({ success: true, ...data });
    } catch {
        res.json({ success: true, rate: 15, year: null, source: 'fallback estimate' });
    }
};

// Map business vertical → OpenStreetMap filter
const OSM_FILTER = {
    cafe: '["amenity"="cafe"]',
    restaurant: '["amenity"="restaurant"]',
    gym: '["leisure"="fitness_centre"]',
    retail: '["shop"]',
    salon: '["shop"="hairdresser"]',
    bakery: '["shop"="bakery"]',
    coworking: '["amenity"="coworking_space"]',
    laundry: '["shop"="laundry"]',
};

// @desc  Count real nearby competitors (OpenStreetMap)   @route GET /api/v1/market/competitors?location=&type=&radius=
exports.getCompetitors = async (req, res) => {
    try {
        const location = (req.query.location || '').trim();
        const type = (req.query.type || 'cafe').trim();
        const radiusKm = Math.min(Math.max(parseFloat(req.query.radius) || 2, 0.5), 10);
        if (!location) return res.status(400).json({ success: false, error: 'location is required' });

        const key = `comp|${location}|${type}|${radiusKm}`;
        const cached = getCached(key, 12 * 3600e3);
        if (cached) return res.json({ success: true, ...cached, cached: true });

        // 1) geocode
        const geo = await httpGet(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', Egypt')}&format=json&limit=1`);
        const g = JSON.parse(geo.body);
        if (!g?.length) throw new Error('location not found');
        const { lat, lon, display_name } = g[0];

        // 2) overpass count
        const filter = OSM_FILTER[type] || OSM_FILTER.cafe;
        const around = `around:${Math.round(radiusKm * 1000)},${lat},${lon}`;
        const q = `[out:json][timeout:25];(node${filter}(${around});way${filter}(${around}););out count;`;
        const ov = await httpGet('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q));
        const oj = JSON.parse(ov.body);
        const count = parseInt(oj?.elements?.[0]?.tags?.total ?? 0, 10);

        const data = { count, type, radiusKm, area: display_name, lat: +lat, lon: +lon, source: 'OpenStreetMap' };
        setCached(key, data, 12 * 3600e3);
        res.json({ success: true, ...data });
    } catch (err) {
        res.json({ success: false, error: 'Could not fetch live competitor data: ' + err.message });
    }
};
