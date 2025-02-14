// app/[locale]/(root)/account/manage/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

const PAGE_TITLE = "Addresses"; // 페이지 제목 상수 정의
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function AddressesPage() {
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
              <h3 className="font-bold">Address</h3>
              <p>will be implemented in the next version</p>
            </div>
            {/* 수정 버튼 */}
            <div>
              <Link href={"/account/manage/name"}>
                <Button className="rounded-full w-32" variant={"outline"} disabled>
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
        </Card>
      </SessionProvider>
    </div>
  );
}
