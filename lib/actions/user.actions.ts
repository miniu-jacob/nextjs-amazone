// lib/actions/user.actions.ts
"use server";

import bcrypt from "bcryptjs";
import { IUserName, IUserSignIn, IUserSignUp } from "@/types";
import { auth, signIn, signOut } from "../auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../db";
import User, { IUser } from "../db/models/user.model";
import { clog } from "../jlogger";
import { formatError } from "../utils";
import { UserSignUpSchema, UserUpdateSchema } from "../user-validator";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { z } from "zod";

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

// (6). 유저 정보를 업데이트하는 서버 액션
export async function updateUserName(user: IUserName) {
  try {
    // DB 연결 후 사용자 세션을 가져온다.
    await connectToDatabase();
    const session = await auth();
    const currentUser = await User.findById(session?.user?.id);
    if (!currentUser) throw new Error("User not found");

    // 유저 이름을 업데이트하고 저장한다.
    currentUser.name = user.name;
    const updatedUser = await currentUser.save(); // 유저 정보 저장

    // 결과를 리턴한다.
    return { success: true, message: "User updated successfully", data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Admin Page 에서 유저 관리 > 유저 삭제 정의 함수
export async function deleteUser(id: string) {
  try {
    // await connectToDatabase();
    // const res = await User.findByIdAndDelete(id);
    // if (!res) throw new Error("User not found");

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully. For testing, actual data will not be deleted.",
      data: { _id: id },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Admin Page 에서 유저 관리 > 전체 유저 조회 함수 정의
export async function getAllUsers({ limit, page }: { limit?: number; page: number }) {
  limit = limit || PAGE_SIZE;
  await connectToDatabase();

  // skipAmount 계산 (page - 1) * limit
  const skipAmount = (Number(page) - 1) * limit;

  const users = await User.find().sort({ createdAt: "desc" }).skip(skipAmount).limit(limit);
  const usersCount = await User.countDocuments();

  // 결과를 리턴한다.
  return { data: JSON.parse(JSON.stringify(users)) as IUser[], totalPages: Math.ceil(usersCount / limit) };
}

// Admin Page 에서 유저 관리 > 유저 정보 변경 함수 정의
export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    // TODO: 유저 권한 확인 후 owner 만 변경 가능하다고 명시
    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) throw new Error("User not found");

    // dbUser.name = user.name;
    // dbUser.email = user.email;
    // dbUser.role = user.role;

    const updatedUser = await dbUser.save();
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Admin Page 에서 유저 관리 > 유저 정보 조회 함수 정의
export async function getUserById(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return JSON.parse(JSON.stringify(user)) as IUser;
}
