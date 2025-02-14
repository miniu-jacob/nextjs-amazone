// components/shared/header/theme-switcher.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useColorStore from "@/hooks/use-color-store";
import useIsMounted from "@/hooks/use-is-mounted";
import { ChevronDownIcon, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  // useTheme 훅을 통해 테마와 테마 변경 함수를 가져온다.
  const { theme, setTheme } = useTheme();
  const { availableColors, color, setColor } = useColorStore(theme);

  // 번역 훅 호출
  const t = useTranslations("Header");

  const changeTheme = (value: string) => {
    setTheme(value);
  };

  const isMounted = useIsMounted();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="header-button h-[41px] text-xs">
        {theme === "dark" && isMounted ? (
          <div className="flex items-center gap-1">
            <Moon className="h-4 w-4" />
            {t("Dark")}

            <ChevronDownIcon />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Sun className="h-4 w-4" />
            {t("Light")}
            <ChevronDownIcon />
          </div>
        )}
      </DropdownMenuTrigger>
      {/* CONTENT */}
      <DropdownMenuContent className="w-40">
        {/* THEME SETTING */}
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
          <DropdownMenuRadioItem value="dark">
            <Moon className="h-4 w-4 mr-1" /> {t("Dark")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">
            <Sun className="h-4 w-4 mr-1" /> {t("Light")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* COLOR SETTING */}
        <DropdownMenuLabel>{t("Color")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={color.name} onValueChange={(value) => setColor(value, true)}>
          {availableColors.map((c) => (
            <DropdownMenuRadioItem key={c.name} value={c.name}>
              <div style={{ backgroundColor: c.name }} className="h-4 w-4 mr-1 rounded-full" />
              {t(c.name)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
