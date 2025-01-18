// lib/db/seed-users.ts

import { connectToDatabase } from ".";
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";
import User from "./models/user.model";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const seedUsers = async () => {
  try {
    // (2). 테스트용 유저 데이터를 정의한다.
    const testUsers = [
      {
        email: "jacob@miniu.kr",
        password: await hash("ahffkdy", 10), // 비밀번호 해시화
        name: "Jacob",
        role: "admin",
      },
      {
        email: "jacob1@miniu.kr",
        password: await hash("ahffkdy", 10), // 비밀번호 해시화
        name: "robin",
        role: "user",
      },
    ];

    // (3). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase(process.env.MONGODB_URI);

    // (4). 기존 유저를 모두 삭제하고 새로운 데이터를 삽입한다.
    // await User.deleteMany();
    // // TODO: 기존 유저가 모두 삭제된다.

    const createdUsers = await User.insertMany(testUsers);

    console.log({
      createdUsers,
      message: "Seeded users successfully",
    });
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users: ", error);
    throw new Error("Failed to seed users.");
  }
};

// (5). 시드 실행
seedUsers();
