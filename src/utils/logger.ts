export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<LogLevel, string> = {
  debug: '#6b7280',
  info: '#22d3a5',
  warn: '#fbbf24',
  error: '#f87171',
};

export class Logger {
  constructor(private readonly namespace: string) {}

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    const color = COLORS[level];
    const prefix = `%c[openclaw:${this.namespace}]`;
    const style = `color: ${color}; font-weight: bold;`;

    if (level === 'error') {
      console.error(prefix, style, message, ...args);
    } else if (level === 'warn') {
      console.warn(prefix, style, message, ...args);
    } else {
      console.log(prefix, style, message, ...args);
    }
  }
}
