// components/shared/client-providers.tsx

"use client";

import useCartSidebar from "@/hooks/use-cart-sidebar";
import { Toaster } from "../ui/toaster";
import CartSidebar from "./cart-sidebar";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // (1). useCartSidebar 훅을 불러온다.
  const isCartSidebarOpen = useCartSidebar();
  return (
    <>
      {/* 사이드바와 함께 레이아웃을 설정 > 사이드바는 오른쪽에 고정, children은 flex-1 속성을 통해 남은 공간 차지 */}
      {isCartSidebarOpen ? (
        <div className="flex min-h-screen">
          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-hidden">{children}</div>
          {/* 사이드바 */}
          <CartSidebar />
        </div>
      ) : (
        <div>{children}</div>
      )}
      <Toaster />
    </>
  );
}
