/**
 * Structured Logger
 *
 * 구조화된 로깅 시스템
 * console.log/console.error를 대체하는 타입 안전한 로거
 *
 * @module lib/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

// 로그 레벨 설정
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 현재 환경의 최소 로그 레벨
const MIN_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// 로그 레벨 확인
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * 구조화된 로거 생성
 */
export class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  /**
   * 컨텍스트 추가된 새로운 Logger 생성
   */
  withContext(additionalContext: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * 디버그 로그
   */
  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, args);
  }

  /**
   * 정보 로그
   */
  info(message: string, ...args: unknown[]): void {
    this.log('info', message, args);
  }

  /**
   * 경고 로그
   */
  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, args);
  }

  /**
   * 에러 로그
   */
  error(message: string, ...args: unknown[]): void {
    this.log('error', message, args);
  }

  /**
   * 로그 출력
   */
  private log(level: LogLevel, message: string, args: unknown[]): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...this.context,
        ...(args.length > 0 && { args }),
      },
    };

    // 프로덕션 환경에서는 JSON으로 출력
    if (process.env.NODE_ENV === 'production') {
      this.outputStructured(entry);
    } else {
      this.outputFormatted(entry);
    }
  }

  /**
   * 포맷된 로그 출력 (개발용)
   */
  private outputFormatted(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const contextStr = Object.keys(entry.context).length > 0
      ? ` ${JSON.stringify(entry.context)}`
      : '';

    const consoleMethod = this.getConsoleMethod(entry.level);
    consoleMethod(prefix, entry.message, contextStr);
  }

  /**
   * 구조화된 로그 출력 (프로덕션용)
   */
  private outputStructured(entry: LogEntry): void {
    // 프로덕션에서는 서비스로 전송하거나 파일에 저장
    // 여기서는 console.error만 사용 (에러만 서버로 전송)
    if (entry.level === 'error') {
      console.error(JSON.stringify(entry));
    }
  }

  /**
   * 콘솔 메서드 가져오기
   */
  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
      case 'info':
        return console.log;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }
}

// =====================================================
// 컨텍스트별 로거 생성
// =====================================================

export const loggers = {
  // API 라우트용 로거
  api: (endpoint?: string) =>
    new Logger({ component: 'api', endpoint }),

  // 데이터베이스 로거
  db: (table?: string) =>
    new Logger({ component: 'database', table }),

  // 인증 로거
  auth: () =>
    new Logger({ component: 'auth' }),

  // UI 로거
  ui: (component?: string) =>
    new Logger({ component: 'ui', context: component }),

  // 일반 로거
  app: () =>
    new Logger({ component: 'app' }),
};

// =====================================================
// 편의 함수들
// =====================================================

/**
 * API 로그
 */
export const logApi = (endpoint: string, message: string, level: LogLevel = 'info') => {
  loggers.api(endpoint)[level](message);
};

/**
 * DB 로그
 */
export const logDb = (table: string, message: string, level: LogLevel = 'info') => {
  loggers.db(table)[level](message);
};

/**
 * 에러 로그
 */
export const logError = (context: string, error: Error | unknown, message?: string) => {
  const logger = new Logger({ component: context });
  logger.error(
    message || error instanceof Error ? error.message : String(error),
    error instanceof Error && { stack: error.stack }
  );
};

// =====================================================
// 개발용 console 로그 대체
// =====================================================

export const logger = loggers.app();

// 개발 환경에서 console.*를 대체하려면 아래 주석 해제
// if (process.env.NODE_ENV === 'development') {
//   console.debug = logger.debug.bind(logger);
//   console.log = logger.info.bind(logger);
//   console.warn = logger.warn.bind(logger);
//   console.error = logger.error.bind(logger);
// }
