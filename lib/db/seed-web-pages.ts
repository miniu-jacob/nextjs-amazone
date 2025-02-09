// lib/db/seed-web-pages.ts

import { loadEnvConfig } from "@next/env";
import { cwd } from "process";
import { clog } from "../jlogger";
import { connectToDatabase } from ".";
import WebPage from "./models/web-page-model";
import { webPages } from "../data/web-pages-data";
import mongoose from "mongoose";

// 1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const seedWebPages = async () => {
  try {
    clog.log("🌱 Seeding Web Pages...");

    // DB에 연결하고 기존 웹페이지 데이터를 삭제하고 새로운 데이터를 삽입한다.
    await connectToDatabase(process.env.MONGODB_URI);
    clog.info("[DB] Connected to Database", process.env.MONGODB_URI);

    clog.info("[DB] Check the Model: ", mongoose.modelNames());

    // 기존 웹데이터 삭제 및 새로운 데이터 삽입
    clog.info("[DB] Deleting existing Web Pages...");
    await WebPage.deleteMany();
    clog.info("[DB] Deleted existing Web Pages");
    const createWebPages = await WebPage.insertMany(webPages);
    console.log({
      createWebPages,
      message: "✅ Web Pages Seeded Successfully",
    });

    process.exit(0);
  } catch (error) {
    clog.error("❌ Failed to seed Web Pages: ", error);
    process.exit(1);
  }
};

seedWebPages();
