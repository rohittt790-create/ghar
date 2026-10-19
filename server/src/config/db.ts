import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hometrack';

  // If using mongodb+srv, ensure public DNS resolvers (8.8.8.8 / 1.1.1.1) are configured to resolve SRV records
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('[Database] Configured Google/Cloudflare DNS for MongoDB Atlas SRV resolution.');
    } catch (e) {
      console.warn('[Database] Could not set custom DNS servers:', e);
    }
  }

  try {
    console.log('[Database] Attempting connection to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.error('[Database] MongoDB Connection Error:', error?.message || error);

    // If Atlas connection failed due to IP whitelist or network issue and not on Vercel
    if (uri.startsWith('mongodb+srv://') && !process.env.VERCEL) {
      console.warn('\n[Database] ⚠️ MongoDB Atlas Connection Notice:');
      console.warn('If this is an IP Whitelist error, please ensure your IP (or 0.0.0.0/0) is added to MongoDB Atlas -> Network Access.');
      console.warn('Falling back to local MongoDB instance (mongodb://127.0.0.1:27017/hometrack) to keep the app functional...\n');

      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/hometrack', {
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log(`[Database] Fallback Connected to local MongoDB: ${localConn.connection.host}/${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error('[Database] Local fallback also failed:', localErr);
      }
    }

    if (!process.env.VERCEL) {
      console.log('[Database] Retrying connection in 10 seconds...');
      setTimeout(connectDB, 10000);
    }
  }
};
