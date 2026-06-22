// Vercel serverless entrypoint — handles every /api/* request by delegating to
// the Express app. Frontend (static Vite build) and this API share one domain.
const app = require('../server/app');
const connectDB = require('../server/config/db');

// Ensure we connect to MongoDB once per warm container, then reuse it.
let dbReady = null;

module.exports = async (req, res) => {
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
};
