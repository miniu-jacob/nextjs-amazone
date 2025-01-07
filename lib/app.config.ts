// lib/app.config.ts

import { getEnv } from "./get-env";

const appConfig = () => {
  // const MONGODB_URI = getEnv("MONGODB_URI"); // MONGODB_URI 가져오기
  // console.log("getEnv('MONGODB_URI'):", MONGODB_URI); // 디버깅: 값 출력

  return {
    APP_NAME: getEnv("NEXT_PUBLIC_APP_NAME", "MiniMarket"),
    APP_SLOGAN: getEnv("NEXT_PUBLIC_APP_SLOGAN", "Your online miniu market"),
    APP_DESCRIPTION: getEnv("NEXT_PUBLIC_APP_DESCRIPTION", "MINIU Market for selling and buying productsYour online mini market"),
    MONGODB_URI: getEnv("MONGODB_URI"),
  };
};

export const config = appConfig();
