"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load the .env file from the backend root
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const Admin_1 = require("../models/Admin");
const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const email = 'admin@akshayaakademics.com';
        const existingAdmin = await Admin_1.Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            console.log('Admin already exists. Deleting and recreating...');
            await Admin_1.Admin.deleteOne({ email: email.toLowerCase() });
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const passwordHash = await bcryptjs_1.default.hash('Admin@2024!', salt);
        const newAdmin = new Admin_1.Admin({
            name: 'Akshaya Admin',
            email: email.toLowerCase(),
            passwordHash: passwordHash,
            role: 'admin'
        });
        await newAdmin.save();
        console.log('Admin user seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};
seedAdmin();
