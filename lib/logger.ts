// Simple logging utility for the app
export const logger = {
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, you might want to send this to a logging service
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  }
}; 