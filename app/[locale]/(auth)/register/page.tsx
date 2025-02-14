// app/[locale]/(auth)/register/page.tsx

import React from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl: string }>;
}

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function RegisterPage({ searchParams: props }: RegisterPageProps) {
  // (1). 쿼리 파라미터에서 callbackUrl을 가져와 searchParams에 저장한다.
  const searchParams = await props;

  // (2). callbackUrl 이 없다면, "/"로 설정한다.
  const { callbackUrl = "/" } = searchParams;

  // (3). 세션정보를 읽어 세션정보가 있다면, callbackUrl로 리다이렉트한다.
  const session = await auth();
  if (session) return redirect(callbackUrl);

  // (4). 회원가입 페이지를 랜더링한다.
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
