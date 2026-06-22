/**
 * Seeds two PRE-VERIFIED test accounts so Katalon can log in without the OTP step.
 * Verified users (isVerified:true, status:'active') skip OTP on login (see authController.js).
 *
 * Run from the repo root:   node katalon-tests/seed-test-user.cjs
 * Requires the backend's MongoDB to be running (mongodb://127.0.0.1:27017).
 */
const path = require('path');
const mongoose = require(path.join(__dirname, '..', 'server', 'node_modules', 'mongoose'));
const bcrypt = require(path.join(__dirname, '..', 'server', 'node_modules', 'bcryptjs'));

const URI = 'mongodb://127.0.0.1:27017/business_digital_twin';

const USERS = [
    { email: 'qa.tester@bdt.local', name: 'QA Tester', password: 'QaTester#2026' },
    { email: 'qa.tester2@bdt.local', name: 'QA Tester Two', password: 'QaTester#2026' },
];

(async () => {
    await mongoose.connect(URI);
    const col = mongoose.connection.db.collection('users');

    const projectsCol = mongoose.connection.db.collection('projects');

    // A complete cafe config (matches BusinessBuilder output) so the dashboard,
    // KPIs, charts and marketplace render with a real active business.
    const cafeConfig = {
        businessType: 'cafe', businessName: 'QA Test Cafe', location: 'Cairo', country: 'US',
        sqft: 1200, rent: 3500, employees: 6, avgSalary: 3200, avgTicket: 8,
        dailyCustomers: 120, operatingDays: 26, equipmentCost: 45000,
        renovationBudget: 30000, marketingBudget: 5000, notes: ''
    };

    for (const u of USERS) {
        const hash = await bcrypt.hash(u.password, 12);
        await col.updateOne(
            { email: u.email },
            {
                $set: {
                    email: u.email, name: u.name, password: hash, role: 'user',
                    provider: 'local', isVerified: true, status: 'active',
                    loginAttempts: 0, updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true }
        );
        const user = await col.findOne({ email: u.email });

        // Give each user a clean single ready-to-open project (wipe strays for determinism)
        await projectsCol.deleteMany({ user: user._id });
        const proj = await projectsCol.insertOne({
            user: user._id,
            projectName: 'QA Test Cafe',
            businessName: cafeConfig.businessName,
            businessType: cafeConfig.businessType,
            location: cafeConfig.location,
            avgTicket: cafeConfig.avgTicket,
            config: cafeConfig,
            summary: {}, risks: {}, insights: [], scenarios: [], digitalTwin: {},
            createdAt: new Date(), updatedAt: new Date(), __v: 0,
        });
        // Set it active so "Continue Last Project" appears on login
        await col.updateOne({ _id: user._id }, { $set: { activeProjectId: proj.insertedId } });

        console.log(`✓ ${u.email}  password: ${u.password}  | active project: ${proj.insertedId}`);
    }

    await mongoose.disconnect();
    console.log('\nSeed complete. Accounts log in WITHOUT OTP and have a ready cafe project.');
})().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
