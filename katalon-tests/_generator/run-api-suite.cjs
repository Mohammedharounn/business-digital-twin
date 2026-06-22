/**
 * Executes the logic of Katalon suite TS_API (TC15-TC18) against the live backend.
 * Pure Node (no Katalon license needed) — same assertions the Katalon API cases make.
 * Run: node katalon-tests/_generator/run-api-suite.cjs
 */
const http = require('http');
const API = { host: 'localhost', port: 5000, base: '/api/v1' };
const CREDS = { email: 'qa.tester@bdt.local', password: 'QaTester#2026' };
const CREDS2 = { email: 'qa.tester2@bdt.local', password: 'QaTester#2026' };

function req(method, path, { token, body } = {}) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = 'Bearer ' + token;
        if (data) headers['Content-Length'] = Buffer.byteLength(data);
        const r = http.request({ host: API.host, port: API.port, path: API.base + path, method, headers }, res => {
            let b = ''; res.on('data', d => b += d);
            res.on('end', () => { let j; try { j = JSON.parse(b); } catch { j = b; } resolve({ status: res.statusCode, json: j }); });
        });
        r.on('error', reject);
        if (data) r.write(data);
        r.end();
    });
}

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { if (cond) { pass++; console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`); } else { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`); } };

(async () => {
    console.log('\n══════ TS_API (executed via Node against live backend) ══════\n');

    // ── TC15: Login returns token ──
    console.log('TC15_API_Login_Returns_Token');
    const login = await req('POST', '/auth/login', { body: CREDS });
    ok('POST /auth/login → 200', login.status === 200, 'status ' + login.status);
    ok('accessToken issued (no OTP for verified user)', !!login.json.accessToken && !login.json.requiresOTP);
    const token = login.json.accessToken;

    // ── TC16: Business list persistence ──
    console.log('\nTC16_API_Business_List_Persistence');
    const biz = await req('GET', '/business', { token });
    ok('GET /business → 200', biz.status === 200);
    ok('success === true', biz.json.success === true);
    ok('data is an array', Array.isArray(biz.json.data), biz.json.data?.length + ' project(s)');

    // ── TC17: eBay search field validation ──
    console.log('\nTC17_API_Ebay_Search_Validation');
    const required = ['id', 'title', 'price', 'currency', 'condition', 'seller', 'shipping', 'url', 'category'];
    for (const q of ['Coffee Machine', 'Gaming Chair', 'Treadmill', 'Hair Dryer', 'Printer']) {
        const r = await req('GET', '/marketplace/search?q=' + encodeURIComponent(q) + '&limit=10', { token });
        const items = r.json.items || [];
        let fieldsOk = true;
        if (items.length) { for (const f of required) if (!(f in items[0])) fieldsOk = false; }
        ok(`search "${q}" → 200 + fields`, r.status === 200 && r.json.success === true && fieldsOk, `total=${r.json.total}, returned=${items.length}`);
    }

    // ── TC18: Multi-user isolation ──
    console.log('\nTC18_API_MultiUser_Isolation');
    const login2 = await req('POST', '/auth/login', { body: CREDS2 });
    const token2 = login2.json.accessToken;
    ok('second user logs in', !!token2);
    const b1 = await req('GET', '/business', { token });
    const b2 = await req('GET', '/business', { token2: undefined, token: token2 });
    const ids1 = new Set((b1.json.data || []).map(p => p._id));
    const ids2 = new Set((b2.json.data || []).map(p => p._id));
    const overlap = [...ids1].filter(x => ids2.has(x));
    ok('no shared project ids between users', overlap.length === 0, `user1=${ids1.size}, user2=${ids2.size}, overlap=${overlap.length}`);

    console.log(`\n══════ RESULT: ${pass} passed, ${fail} failed ══════\n`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('RUNNER ERROR:', e.message); process.exit(1); });
