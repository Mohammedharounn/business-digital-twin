const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        if (process.env.NODE_ENV === 'development' && process.env.USE_REAL_MONGO !== 'true') {
            console.log('Starting In-Memory MongoDB...');
            const mongo = await MongoMemoryServer.create();
            uri = mongo.getUri();
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
