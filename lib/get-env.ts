// lib/get-env.ts

export const getEnv = (key: string, defaultValue: string = "") => {
  const value = process.env[key];

  if (value == undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined. Check your .env.local file`);
  }

  return value;
};