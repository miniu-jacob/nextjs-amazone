// app/[locale]/(root)/account/manage/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

const PAGE_TITLE = "Login & Security"; // 페이지 제목 상수 정의
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="mb-24">
      <SessionProvider session={session}>
        {/* 계정 페이지 링크 */}
        <div className="flex gap-2">
          <Link href={"/account"}>Your Account</Link>
          <span>{">"}</span>
          <span>{PAGE_TITLE}</span>
        </div>
        {/* 페이지 제목 */}
        <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>

        {/* 사용자 정보 카드 */}
        <Card className="max-w-2xl">
          <CardContent className="flex justify-between p-4 flex-wrap">
            <div>
              <h3 className="font-bold">Name</h3>
              <p>{session?.user.name}</p>
            </div>
            {/* 수정 버튼 */}
            <div>
              <Link href={"/account/manage/name"}>
                <Button className="rounded-full w-32" variant={"outline"}>
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          {/* 이메일 내용과 수정 버튼 */}
          <CardContent className="flex justify-between p-4 flex-wrap">
            <div>
              <h3 className="font-bold">Email</h3>
              <p>{session?.user.email}</p>
              <p>will be implemented in the next version</p>
            </div>
            <div>
              <Link href={"#"}>
                <Button className="rounded-full w-32" disabled variant={"outline"}>
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          {/* 비밀번호와 수정 버튼 */}
          <CardContent className="flex justify-between p-4 flex-wrap">
            <div>
              <h3 className="font-bold">Password</h3>
              <p>**********</p>
              <p>will be implemented in the next version</p>
            </div>
            <div>
              <Link href={"#"}>
                <Button className="rounded-full w-32" disabled variant={"outline"}>
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  );
}
