export const authLogger = {
  debug: (message: string, data?: any) => {
    console.log(`[Auth Debug] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    console.log(`[Auth Info] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[Auth Error] ${message}`, error || '');
  }
}; 