const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/error');

// Load env vars (local dev reads server/.env; on Vercel the vars come from the
// project settings, so the missing file is harmless).
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// 1. CORS — harmless when frontend + API share an origin (Vercel single project),
// still needed if the API is ever called from a different host.
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3002'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [
            ...allowedOrigins,
            ...((process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)),
        ];
        if (allowed.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV === 'production') {
            try {
                if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
            } catch (e) { /* ignore malformed origin */ }
            return callback(new Error('Not allowed by CORS'));
        }
        return callback(null, true); // Allow all in dev
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security Headers (Configured for Google Sign-In)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "connect-src": ["'self'", "https://accounts.google.com"],
            "frame-src": ["'self'", "https://accounts.google.com"],
            "img-src": ["'self'", "data:", "https://*.googleusercontent.com"],
        },
    },
}));

// 3. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 4. Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 5. ROUTES
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/business', require('./routes/businessRoutes'));
app.use('/api/v1/public', require('./routes/publicRoutes'));
app.use('/api/v1/translate', require('./routes/translateRoutes'));
app.use('/api/v1/market', require('./routes/marketRoutes'));
app.use('/api/v1/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/v1/ai', require('./routes/aiRoutes'));
app.use('/api/v1/data', require('./routes/dataRoutes'));

// 6. ERROR HANDLING
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

app.use(errorHandler);

module.exports = app;
