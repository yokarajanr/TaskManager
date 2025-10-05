// Environment debugging utility
export const debugInfo = {
  env: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export const logEnvironment = () => {
  console.log('🔧 Environment Info:', debugInfo);
  console.log('🌐 Current URL:', window.location.href);
  console.log('📍 Current Path:', window.location.pathname);
};

export const logError = (context: string, error: any) => {
  console.error(`❌ [${context}]`, error);
  
  if (debugInfo.isDev) {
    console.error('Full error details:', error);
  }
};

// Call this on app initialization
if (debugInfo.isDev || localStorage.getItem('debug') === 'true') {
  logEnvironment();
}