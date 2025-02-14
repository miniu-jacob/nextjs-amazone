// components/shared/app-initializer.tsx

import React, { useEffect, useState } from "react";
import { ClientSetting } from "@/types";
import useSettingStore from "@/hooks/use-setting-store";

export default function AppInitializer({ setting, children }: { setting: ClientSetting; children: React.ReactNode }) {
  // 초기 설정을 적용하기 위해 랜더링 상태를 관리한다.
  const [rendered, setRendered] = useState(false);

  // useEffect를 사용하여 초기 설정을 적용한다.
  useEffect(() => {
    setRendered(true);
  }, [setting]);

  // 랜더링되기 전 한번 설정을 적용한다. (랜더링 후에는 설정을 적용하지 않는다.)
  if (!rendered) {
    useSettingStore.setState({
      setting,
    });
  }

  return children;
}
