// lib/actions/setting.actions.ts
"use server";

// 1). 설정 모델(Setting), DB 연결, 모델 타입을 가져온다.
import Setting from "../db/models/setting.model";
import { connectToDatabase } from "../db";
import { ISettingInput } from "@/types";
import data from "../data";
import { formatError } from "../utils";
import { cookies } from "next/headers";

// 전역 캐싱용 변수
const globalForSettings = global as unknown as { cachedSettings: ISettingInput | null };
// 이 변수는 서버가 시작될 때 설정을 캐싱하기 위해 사용된다.
// 이렇게 하면 매 요청마다 설정을 가져오는 대신 캐시된 설정을 사용할 수 있다.

// 관리자 페이지 등에서 항상 최신 데이터를 조회하는 함수를 정의한다. (캐시 무시)
export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  await connectToDatabase();
  const setting = await Setting.findOne();
  return JSON.parse(JSON.stringify(setting)) as ISettingInput;
};

// 2). 설정을 가져오는 함수를 정의한다.
export const getSetting = async (): Promise<ISettingInput> => {
  if (!globalForSettings.cachedSettings) {
    console.log("[Setting] Fetching settings from DB");
    // 캐시가 없다면 DB에 연결하고 설정을 가져온다.
    await connectToDatabase();

    // DB에서 처음 문서를 찾는다.
    const setting = await Setting.findOne().lean();

    // 가져온 setting을 캐시에 저장한다. 없다면 기본값을 사용한다.
    globalForSettings.cachedSettings = setting ? JSON.parse(JSON.stringify(setting)) : data.settings[0];
  }
  // 캐시된 설정을 반환한다.
  return globalForSettings.cachedSettings as ISettingInput;
};

// 3). 설정을 업데이트하는 함수를 정의한다.
export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    // (a). DB에 연결한다.
    await connectToDatabase();

    // (b). 설정을 업데이트한다. (findOneAndUpdate 메서드를 사용한다.)
    const updateSetting = await Setting.findOneAndUpdate({}, newSetting, {
      upsert: true,
      new: true,
    }).lean();

    // (c). 업데이트된 설정을 캐시에 저장한다.
    globalForSettings.cachedSettings = JSON.parse(JSON.stringify(updateSetting));

    // (d). 성공 메시지를 반환한다.
    return {
      success: true,
      message: "Setting updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// 쿠키에 통화 값을 저장하는 함수를 정의한다.
export const setCurrencyOnServer = async (newCurrency: string) => {
  "use server";
  const cookiesStore = await cookies();
  cookiesStore.set("currency", newCurrency);

  return { success: true, message: "Currency update successfully" };
};
