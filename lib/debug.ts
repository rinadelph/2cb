const DEBUG_STYLES = {
  auth: 'background: #4f46e5; color: white; padding: 2px 4px; border-radius: 2px;',
  error: 'background: #ef4444; color: white; padding: 2px 4px; border-radius: 2px;',
  success: 'background: #22c55e; color: white; padding: 2px 4px; border-radius: 2px;',
  info: 'background: #3b82f6; color: white; padding: 2px 4px; border-radius: 2px;',
  warning: 'background: #f59e0b; color: white; padding: 2px 4px; border-radius: 2px;',
};

export const logger = {
  auth: (message: string, data?: any) => {
    console.group(`%c Auth `, DEBUG_STYLES.auth, message);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
  error: (message: string, error?: any) => {
    console.group(`%c Error `, DEBUG_STYLES.error, message);
    if (error) {
      console.error('Details:', error);
      if (error.message) console.error('Message:', error.message);
      if (error.status) console.error('Status:', error.status);
    }
    console.groupEnd();
  },
  success: (message: string, data?: any) => {
    console.group(`%c Success `, DEBUG_STYLES.success, message);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
  info: (message: string, data?: any) => {
    console.group(`%c Info `, DEBUG_STYLES.info, message);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
  warning: (message: string, data?: any) => {
    console.group(`%c Warning `, DEBUG_STYLES.warning, message);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
};
