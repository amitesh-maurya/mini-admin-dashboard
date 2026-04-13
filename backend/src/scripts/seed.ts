import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';

const MONGODB_URI = process.env.MONGODB_URI as string;

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const userPassword = await bcrypt.hash('User@1234', 12);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      },
      { name: 'Alice Johnson', email: 'alice@example.com', password: userPassword, role: 'user', isActive: true },
      { name: 'Bob Smith', email: 'bob@example.com', password: userPassword, role: 'user', isActive: true },
      { name: 'Carol White', email: 'carol@example.com', password: userPassword, role: 'user', isActive: false },
      { name: 'David Brown', email: 'david@example.com', password: userPassword, role: 'user', isActive: true },
      { name: 'Eva Martinez', email: 'eva@example.com', password: userPassword, role: 'user', isActive: true },
    ];

    // insertMany with pre-hashed passwords (bypasses pre-save hook intentionally)
    const insertedUsers = await User.insertMany(users);
    const adminUser = insertedUsers[0];
    const regularUsers = insertedUsers.slice(1);

    console.log('🌱 Seeded users:');
    console.log('   Admin → admin@example.com / Admin@1234');
    console.log('   Users → *@example.com / User@1234');

    // Clear existing projects and seed new ones
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing projects');

    const projects = [
      {
        title: 'Admin Dashboard Redesign',
        description: 'Redesign the admin panel with improved UX, new charts, and mobile responsiveness.',
        assignedTo: [regularUsers[0]._id, regularUsers[1]._id],
        status: 'in-progress',
        createdBy: adminUser._id,
      },
      {
        title: 'API Rate Limiting Implementation',
        description: 'Add production-grade rate limiting to all public API endpoints to prevent abuse.',
        assignedTo: [regularUsers[1]._id],
        status: 'completed',
        createdBy: adminUser._id,
      },
      {
        title: 'User Authentication Flow Upgrade',
        description: 'Migrate from single-token to dual-token auth with refresh token rotation and revocation.',
        assignedTo: [regularUsers[2]._id, regularUsers[3]._id],
        status: 'completed',
        createdBy: adminUser._id,
      },
      {
        title: 'Mobile App MVP',
        description: 'Build the first version of the React Native mobile app with core features.',
        assignedTo: [regularUsers[3]._id, regularUsers[4]._id],
        status: 'pending',
        createdBy: adminUser._id,
      },
      {
        title: 'Database Performance Optimization',
        description: 'Audit MongoDB indexes, add missing indexes, and optimize slow queries across the platform.',
        assignedTo: [regularUsers[0]._id],
        status: 'on-hold',
        createdBy: adminUser._id,
      },
    ];

    await Project.insertMany(projects);

    console.log('🌱 Seeded 5 projects');
    console.log('✅ Seed complete');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
