const mongoose = require('mongoose');

// Cache the connection across serverless invocations so we don't reconnect
// (and exhaust Atlas connections) on every request.
let cached = null;

const connectDB = async () => {
    if (cached && mongoose.connection.readyState === 1) {
        return cached;
    }

    let uri = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === 'development' && process.env.USE_REAL_MONGO !== 'true') {
        console.log('Starting In-Memory MongoDB...');
        // Lazy-require so this dev-only dependency is never needed in production.
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongo = await MongoMemoryServer.create();
        uri = mongo.getUri();
    }

    cached = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${cached.connection.host}`);
    return cached;
};

module.exports = connectDB;
