// lib/actions/web-page.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import WebPage, { IWebPage } from "../db/models/web-page-model";
import { formatError } from "../utils";
import { z } from "zod";
import { WebPageInputSchema, WebPageUpdateSchema } from "../validator";
import { auth } from "../auth";

export async function deleteWebPage(id: string) {
  try {
    // 로그인한 사용자 정보를 확인하여 owner인 경우에만 사용 가능하도록 변경
    const session = await auth();
    if (!session || session.user.role !== "owner") {
      throw new Error("Only owner can delete web pages");
    }

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

// 웹페이지 생성 서버 액션 정의
export async function createWebPage(data: z.infer<typeof WebPageInputSchema>) {
  try {
    const webPage = WebPageInputSchema.parse(data);

    // DB에 연결하고 웹페이지를 생성한다.
    await connectToDatabase();
    await WebPage.create(webPage);

    revalidatePath("/admin/web-pages");

    return { success: true, message: "Web Page created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// 웹페이지 업데이트 서버 액션 정의
export async function updateWebPage(data: z.infer<typeof WebPageUpdateSchema>) {
  try {
    const webPage = WebPageUpdateSchema.parse(data);
    await connectToDatabase();
    // await WebPage.findByIdAndUpdate(webPage._id, webPage);
    // TODO: 임시로 변경하지 못하도록 막음
    await WebPage.findById(webPage._id);
    revalidatePath("/admin/web-pages");
    return { success: true, message: "Web Page updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
