const https = require('https');

// Simple in-memory cache: key = `${target}|${text}` -> translated string
const cache = new Map();

function gtxTranslate(text, target) {
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
        const req = https.get(url, { timeout: 8000 }, (r) => {
            let data = '';
            r.on('data', (c) => (data += c));
            r.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const out = (json[0] || []).map((seg) => seg[0]).join('');
                    resolve(out || text);
                } catch {
                    resolve(text); // fall back to original on parse error
                }
            });
        });
        req.on('error', () => resolve(text));
        req.on('timeout', () => { req.destroy(); resolve(text); });
    });
}

// Run promises with limited concurrency
async function pool(items, limit, worker) {
    const results = new Array(items.length);
    let i = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) {
            const idx = i++;
            results[idx] = await worker(items[idx], idx);
        }
    });
    await Promise.all(runners);
    return results;
}

// @desc   Batch translate strings   @route POST /api/v1/translate  { texts:[], target:'ar' }
// @access Public (no sensitive data)
exports.translateBatch = async (req, res) => {
    try {
        const target = (req.body?.target || 'ar').slice(0, 5);
        const texts = Array.isArray(req.body?.texts) ? req.body.texts.slice(0, 600) : [];
        if (!texts.length) return res.status(200).json({ success: true, translations: [] });

        // Resolve unique strings only (dedupe), using cache.
        const unique = [...new Set(texts)];
        const missing = unique.filter((t) => !cache.has(`${target}|${t}`));

        await pool(missing, 12, async (t) => {
            const tr = await gtxTranslate(t, target);
            cache.set(`${target}|${t}`, tr);
            return tr;
        });

        const translations = texts.map((t) => cache.get(`${target}|${t}`) ?? t);
        res.status(200).json({ success: true, translations });
    } catch (err) {
        res.status(200).json({ success: true, translations: req.body?.texts || [] }); // never break the UI
    }
};
