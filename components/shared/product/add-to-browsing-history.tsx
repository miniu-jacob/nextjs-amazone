// components/shared/product/add-to-browsing-history.tsx

"use client";

import useBrowsingHistory from "@/hooks/use-browsing-history";
import { useEffect } from "react";

type AddToBrowsingHistoryProps = {
  id: string;
  category: string;
};

export default function AddToBrowsingHistory({ id, category }: AddToBrowsingHistoryProps) {
  // (1). useBrowsingHistory 훅을 사용하여 addItem 함수를 가져온다.
  const { addItem } = useBrowsingHistory();

  // (2). useEffect를 사용하여 컴포넌트가 마운트 되었을 때 addItem 함수를 호출한다.
  useEffect(() => {
    // clog.log("[AddToBrowsingHistory] addItem({ id, category }): ", { id, category });
    addItem({ id, category });
    // 아이템을 추가만 하기 때문에 아래 에러를 무시하기 위해 주석을 넣는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
