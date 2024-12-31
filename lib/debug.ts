type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: unknown;
}

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: LogData;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: LogData | unknown): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
    };
  }

  private sanitizeData(data: unknown): LogData | undefined {
    if (!data) return undefined;

    // Deep clone the data to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken'];
    const sanitizeObject = (obj: Record<string, unknown>): void => {
      if (typeof obj !== 'object' || obj === null) return;

      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key] as Record<string, unknown>);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private log(level: LogLevel, message: string, data?: LogData | unknown): void {
    const logMessage = this.formatMessage(level, message, data);

    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                          level === 'warn' ? 'warn' : 
                          level === 'debug' ? 'debug' : 'log';

      console[consoleMethod](
        `[${logMessage.timestamp}] [${level.toUpperCase()}] ${message}`,
        data ? logMessage.data : ''
      );
    }

    // In production, you might want to send logs to a service
    if (!this.isDevelopment) {
      // TODO: Implement production logging service
      // e.g., send to Sentry, LogRocket, etc.
    }
  }

  info(message: string, data?: LogData | unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData | unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: LogData | unknown): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(data && typeof data === 'object' ? data : {})
    } : data;

    this.log('error', message, errorData);
  }

  debug(message: string, data?: LogData | unknown): void {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  // Auth specific logging methods
  authAttempt(email: string): void {
    this.info('Authentication attempt', { email, timestamp: new Date().toISOString() });
  }

  authSuccess(userId: string, email: string): void {
    this.info('Authentication successful', {
      userId,
      email,
      timestamp: new Date().toISOString()
    });
  }

  authFailure(email: string, reason: string): void {
    this.warn('Authentication failed', {
      email,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  sessionActivity(userId: string, action: string): void {
    this.info('Session activity', {
      userId,
      action,
      timestamp: new Date().toISOString()
    });
  }
}

export const logger = new Logger();
