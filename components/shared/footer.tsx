// components/shared/footer.tsx
"use client";

import { ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { config } from "@/lib/app.config";

export default function Footer() {
  return (
    <footer className="bg-black text-white underline-link">
      <div className="w-full">
        {/* 버튼에 클릭하면 top으로 갈 수 있도록 onClick 이벤트를 준다.  */}
        <Button
          variant={"ghost"}
          className="bg-gray-800 w-full rounded-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
          <ChevronUp className="mr-2 h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        {/* 개인정보 알림 링크 */}
        <div className="flex justify-center text-sm gap-3">
          <Link href="/page/condition-of-use">Condition of Use</Link>
          <Link href="/page/privacy-policy">Privacy Notice</Link>
          <Link href="/page/help">Help</Link>
        </div>
        {/* CopyRight */}
        <div className="flex justify-center text-sm">
          <p>© 2021-2025, {config.APP_NAME}, Inc. or its affiliates</p>
        </div>
        {/* Address */}
        <div className="mt-8 flex justify-center text-sm text-gray-400">
          123, Khu đô thị Phú Mỹ Hưng, Quận 7, Hồ Chí Minh 700000 Vietnam
        </div>
      </div>
    </footer>
  );
}
