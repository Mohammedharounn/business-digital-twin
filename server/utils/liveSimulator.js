/**
 * Live Simulator for Digital Twin
 * Simulates real-time "Physical" business data streams (Stripe/POS/Sensors)
 */

function startLiveSimulator(io) {
    console.log('[Simulator] Live data pipeline initialized');

    // Emit a "Physical Pulse" every 10 seconds
    setInterval(() => {
        const pulse = {
            timestamp: new Date().toISOString(),
            type: 'PHYSICAL_SYNC',
            data: {
                currentFootTraffic: Math.floor(Math.random() * 10) + 1,
                liveSales: (Math.random() * 50 + 5).toFixed(2),
                sensorStatus: 'OPTIMAL',
                variance: (Math.random() * 0.1 - 0.05).toFixed(3) // -5% to +5% jitter
            }
        };

        // Broadcast to all connected clients
        // In a real app, we would only broadcast to users connected to a specific business ID
        io.emit('live-update', pulse);
    }, 10000);
}

module.exports = { startLiveSimulator };
