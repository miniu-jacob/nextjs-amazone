// lib/get-env.ts
import dotenv from "dotenv";
import { cwd } from "process";

// .env.local 파일을 명시적으로 로드
dotenv.config({ path: `${cwd()}/.env.local` });

export const getEnv = (key: string, defaultValue: string = "") => {
  const value = process.env[key];
  // console.log(`[getEnv] Key: ${key}, Value: ${value}`); // 디버깅: 환경 변수 키와 값을 출력

  if (value == undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined. Check your .env.local file`);
  }

  return value;
};
