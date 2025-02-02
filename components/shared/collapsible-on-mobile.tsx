// components/shared/collapsible-on-mobile.tsx

"use client";

import useDeviceType from "@/hooks/use-device-type";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Button } from "../ui/button";

export default function CollapsibleOnMobile({ title, children }: { title: string; children: React.ReactNode }) {
  // URL 변경을 위해 searchParams를 사용한다.
  const searchParams = useSearchParams();

  // device type을 가져온다. (mobile, tablet, desktop)
  const deviceType = useDeviceType();
  // 필터 상태 관리
  const [open, setOpen] = useState(false);

  // 모바일에서 필터 닫기, 데스크탑에서는 자동으로 열어둔다.
  useEffect(() => {
    if (deviceType === "mobile") setOpen(false);
    else if (deviceType === "desktop") setOpen(true);
  }, [deviceType, searchParams]);

  // unknown 방지
  if (deviceType === "unknown") return null;

  return (
    <Collapsible open={open}>
      <CollapsibleTrigger asChild>
        {deviceType === "mobile" && (
          <Button onClick={() => setOpen(!open)} variant={"outline"} className="w-full">
            {title}
          </Button>
        )}
      </CollapsibleTrigger>
      {/* CollapsibleContent 내부에 필터 표시 */}
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
