// components/shared/client-providers.tsx

"use client";

// import useCartSidebar from "@/hooks/use-cart-sidebar";
import { Toaster } from "../ui/toaster";
// import CartSidebar from "./cart-sidebar";
import { ThemeProvider } from "./theme-provider";
import { ClientSetting } from "@/types";
import AppInitializer from "./app-initializer";

export default function ClientProviders({ setting, children }: { setting: ClientSetting; children: React.ReactNode }) {
  // (1). useCartSidebar 훅을 불러온다.

  // const visible = useCartSidebar();
  return (
    <AppInitializer setting={setting}>
      <ThemeProvider attribute={"class"} defaultTheme={"system"}>
        {/* <ThemeProvider attribute={"class"} defaultTheme={setting.common.defaultTheme.toLocaleLowerCase()}> */}
        {/* 사이드바와 함께 레이아웃을 설정 > 사이드바는 오른쪽에 고정, children은 flex-1 속성을 통해 남은 공간 차지 */}

        <div>{children}</div>
        <Toaster />
      </ThemeProvider>
    </AppInitializer>
  );
}
