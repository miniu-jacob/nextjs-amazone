// lib/db/index.ts
import mongoose from "mongoose";
import User from "./models/user.model";
import Order from "./models/order.model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (MONGODB_URI = process.env.MONGODB_URI) => {
  // 환경 변수에서 MongoDB URI 를 가져온다.
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  // MongoDB 연결을 캐싱하고 재사용

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // 명령 버퍼링 비활성화
        serverSelectionTimeoutMS: 10000, // 서버 선택 시간 초과
        socketTimeoutMS: 45000, // 소켓 시간 초과
      })
      .then((connection) => {
        // 모델 강제 로드 (Production 환경에서 누락 방지)
        connection.model("User", User.schema);
        connection.model("Order", Order.schema);

        return connection;
      })
      .catch((error) => {
        // 연결 실패 시 캐시 초기화
        cached.promise = null;
        throw error;
      });
  }

  // cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
  // 연결 완료 후 캐싱된 연결 반환
  cached.conn = await cached.promise;

  return cached.conn;
};
