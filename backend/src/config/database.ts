import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bec-vortex-events';

  // Check for placeholder password in the URI
  if (uri.includes('<YOUR_PASSWORD_HERE>') || uri.includes('YOUR_PASSWORD_HERE')) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ❌ MongoDB Connection Failed — Password Not Set!           ║
║                                                              ║
║  Your MONGODB_URI in backend/.env still contains the         ║
║  placeholder <YOUR_PASSWORD_HERE>.                           ║
║                                                              ║
║  Replace it with your actual MongoDB Atlas password.         ║
╚══════════════════════════════════════════════════════════════╝
    `);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('⚠️  Server will continue without database in development mode.\n');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message || error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('⚠️  Server will continue without database in development mode.\n');
  }
};

export default connectDB;
