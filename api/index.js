// Vercel serverless entrypoint (ESM — matches root package.json "type": "module").
// vercel.json rewrites all /api/* to this single function; Express reads the
// original URL (e.g. /api/v1/auth/login) and routes accordingly. Frontend (static
// Vite build) and this API share one domain, so auth cookies work natively.
import app from '../server/app.js';
import connectDB from '../server/config/db.js';

// Connect to MongoDB once per warm container, then reuse it.
let dbReady = null;

export default async function handler(req, res) {
    try {
        if (!dbReady) dbReady = connectDB();
        await dbReady;
    } catch (err) {
        dbReady = null; // allow a retry on the next request
        console.error('[api] DB connection failed:', err.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Database connection failed' }));
        return;
    }
    return app(req, res);
}
