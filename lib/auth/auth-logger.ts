interface LogData {
  [key: string]: unknown;
}

export const authLogger = {
  debug: (message: string, data?: LogData | unknown) => {
    console.log(`[Auth Debug] ${message}`, data || '');
  },
  info: (message: string, data?: LogData | unknown) => {
    console.log(`[Auth Info] ${message}`, data || '');
  },
  error: (message: string, error?: Error | unknown) => {
    console.error(`[Auth Error] ${message}`, error || '');
  }
}; 