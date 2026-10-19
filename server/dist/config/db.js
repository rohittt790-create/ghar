"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.lastDbError = exports.SRV_ATLAS_URI = exports.DIRECT_ATLAS_URI = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.DIRECT_ATLAS_URI = 'mongodb://rohittt790_db_user:iCzWZI0dDUSjjDTR@ac-2uovvaj-shard-00-00.r2wn6ka.mongodb.net:27017,ac-2uovvaj-shard-00-01.r2wn6ka.mongodb.net:27017,ac-2uovvaj-shard-00-02.r2wn6ka.mongodb.net:27017/hometrack?ssl=true&replicaSet=atlas-2uovvaj-shard-0&authSource=admin&retryWrites=true&w=majority';
exports.SRV_ATLAS_URI = 'mongodb+srv://rohittt790_db_user:iCzWZI0dDUSjjDTR@cluster0.r2wn6ka.mongodb.net/hometrack?retryWrites=true&w=majority';
let connectionPromise = null;
exports.lastDbError = null;
const connectDB = async () => {
    // If already connected, return immediately
    if (mongoose_1.default.connection.readyState === 1) {
        exports.lastDbError = null;
        return;
    }
    // If already connecting, reuse existing promise
    if (connectionPromise) {
        return connectionPromise;
    }
    connectionPromise = (async () => {
        const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
        const timeoutMs = isServerless ? 2500 : 5000;
        const uri = process.env.MONGODB_URI || exports.DIRECT_ATLAS_URI;
        try {
            console.log(`[Database] Connecting to MongoDB (timeout ${timeoutMs}ms)...`);
            const conn = await mongoose_1.default.connect(uri, {
                serverSelectionTimeoutMS: timeoutMs,
                connectTimeoutMS: timeoutMs,
                socketTimeoutMS: timeoutMs,
            });
            exports.lastDbError = null;
            console.log(`[Database] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
        }
        catch (err) {
            exports.lastDbError = err?.message || String(err);
            console.error('[Database] Primary connection failed:', exports.lastDbError);
            // If SRV failed or timed out, try direct shard URI immediately
            if (uri.startsWith('mongodb+srv://')) {
                try {
                    console.log('[Database] Retrying with direct shard connection...');
                    const connDirect = await mongoose_1.default.connect(exports.DIRECT_ATLAS_URI, {
                        serverSelectionTimeoutMS: timeoutMs,
                        connectTimeoutMS: timeoutMs,
                        socketTimeoutMS: timeoutMs,
                    });
                    exports.lastDbError = null;
                    console.log(`[Database] Direct shard connected to: ${connDirect.connection.host}`);
                    return;
                }
                catch (err2) {
                    exports.lastDbError = err2?.message || String(err2);
                    console.error('[Database] Direct connection also failed:', exports.lastDbError);
                }
            }
            // Local MongoDB fallback when running locally
            if (!isServerless) {
                try {
                    console.log('[Database] Trying local MongoDB instance...');
                    const localConn = await mongoose_1.default.connect('mongodb://127.0.0.1:27017/hometrack', {
                        serverSelectionTimeoutMS: 2000,
                    });
                    exports.lastDbError = null;
                    console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}`);
                    return;
                }
                catch (localErr) {
                    console.warn('[Database] Local fallback unavailable:', localErr?.message);
                }
            }
        }
        finally {
            connectionPromise = null;
        }
    })();
    return connectionPromise;
};
exports.connectDB = connectDB;
