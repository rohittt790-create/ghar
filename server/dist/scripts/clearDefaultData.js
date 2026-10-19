"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const db_js_1 = require("../config/db.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const clearDatabase = async () => {
    console.log('[Script] Connecting...');
    await (0, db_js_1.connectDB)();
    // Wait until connected
    let retries = 0;
    while (mongoose_1.default.connection.readyState !== 1 && retries < 20) {
        await new Promise((r) => setTimeout(r, 500));
        retries++;
    }
    if (mongoose_1.default.connection.readyState !== 1) {
        console.error('[Script] Could not establish connection.');
        process.exit(1);
    }
    console.log('[Script] Connected to:', mongoose_1.default.connection.name);
    const collections = ['owners', 'properties', 'tasks', 'reminders'];
    for (const col of collections) {
        try {
            const count = await mongoose_1.default.connection.collection(col).countDocuments();
            console.log(`[Script] Collection '${col}' has ${count} records.`);
            const result = await mongoose_1.default.connection.collection(col).deleteMany({});
            console.log(`[Script] Deleted ${result.deletedCount} records from '${col}'.`);
        }
        catch (e) {
            console.warn(`[Script] Collection '${col}' error or not found:`, e.message);
        }
    }
    // Remove demo seed users, preserving real user accounts (Rohit Kumar)
    await mongoose_1.default.connection.collection('users').deleteMany({
        email: { $in: ['admin@hometrack.com', 'elena@hometrack.com', 'marcus@hometrack.com'] },
    });
    // Check remaining users
    const users = await mongoose_1.default.connection.collection('users').find({}).toArray();
    console.log(`[Script] Preserved Real User Accounts (${users.length}):`);
    users.forEach((u) => console.log(` - ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));
    await mongoose_1.default.disconnect();
    console.log('[Script] Complete! Database is clean of all default records. Only registered user accounts remain.');
    process.exit(0);
};
clearDatabase().catch((e) => {
    console.error('[Script] Error:', e);
    process.exit(1);
});
