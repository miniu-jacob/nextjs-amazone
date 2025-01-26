// lib/auth.ts

// 어댑터 설정
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

// DB 연결을 위한 client 와 User 모델을 불러온다.
import client from "./db/client";
import User from "./db/models/user.model";

// 인증을 위한 NextAuth, authConfig을 불러온다.
import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { connectToDatabase } from "./db";

import bcrypt from "bcryptjs";
import { clog } from "./jlogger";

// OAuth
import GoogleProvider from "next-auth/providers/google";

// next-auth 에서 Session에 사용자의 역할(role)을 추가한다.
declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}

// NextAuth를 초기화하면서 handlers, auth, signIn, signOut을 꺼내온다.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // authConfig를 전달한다.

  // 각 페이지에 대한 경로를 설정한다.
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },

  // 세션을 설정한다.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  // 어댑터를 설정한다.
  adapter: MongoDBAdapter(client),

  // providers 를 설정한다.
  providers: [
    GoogleProvider({
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        // (1). DB 연결 및 확인
        clog.log("[CredentialsProvider] authorize function called");
        await connectToDatabase();
        if (credentials === null) return null;

        const user = await User.findOne({ email: credentials.email });

        console.log("[CredentialsProvider] user detected");

        if (user && user.password) {
          const isMatch = await bcrypt.compare(credentials.password as string, user.password);
          // clog.info("[CredentialsProvider] isMatch result ", isMatch);
          if (isMatch) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        // (a). DB 에 연결한다.
        await connectToDatabase();

        // (b). 사용자를 조회한다.
        const existingUser = await User.findById(user.id);

        // (c). 사용자가 없으면 기본값을 이메일에서 추출한다.
        if (!existingUser) {
          const defaultName = user.name || user.email?.split("@")[0];

          // (d). 사용자가 없으므로 새로운 사용자를 생성한다.
          const newUser = await User.create({
            _id: user.id,
            email: user.email,
            name: defaultName,
            role: "user", // 기본값은 사용자
            image: user.image,
          });

          // (e). 토큰에 사용자 데이터를 추가한다.
          token.role = newUser.role;
          token.name = newUser.name;
        } else {
          // 기존 사용자가 있다면 기존 사용자 role과 name을 설정한다.
          token.role = existingUser.role || "user";
          token.name = existingUser.name || user.email?.split("@")[0];
        }

        clog.info("[jwt] token", token);
      }

      // 세션 업데이트, trigger === 'update'의 의미는 세션이 업데이트될 때(예: 사용자가 자신의 이름을 변경한 경우) 호출된다.
      // 세션에서 새 이름(session.user.name)을 토큰에 추가하여 JWT에 반영한다는 의미이다.
      if (session?.user?.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    // 콜백 안에 세션 업데이트 로직
    session: async ({ session, user, trigger, token }) => {
      // JWT 토큰에 sub 속성이 있으면 이를 세션의 user.id로 설정한다.
      session.user.id = token.sub as string;
      // JWT 토큰에 role 속성을 추가했으므로 세션의 user.role로 설정한다.
      session.user.role = token.role as string;
      // JWT 토큰에 이름이 있으면 세션의 user.name으로 설정한다.
      session.user.name = token.name;

      // 세션이 업데이트되면 user.name을 session.user.name으로 설정한다.
      if (trigger === "update") {
        session.user.name = user.name;
      }
      // 세션을 반환한다.
      return session;
    },
  },
});
