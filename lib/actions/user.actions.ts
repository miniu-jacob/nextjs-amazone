// lib/actions/user.actions.ts
"use server";

import { IUserSignIn } from "@/types";
import { signIn, signOut } from "../auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../db";
import User from "../db/models/user.model";
import { clog } from "../jlogger";

// (1). 사용자의 이메일과 비밀번호를 사용하여 로그인을 하는 서버 액션
export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn("credentials", { ...user, redirect: false });
}

// (2). 로그아웃 서버 액션
export const logout = async () => {
  const redirectTo = await signOut({ redirect: false });
  redirect(redirectTo.redirect);
};

// (3). 테스트를 위한 사용자 이메일로 특정 유저 조회하는 서버 액션
export const findUserByEmail = async (email: string) => {
  try {
    // (a). DB 연결
    await connectToDatabase(process.env.MONGODB_URI);

    // (b). 이메일로 유저 검색
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    clog.error("[findUserByEmail] error", error);
    throw new Error("User not found");
  }
};
