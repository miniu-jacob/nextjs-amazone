// app/(root)/account/page.tsx

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Card, CardContent } from "@/components/ui/card";
import { Home, PackageCheckIcon, User } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const PAGE_TITLE = "Your Account"; // 페이지 제목 상수 정의
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function AccountPage() {
  return (
    <div>
      {/* PAGE TITLE */}
      <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
      {/* NAVIGATION CARDS UI */}
      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        {/* 주문 관리 */}
        <Card>
          <Link href={"/account/orders"}>
            <CardContent className="flex gap-4 p-6 items-start">
              <div>
                <PackageCheckIcon className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="text-muted-foreground">Track, return, cancel an order, download invoice or buy again</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        {/* 보안 설정 */}
        <Card>
          <Link href={"/account/manage"}>
            <CardContent className="flex p-6 gap-4 items-start">
              <div>
                <User className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Login & Security</h2>
                <p className="text-muted-foreground">Manage password, email and mobile number</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        {/* 주소 관리 */}
        <Card>
          <Link href={"/account/addresses"}>
            <CardContent className="flex items-start gap-4 p-6">
              <div>
                <Home className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Addresses</h2>
                <p className="text-muted-foreground">Edit, remove or set default address</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      {/* BROWSING HISTORY */}
      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
