// i18n-config.ts

export const i18n = {
  locales: [
    { code: "en-US", name: "English", icon: "/icons/flags/us.svg" },
    { code: "ko-KR", name: "한국어", icon: "/icons/flags/ko.svg" },
    { code: "vi-VN", name: "Tiếng Việt", icon: "/icons/flags/vn.svg" },
  ],
  defaultLocale: "en-US",
};

// TEXT DIRECTION
export const getDirection = (locale: string) => {
  return locale === "ar" ? "rtl" : "ltr";
};

export type I18nConfig = typeof i18n;
export type Locale = I18nConfig["locales"][number];
