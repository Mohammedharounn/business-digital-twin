// Local development / traditional server entrypoint.
// (On Vercel the app is served by api/[...path].js instead — see that file.)
const app = require('./app');
const connectDB = require('./config/db');

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

        // WebSocket (real-time live simulator) — only runs on a persistent server.
        const { Server } = require('socket.io');
        const io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'http://localhost:3002',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:3002',
                    ...((process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)),
                    /\.vercel\.app$/,
                ],
                methods: ["GET", "POST"]
            }
        });

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
