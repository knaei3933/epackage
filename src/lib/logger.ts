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
    // プロダクション環境でも info/warn/error すべて構造化して出力する。
    // (OQ-6 / AC-5): 従来は error のみ stderr 出力だったため info/warn が欠落していた。
    // level によるフィルタは shouldLog() で既に行っているため、ここでは出力先の振り分けのみ。
    const output = JSON.stringify(entry);
    if (entry.level === 'error') {
      console.error(output);
    } else {
      // info / warn は stdout へ（warn も JSON 1 行として扱い一貫性を保つ）
      console.log(output);
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
    message || (error instanceof Error ? error.message : String(error)),
    error instanceof Error && { stack: error.stack }
  );
};

// =====================================================
// 개발용 console 로그 대체
// =====================================================

export const logger = loggers.app();

// =====================================================
// PII マスキングヘルパ（個人情報保護準拠）
// ログに email / 電話番号 / トークン等の生値を出さないためのユーティリティ。
// admin route 群の PII 平文ログ解消（AC-6）で使用。
// =====================================================

/**
 * メールアドレスのマスキング
 * ローカルパートの先頭2文字のみ残し、ドメインは保持する。
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * トークン / ID 文字列のマスキング
 * 先頭4文字 + ... + 末尾4文字。短すぎる場合は完全隠蔽。
 */
export function maskToken(token: string | null | undefined): string {
  if (!token || token.length < 8) return '***';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * 電話番号のマスキング
 * 先頭3文字 + *** + 末尾2文字。短すぎる場合は完全隠蔽。
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return '***';
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
}

// 개발 환경에서 console.*를 대체하려면 아래 주석 해제
// if (process.env.NODE_ENV === 'development') {
//   console.debug = logger.debug.bind(logger);
//   console.log = logger.info.bind(logger);
//   console.warn = logger.warn.bind(logger);
//   console.error = logger.error.bind(logger);
// }
