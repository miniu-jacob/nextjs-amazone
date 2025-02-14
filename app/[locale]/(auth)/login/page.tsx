// app/[locale]/(auth)/login/page.tsx

import SeparatorWithOr from "@/components/shared/separator-or";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CredentialsSignInForm from "./credentials-signin-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { findUserByEmail } from "@/lib/actions/user.actions";
// import { clog } from "@/lib/jlogger";
import { GoogleSignInForm } from "./google-signin-form";
import { getSetting } from "@/lib/actions/setting.actions";

export const metadata: Metadata = {
  title: "Sign In",
};

interface SignInProps {
  searchParams: Promise<{ callbackUrl: string }>;
}

export default async function SignIn({ searchParams: props }: SignInProps) {
  // (1). 쿼리 파라미터에서 callbackUrl을 가져와 searchParams에 저장한다.
  const searchParams = await props;

  const { site } = await getSetting();

  // (2). callbackUrl이 없다면, "/"로 설정한다.
  const { callbackUrl = "/" } = searchParams;

  // (3). 세션 정보를 확인하여 세션이 있다면 callbackUrl로 리다이렉션한다.
  const session = await auth();
  if (session) redirect(callbackUrl);

  // 테스트 - 유저 정보 확인
  // const email = "jacob@miniu.kr";
  // const user = await findUserByEmail(email);
  // clog.info("[SignIn] session", session);

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
          {/* GOOGLE FORM */}
          <SeparatorWithOr />
          <div className="mt-4">
            <GoogleSignInForm />
          </div>
        </CardContent>
      </Card>
      {/* 구분선 */}
      <SeparatorWithOr> New to {site.name} </SeparatorWithOr>

      <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button className="w-full"> Create your {site.name} account</Button>
      </Link>
    </div>
  );
}
