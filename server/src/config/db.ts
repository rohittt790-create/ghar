import mongoose from 'mongoose';

export const DIRECT_ATLAS_URI =
  'mongodb://rohittt790_db_user:iCzWZI0dDUSjjDTR@ac-2uovvaj-shard-00-00.r2wn6ka.mongodb.net:27017,ac-2uovvaj-shard-00-01.r2wn6ka.mongodb.net:27017,ac-2uovvaj-shard-00-02.r2wn6ka.mongodb.net:27017/hometrack?ssl=true&replicaSet=atlas-2uovvaj-shard-0&authSource=admin&retryWrites=true&w=majority';

export const SRV_ATLAS_URI =
  'mongodb+srv://rohittt790_db_user:iCzWZI0dDUSjjDTR@cluster0.r2wn6ka.mongodb.net/hometrack?retryWrites=true&w=majority';

let connectionPromise: Promise<void> | null = null;
export let lastDbError: string | null = null;

export const connectDB = async (): Promise<void> => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    lastDbError = null;
    return;
  }

  // If already connecting, reuse existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const isVercel = Boolean(process.env.VERCEL);
    const timeoutMs = isVercel ? 2500 : 5000;
    const uri = process.env.MONGODB_URI || DIRECT_ATLAS_URI;

    try {
      console.log(`[Database] Connecting to MongoDB (timeout ${timeoutMs}ms)...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
        socketTimeoutMS: timeoutMs,
      });
      lastDbError = null;
      console.log(`[Database] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    } catch (err: any) {
      lastDbError = err?.message || String(err);
      console.error('[Database] Primary connection failed:', lastDbError);

      // If SRV failed or timed out, try direct shard URI immediately
      if (uri.startsWith('mongodb+srv://')) {
        try {
          console.log('[Database] Retrying with direct shard connection...');
          const connDirect = await mongoose.connect(DIRECT_ATLAS_URI, {
            serverSelectionTimeoutMS: timeoutMs,
            connectTimeoutMS: timeoutMs,
            socketTimeoutMS: timeoutMs,
          });
          lastDbError = null;
          console.log(`[Database] Direct shard connected to: ${connDirect.connection.host}`);
          return;
        } catch (err2: any) {
          lastDbError = err2?.message || String(err2);
          console.error('[Database] Direct connection also failed:', lastDbError);
        }
      }

      // Local MongoDB fallback when running locally
      if (!isVercel) {
        try {
          console.log('[Database] Trying local MongoDB instance...');
          const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/hometrack', {
            serverSelectionTimeoutMS: 2000,
          });
          lastDbError = null;
          console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}`);
          return;
        } catch (localErr: any) {
          console.warn('[Database] Local fallback unavailable:', localErr?.message);
        }
      }
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};
