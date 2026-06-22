const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/User');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        await User.deleteMany({ email: 'test_debug@gmail.com' });

        const user = await User.create({
            email: 'test_debug@gmail.com',
            password: 'StrongPassword123!',
            status: 'active'
        });

        console.log('User created:', user.email);
        const token = user.getSignedJwtToken();
        console.log('Token created:', token);

        const isMatch = await user.matchPassword('StrongPassword123!');
        console.log('Password match:', isMatch);

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
