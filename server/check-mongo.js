const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkMongo = async () => {
    try {
        console.log('--- MongoDB Diagnostic ---');
        console.log('URI from .env:', process.env.MONGODB_URI);
        console.log('USE_REAL_MONGO:', process.env.USE_REAL_MONGO);
        console.log('NODE_ENV:', process.env.NODE_ENV);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Existing collections:', collections.map(c => c.name));

        if (collections.some(c => c.name === 'users')) {
            const count = await mongoose.connection.db.collection('users').countDocuments();
            console.log('User count:', count);
        } else {
            console.log('No "users" collection found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during diagnostic:', err.message);
        process.exit(1);
    }
};

checkMongo();
