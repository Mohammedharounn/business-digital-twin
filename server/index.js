const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// DEBUG: Log every request
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url} received at ${new Date().toISOString()}`);
    next();
});

// 1. CORS (Must be first for browser pre-flight)
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
        // Allow requests with no origin (server-to-server, Postman, etc.)
        if (!origin) return callback(null, true);
        // Production: allow the deployed frontend(s) listed in CLIENT_ORIGIN
        // (comma-separated, e.g. "https://your-app.vercel.app")
        const allowed = [
            ...allowedOrigins,
            ...((process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)),
        ];
        if (allowed.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV === 'production') {
            // also allow any *.vercel.app preview/prod by default
            if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
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
            "connect-src": ["'self'", "http://localhost:5000", "http://localhost:3002", "https://accounts.google.com"],
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

/**
 * 2. ROUTES
 */
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/business', require('./routes/businessRoutes'));
app.use('/api/v1/public', require('./routes/publicRoutes'));
app.use('/api/v1/translate', require('./routes/translateRoutes'));
app.use('/api/v1/market', require('./routes/marketRoutes'));
app.use('/api/v1/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/v1/ai', require('./routes/aiRoutes'));
app.use('/api/v1/data', require('./routes/dataRoutes'));

/**
 * 3. ERROR HANDLING
 */

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(errorHandler);

/**
 * 4. START SERVER
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const cleanup = require('./cleanup');
        setInterval(cleanup, 24 * 60 * 60 * 1000);
        cleanup();

        const server = app.listen(PORT, () => {
            console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        // 5. WebSocket Initialization
        const { Server } = require('socket.io');
        const io = new Server(server, {
            cors: {
                origin: [
                    ...allowedOrigins,
                    ...((process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)),
                    /\.vercel\.app$/,
                ],
                methods: ["GET", "POST"]
            }
        });

        // Initialize Live Simulator
        const { startLiveSimulator } = require('./utils/liveSimulator');
        startLiveSimulator(io);

        io.on('connection', (socket) => {
            console.log(`[Socket] New client connected: ${socket.id}`);

            socket.on('join-business', (businessId) => {
                socket.join(businessId);
                console.log(`[Socket] Client ${socket.id} joined business room: ${businessId}`);
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] Client disconnected: ${socket.id}`);
            });
        });
    } catch (err) {
        console.error(`[Server] Failed to start: ${err.message}`);
        process.exit(1);
    }
};

startServer();

module.exports = app;

