// lib/actions/user.actions.ts
"use server";

import bcrypt from "bcryptjs";
import { IUserSignIn, IUserSignUp } from "@/types";
import { signIn, signOut } from "../auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../db";
import User from "../db/models/user.model";
import { clog } from "../jlogger";
import { formatError } from "../utils";
import { UserSignUpSchema } from "../user-validator";

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

// (4). 회원가입 서버 액션을 정의해 준다.
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    // (a). 유저 정보를 유효성 검사
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    });
    // (b). DB 연결
    await connectToDatabase();
    // (c). 유저 생성
    await User.create({
      ...user, // 유효성 검사를 통과한 유저 정보
      password: await bcrypt.hash(user.password, 5), // 비밀번호 해시화
    });

    // (d). 회원가입 성공 후 반환
    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// (5). OAuth 로그인 서버 액션
export const SignWithGoogle = async () => {
  await signIn("google");
};
