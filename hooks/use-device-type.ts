// hooks/use-device-type.ts

import { useEffect, useState } from "react";

// 검색에서 모바일 화면에서 사용한다.
function useDeviceType() {
  // (1). 디바이스 타입을 저장할 상태를 정의한다.
  const [deviceType, setDeviceType] = useState("unknown");

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    handleResize(); // (2). set initial value
    window.addEventListener("resize", handleResize); // (3). add event listener

    return () => window.removeEventListener("resize", handleResize); // (4). remove event listener
  }, []);

  return deviceType;
}

export default useDeviceType;
