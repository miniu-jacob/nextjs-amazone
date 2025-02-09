// lib/actions/web-page.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import WebPage, { IWebPage } from "../db/models/web-page-model";
import { formatError } from "../utils";

export async function deleteWebPage(id: string) {
  try {
    await connectToDatabase();
    const res = await WebPage.findByIdAndDelete(id);
    if (!res) throw new Error("Web Page not found");

    revalidatePath("/admin/web-pages");

    return { success: true, message: "Web Page deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// 모든 웹페이지 조회
export async function getAllWebPages() {
  await connectToDatabase();
  const webPages = await WebPage.find();
  // MongoDB Data → Mongoose.Document → JavaScript 문자열(JSON.stringify()) → JavaScript 객체(JSON.parse())
  // 위의 과정에서 타입을 특정할 수 없다. 따라서 타입 단언을 사용하여 정의한다.
  return JSON.parse(JSON.stringify(webPages)) as IWebPage[];
}

// ID로 웹페이지 조회
export async function getWebPageById(webPageId: string) {
  await connectToDatabase();
  const webPage = await WebPage.findById(webPageId);
  return JSON.parse(JSON.stringify(webPage)) as IWebPage;
}

// slug로 웹페이지 조회
export async function getWebPageBySlug(slug: string) {
  await connectToDatabase();
  const webPage = await WebPage.findOne({ slug, isPublished: true });
  if (!webPage) throw new Error("Web Page not found");
  return JSON.parse(JSON.stringify(webPage)) as IWebPage;
}
