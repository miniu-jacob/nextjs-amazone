// lib/db/seed-users.ts

import { connectToDatabase } from ".";
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import User from "./models/user.model";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const delSeedUser = async () => {
  try {
    // (2). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase(process.env.MONGODB_URI);

    // (3). 기존 유저를 모두 삭제하고 새로운 데이터를 삽입한다.
    const deletedUsers = await User.deleteMany(); // TODO: 기존 유저가 모두 삭제된다.

    console.log({
      deletedUsers,
      message: "Seeded users successfully",
    });
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users: ", error);
    throw new Error("Failed to seed users.");
  }
};

// (5). 시드 실행
delSeedUser();
