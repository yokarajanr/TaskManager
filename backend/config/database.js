import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-bolt';

// MongoDB connection options - Enhanced for stability
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 10000, // Keep trying for 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Retry writes on failure
  retryReads: true, // Retry reads on failure
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
  compressors: 'zlib' // Use compression for better performance
};

// Connect to MongoDB with retry logic
export const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    console.log(`🔄 Attempting MongoDB connection... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('=' .repeat(50));
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`🌐 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Connecting'}`);
    console.log('=' .repeat(50));
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });
    
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB connection failed (Attempt ${retryCount + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`� Retrying connection in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectDB(retryCount + 1);
    } else {
      console.error('❌ All MongoDB connection attempts failed');
      console.log('💡 Please check:');
      console.log('   1. Your internet connection');
      console.log('   2. MongoDB Atlas cluster is running');
      console.log('   3. Database credentials are correct');
      console.log('   4. IP address is whitelisted in MongoDB Atlas');
      throw error;
    }
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});

// Get database connection status
export const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

// Test database connection
export const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { success: true, message: 'Database connection is healthy' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default connectDB;
