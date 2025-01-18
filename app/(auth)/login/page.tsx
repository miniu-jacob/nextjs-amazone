// app/(auth)/login/page.tsx

import SeparatorWithOr from "@/components/shared/separator-or";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/lib/app.config";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CredentialsSignInForm from "./credentials-signin-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { findUserByEmail } from "@/lib/actions/user.actions";
import { clog } from "@/lib/jlogger";

export const metadata: Metadata = {
  title: "Sign In",
};

interface SignInProps {
  searchParams: Promise<{ callbackUrl: string }>;
}

export default async function SignIn({ searchParams: props }: SignInProps) {
  // (1). 쿼리 파라미터에서 callbackUrl을 가져와 searchParams에 저장한다.
  const searchParams = await props;

  // (2). callbackUrl이 없다면, "/"로 설정한다.
  const { callbackUrl = "/" } = searchParams;

  // (3). 세션 정보를 확인하여 세션이 있다면 callbackUrl로 리다이렉션한다.
  const session = await auth();
  if (session) redirect(callbackUrl);

  // 테스트 - 유저 정보 확인
  const email = "jacob@miniu.kr";
  const user = await findUserByEmail(email);
  clog.info("[SignIn] user", user);

  // (4). 세션이 없다면, 로그인 페이지를 보여준다.
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {/* LOGIN FORM */}
            <CredentialsSignInForm />
          </div>
        </CardContent>
      </Card>
      {/* 구분선 */}
      <SeparatorWithOr> New to {config.APP_NAME} </SeparatorWithOr>

      <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button className="w-full"> Create your {config.APP_NAME} account</Button>
      </Link>
    </div>
  );
}
