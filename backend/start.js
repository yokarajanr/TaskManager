#!/usr/bin/env node

/**
 * TaskMaster Pro Backend Startup Script
 * Enhanced error handling and process management
 */

import cluster from 'cluster';
import os from 'os';

// For development, don't use clustering
if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
  const numWorkers = Math.min(os.cpus().length, 4); // Limit to 4 workers max
  
  console.log('🚀 Starting TaskMaster Pro Backend in Production Mode');
  console.log(`👥 Master process ${process.pid} is running with ${numWorkers} workers`);
  
  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  // Handle worker events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });
  
} else {
  // Worker process or development mode
  import('./server.js').catch(error => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});