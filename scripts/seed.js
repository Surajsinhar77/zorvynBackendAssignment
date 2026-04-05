/**
 * Seed script — creates an initial admin user and sample transactions.
 * Run: npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Transaction from '../src/models/transaction.model.js';

const ADMIN = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
};

const SAMPLE_USERS = [
  { name: 'Alice Analyst', email: 'analyst@example.com', password: 'analyst123', role: 'analyst' },
  { name: 'Victor Viewer', email: 'viewer@example.com', password: 'viewer123', role: 'viewer' },
];

const SAMPLE_TRANSACTIONS = [
  { amount: 5000, type: 'income', category: 'salary', date: new Date('2024-01-15'), notes: 'January salary' },
  { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-01-01'), notes: 'Monthly rent' },
  { amount: 300, type: 'expense', category: 'groceries', date: new Date('2024-01-10'), notes: 'Weekly groceries' },
  { amount: 800, type: 'income', category: 'freelance', date: new Date('2024-01-20'), notes: 'Logo design project' },
  { amount: 150, type: 'expense', category: 'utilities', date: new Date('2024-01-05'), notes: 'Electricity bill' },
  { amount: 5000, type: 'income', category: 'salary', date: new Date('2024-02-15'), notes: 'February salary' },
  { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-02-01'), notes: 'Monthly rent' },
  { amount: 250, type: 'expense', category: 'entertainment', date: new Date('2024-02-14'), notes: 'Valentine dinner' },
  { amount: 1500, type: 'income', category: 'investment', date: new Date('2024-03-01'), notes: 'Stock dividends' },
  { amount: 400, type: 'expense', category: 'healthcare', date: new Date('2024-03-10'), notes: 'Doctor visit' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create(ADMIN);
    console.log(`Admin created: ${admin.email}`);

    // Create sample users
    for (const u of SAMPLE_USERS) {
      await User.create(u);
      console.log(`User created: ${u.email} (${u.role})`);
    }

    // Create sample transactions with admin as creator
    for (const t of SAMPLE_TRANSACTIONS) {
      await Transaction.create({ ...t, createdBy: admin._id });
    }
    console.log(`${SAMPLE_TRANSACTIONS.length} sample transactions created`);

    console.log('\n--- Seed complete ---');
    console.log('Admin login -> email: admin@example.com | password: admin123');
    console.log('Analyst login -> email: analyst@example.com | password: analyst123');
    console.log('Viewer login -> email: viewer@example.com | password: viewer123');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
