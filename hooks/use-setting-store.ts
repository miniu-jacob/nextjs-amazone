// hooks/use-setting-store.ts

import { ClientSetting, SiteCurrency } from "@/types";
import { settingsData as data } from "@/lib/data/settings-data";
import { create } from "zustand";

interface SettingState {
  locale: string; // Step 1: 현재 선택된 언어 (locale) 추가
  setLocale: (newLocale: string) => void; // Step 2: 새로운 언어를 설정하는 함수 추가
  setting: ClientSetting; // SettingInputSchema + currency 추가한 타입
  setSetting: (newSetting: ClientSetting) => void; // setting을 업데이트하는 함수
  getCurrency: () => SiteCurrency; // 현재 설정된 통화를 가져오는 함수
  setCurrency: (currency: string) => void; // 통화를 설정하는 함수
}

const useSettingStore = create<SettingState>((set, get) => ({
  // Step 3: locale - 현재 선택된 언어 (locale) 추가
  locale: "en-US",

  // Step 4: setLocale - 새로운 언어를 설정하는 함수 추가
  setLocale: (newLocale: string) => {
    set({ locale: newLocale });
    localStorage.setItem("locale", newLocale); // 로컬 스토리지에 언어를 저장하여 새로고침 후에도 유지
  },
  setting: {
    ...data.settings[0],
    currency: data.settings[0].defaultCurrency,
  } as ClientSetting,

  // setSetting - setting을 업데이트하는 함수
  setSetting: (newSetting: ClientSetting) => {
    set({
      setting: {
        ...newSetting,
        // 새로운 세팅이 currency를 가지고 있다면 그 값을 사용하고, 아니면 기존 세팅의 currency를 사용한다.
        currency: newSetting.currency || get().setting.currency,
      },
    });
  },

  // GET CURRENCY - 현재 설정된 통화를 가져오는 함수
  getCurrency: () => {
    return get().setting.availableCurrencies.find((c) => c.code === get().setting.currency) || data.settings[0].availableCurrencies[0];
  },

  // SET CURRENCY - 통화를 설정하는 함수
  setCurrency: async (currency: string) => {
    set({ setting: { ...get().setting, currency } });
  },
}));

export default useSettingStore;
