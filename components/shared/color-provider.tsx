// components/shared/color-provider.tsx

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import useColorStore from "@/hooks/use-color-store";

export function ColorProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // 현재 테마 값 가져오기 (light, dark, system)
  const { theme } = useTheme();

  // Zustand에서 테마 색상과 CSS 변수를 가져온다.
  const { color, updateCssVariables } = useColorStore(theme);

  // 테마 색상을 동적으로 변경한다.
  React.useEffect(() => {
    updateCssVariables(); // 테마가 변경될 때 CSS 변수를 업데이트한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, color]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
