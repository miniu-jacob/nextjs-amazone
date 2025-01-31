// app/(root)/account/manage/name/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { config } from "@/lib/app.config";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { ProfileForm } from "./profile-form";

const PAGE_TITLE = "Change Your Name";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function ProfilePage() {
  // 사용자 인증 정보를 가져오고 세션 프로바이더를 불러온다. (자식 컴포넌트 중 클라이언트 컴포넌트 사용)
  const session = await auth();
  return (
    <div className="mb-24">
      <SessionProvider session={session}>
        {/* 계정 페이지 링크 */}
        <div className="flex gap-2">
          <Link href={"/account"}>Your Account</Link>
          <span>{">"}</span>
          <Link href={"/account/manage"}>Login & Security</Link>
          <span>{">"}</span>
          <span>{PAGE_TITLE}</span>
        </div>
        {/* TITLE */}
        <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
        {/* CARD */}
        <Card className="max-w-2xl">
          <CardContent className="flex justify-between flex-wrap p-4">
            <p className="text-sm py-2">
              If you want to change the name associate with you {config.APP_NAME}&apos;s account, you may do so below. Be sure to click the
              Save changes button when you are done.
            </p>
            {/* PROFILE FORM */}
            <ProfileForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  );
}
