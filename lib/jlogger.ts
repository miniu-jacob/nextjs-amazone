// app/lib/jlogger.ts

// Show milliseconds: true/false - 밀리세컨 표시 여부
const showMilliseconds: boolean = false;

// Type definition - 타입 정의
type LogLevel = "debug" | "info" | "normal" | "warn" | "error";

// Date format setting - 날짜 형식 설정
type DateFormatOption = "YYYY/MM/DD" | "YYYY-MM-DD" | "YY/MM/DD" | "MM/DD" | "MM-DD";
let currentDateFormat: DateFormatOption = "MM/DD";

// Basic setting - (default: 'info') 기본 설정
let currentLogLevel: LogLevel = "info";

// COLOR_CODE - 컬러 코드 상수화
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Log level mapping - 로그 레벨 매핑
const logLevels = new Map<LogLevel, number>([
  ["debug", 0],
  ["info", 1],
  ["normal", 2],
  ["warn", 3],
  ["error", 4],
]);

// Log level setting - 로그 레벨을 설정
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
};

// Date format setting function - 날짜 형식 설정 함수
export const setDateFormat = (format: DateFormatOption) => {
  currentDateFormat = format;
};

// getLevelColor - 로그 레벨에 따른 색상 반환 함수
const getLevelColor = (level: LogLevel): string => {
  switch (level) {
    case "debug":
      return COLORS.cyan;
    case "info":
      return COLORS.green;
    case "normal":
      return COLORS.blue;
    case "warn":
      return COLORS.magenta;
    case "error":
      return COLORS.red;
    default:
      return COLORS.reset;
  }
};

// padZero - 숫자를 두 자리로 패딩하는 함수
const padZero = (num: number): string => {
  return num.toString().padStart(2, "0");
};

// get timestamp 타임스탬프 가져오는 함수 (로그 레벨에 따른 색상 적용)
const getCurrentTimestamp = (level: LogLevel): string => {
  const now = new Date();
  let datePart = "";
  switch (currentDateFormat) {
    case "YYYY/MM/DD":
      datePart = `${now.getFullYear()}/${padZero(now.getMonth() + 1)}/${padZero(now.getDate())}`;
      break;
    case "YY/MM/DD":
      datePart = `${String(now.getFullYear()).slice(-2)}/${padZero(now.getMonth() + 1)}/${padZero(now.getDate())}`;
      break;
    case "MM/DD":
      datePart = `${padZero(now.getMonth() + 1)}/${padZero(now.getDate())}`;
      break;
    case "MM-DD":
      datePart = `${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
      break;
    default:
      datePart = `${now.getFullYear()}/${padZero(now.getMonth() + 1)}/${padZero(now.getDate())}`;
  }

  //
  const timePart = showMilliseconds
    ? `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}.${now.getMilliseconds()}`
    : `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;

  const formattedTimestamp = `${datePart} ${timePart}`;

  //? 날짜 포맷 설정 - 주석 처리 (comment)
  /* --------------------------------------------------------
  const formattedTimestamp = showMilliseconds
    ? now.toISOString().replace("T", " ").substr(0, 23)
    : now.toISOString().replace("T", " ").substr(0, 19);
    -------------------------------------------------------- */

  const timestampColor = level === "normal" || level === "warn" || level === "error" ? getLevelColor(level) : COLORS.yellow;

  return `${timestampColor}[${formattedTimestamp}]${COLORS.reset}`;
};

// print log - 로그 출력 함수
const logMessage = (level: LogLevel, messages: unknown[]) => {
  const currentLevelPriority = logLevels.get(currentLogLevel) ?? 0;
  const messageLevelPriority = logLevels.get(level) ?? 0;

  if (messageLevelPriority < currentLevelPriority) return;

  try {
    const timestamp = getCurrentTimestamp(level);
    const levelColor = getLevelColor(level);
    const levelLabel = `${levelColor}[${level.toUpperCase()}]${COLORS.reset}:`;

    // 첫 번째 메시지와 나머지 메시지를 분리
    const [firstMessage, ...restMessages] = messages;

    // 첫 번째 메시지에만 색상 적용
    const formattedFirstMessage = typeof firstMessage === "string" ? `${levelColor}${firstMessage}${COLORS.reset}` : firstMessage;

    // print console.log
    console.log(`${timestamp} ${levelLabel} ${formattedFirstMessage}`, ...restMessages);
  } catch (error) {
    console.error(`${getCurrentTimestamp("error")}${COLORS.red} [ERROR]:${COLORS.reset}`, "로그 출력 중 에러 발생:", error);
  }
};

// clog 객체 정의
export const clog = {
  log: (...messages: unknown[]) => logMessage("normal", messages),
  debug: (...messages: unknown[]) => logMessage("debug", messages),
  info: (...messages: unknown[]) => logMessage("info", messages),
  normal: (...messages: unknown[]) => logMessage("normal", messages),
  warn: (...messages: unknown[]) => logMessage("warn", messages),
  error: (...messages: unknown[]) => logMessage("error", messages),
};
