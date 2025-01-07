// lib/db/index.ts
import mongoose from "mongoose";
import { config } from "../app.config";

const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  // 환경 변수에서 MongoDB URI 를 가져온다.
  const MONGODB_URI = config.MONGODB_URI;

  // clog.info("[ConnectToDatabase - MONGODB_URI]", MONGODB_URI);
  if (cached.conn) return cached.conn;

  // MongoDB 연결을 캐싱하고 재사용
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;

  return cached.conn;
};
