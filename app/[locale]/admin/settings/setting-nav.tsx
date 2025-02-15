// app/[locale]/admin/settings/setting-nav.tsx

"use client";

import { useEffect, useState } from "react";
import { Info, Languages, Package, SettingsIcon, ImageIcon, Currency, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingNav = () => {
  const [active, setActive] = useState(""); // ✅ 섹션의 active 상태를 관리

  useEffect(() => {
    const sections = document.querySelectorAll('div[id^="setting-"]');

    // InterSectionObserver를 사용하여 섹션이 화면에 들어올 때나 나갈때마다 콜백 함수를 호출한다.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.6, rootMargin: "0px 0px -40% 0px" }, // ✅ rootMargin을 사용하여 섹션의 진입 여부를 조절한다.
    );
    sections.forEach((section) => observer.observe(section)); // ✅ 섹션을 관찰한다.
    return () => observer.disconnect(); // ✅ 컴포넌트가 언마운트 될 때 옵저버를 해제한다.
  }, []);

  const handleScroll = (id: string) => {
    const section = document.getElementById(id);

    // 섹션에 약간 버퍼(여유)를 준다.
    if (section) {
      const top = section.offsetTop - 16; // 20px 정도 여유를 준다.
      window.scrollTo({ top, behavior: "smooth" }); // ✅ 스크롤을 부드럽게 이동한다.
    }
  };

  return (
    <div>
      <h1 className="h1-bold">Settings</h1>
      <nav className="flex md:flex-col gap-2 md:fixed mt-4 flex-wrap">
        {/* 배열을 표시 */}
        {[
          { name: "Site Info", hash: "setting-site-info", icon: <Info /> },
          { name: "Common Settings", hash: "setting-common", icon: <SettingsIcon /> },
          { name: "Carousels", hash: "setting-carousels", icon: <ImageIcon /> },
          { name: "Languages", hash: "setting-languages", icon: <Languages /> },
          { name: "Currencies", hash: "setting-currencies", icon: <Currency /> },
          { name: "Payment Method", hash: "setting-payment-methods", icon: <CreditCard /> },
          { name: "Delivery Dates", hash: "setting-delivery-dates", icon: <Package /> },
        ].map((item) => (
          <Button
            key={item.hash}
            onClick={() => handleScroll(item.hash)}
            variant={active === item.hash ? "outline" : "ghost"} // active(섹션ID)의 값과 hash 값을 비교하여 같다면 적용
            className={`justify-start ${active === item.hash ? "" : "border border-transparent"}`}>
            {/* 아이콘을 표시한다.  */}
            {item.icon}
            {item.name}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default SettingNav;
