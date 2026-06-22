/**
 * eBay Browse API service
 * - Client-credentials OAuth (auto-refreshes before expiry)
 * - In-memory search cache with TTL (5 min)
 * - Full error taxonomy
 */

const https = require('https');
const querystring = require('querystring');

// ─── Token cache ───────────────────────────────────────────────────────────────
let _token = null;      // { access_token, expires_at }

async function getAccessToken() {
    if (_token && Date.now() < _token.expires_at - 30_000) {
        return _token.access_token;
    }

    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set in server/.env');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope';

    const data = await httpPost(
        'api.ebay.com',
        '/identity/v1/oauth2/token',
        {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body
    );

    _token = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000,
    };

    console.log('[eBay] Access token refreshed, expires in', data.expires_in, 's');
    return _token.access_token;
}

// ─── Search cache ──────────────────────────────────────────────────────────────
const _cache = new Map(); // key → { data, expires_at }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(q, limit, offset) {
    return `${q.toLowerCase().trim()}|${limit}|${offset}`;
}

function fromCache(key) {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires_at) { _cache.delete(key); return null; }
    return entry.data;
}

function toCache(key, data) {
    // Keep cache from growing unbounded
    if (_cache.size > 200) {
        const oldest = _cache.keys().next().value;
        _cache.delete(oldest);
    }
    _cache.set(key, { data, expires_at: Date.now() + CACHE_TTL });
}

// ─── Search ────────────────────────────────────────────────────────────────────
async function searchProducts(query, limit = 20, offset = 0) {
    const key = cacheKey(query, limit, offset);
    const cached = fromCache(key);
    if (cached) {
        console.log('[eBay] Cache hit:', key);
        return cached;
    }

    const token = await getAccessToken();

    const params = querystring.stringify({
        q: query,
        limit: Math.min(limit, 50),
        offset,
        fieldgroups: 'EXTENDED',
    });

    const raw = await httpGet(
        'api.ebay.com',
        `/buy/browse/v1/item_summary/search?${params}`,
        {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            'Content-Type': 'application/json',
        }
    );

    const result = normalizeResults(raw);
    toCache(key, result);
    return result;
}

// ─── Normalize ─────────────────────────────────────────────────────────────────
function normalizeResults(raw) {
    const items = (raw.itemSummaries || []).map(item => ({
        id: item.itemId,
        title: item.title || 'No title',
        image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
        price: parseFloat(item.price?.value || 0),
        currency: item.price?.currency || 'USD',
        condition: item.condition || 'Unknown',
        conditionId: item.conditionId || null,
        seller: {
            username: item.seller?.username || 'Unknown',
            feedbackScore: item.seller?.feedbackScore || 0,
            feedbackPercentage: item.seller?.feedbackPercentage || '0',
        },
        shipping: {
            type: item.shippingOptions?.[0]?.shippingCostType || 'Unknown',
            cost: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || 0),
            currency: item.shippingOptions?.[0]?.shippingCost?.currency || 'USD',
        },
        url: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
        category: item.categories?.[0]?.categoryName || item.primaryItemGroup?.itemGroupType || 'General',
        location: item.itemLocation?.country || null,
        listingType: item.buyingOptions?.[0] || 'FIXED_PRICE',
    }));

    return {
        total: raw.total || 0,
        items,
        limit: raw.limit || 20,
        offset: raw.offset || 0,
    };
}

// ─── Tiny HTTP helpers (no extra deps) ─────────────────────────────────────────
function httpGet(hostname, path, headers) {
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname, path, method: 'GET', headers }, res => {
            let body = '';
            res.on('data', d => (body += d));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode === 429) return reject(Object.assign(new Error('eBay rate limit exceeded'), { code: 'RATE_LIMIT', status: 429 }));
                    if (res.statusCode === 401) { _token = null; return reject(Object.assign(new Error('eBay token invalid'), { code: 'INVALID_TOKEN', status: 401 })); }
                    if (res.statusCode >= 400) return reject(Object.assign(new Error(parsed.errors?.[0]?.message || `eBay API error ${res.statusCode}`), { code: 'API_ERROR', status: res.statusCode, details: parsed }));
                    resolve(parsed);
                } catch (e) {
                    reject(Object.assign(new Error('Failed to parse eBay response'), { code: 'PARSE_ERROR' }));
                }
            });
        });
        req.on('error', e => reject(Object.assign(e, { code: 'NETWORK_ERROR' })));
        req.end();
    });
}

function httpPost(hostname, path, headers, body) {
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname, path, method: 'POST', headers, }, res => {
            let data = '';
            res.on('data', d => (data += d));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 400) return reject(Object.assign(new Error(parsed.error_description || `OAuth error ${res.statusCode}`), { code: 'AUTH_ERROR', status: res.statusCode }));
                    resolve(parsed);
                } catch (e) {
                    reject(Object.assign(new Error('Failed to parse OAuth response'), { code: 'PARSE_ERROR' }));
                }
            });
        });
        req.on('error', e => reject(Object.assign(e, { code: 'NETWORK_ERROR' })));
        req.write(body);
        req.end();
    });
}

module.exports = { searchProducts, getAccessToken };
