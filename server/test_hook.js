const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function runTest() {
    try {
        console.log('Starting In-Memory MongoDB...');
        const mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri);
        console.log('DB Connected.');

        const TestSchema = new mongoose.Schema({ name: String });

        // Test hook with async (no arguments)
        TestSchema.pre('save', async function () {
            console.log(' Hook trigger (async, no args)');
            console.log(' [DEBUG] this.name:', this.name);
            // No next() call here
        });

        const TestModel = mongoose.model('Test', TestSchema);

        console.log('Creating document...');
        await TestModel.create({ name: 'test_async' });
        console.log(' Document created successfully.');

        process.exit(0);
    } catch (err) {
        console.error(' [FATAL] Test failed:', err);
        process.exit(1);
    }
}

runTest();
