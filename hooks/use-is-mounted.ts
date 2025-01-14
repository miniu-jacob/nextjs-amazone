// hooks/use-is-mounted.ts

import { useEffect, useState } from "react";

function useIsMounted() {
  // isMounted 상태값을 저장할 변수 선언
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 컴포넌트가 마운트되면 isMounted 상태값을 true로 변경
  }, []);

  return isMounted; // isMounted 상태값 반환
}

export default useIsMounted;
