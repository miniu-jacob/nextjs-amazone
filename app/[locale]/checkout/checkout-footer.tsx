// app/[locale]/checkout/checkout-footer.tsx

import useSettingStore from "@/hooks/use-setting-store";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CheckoutFooter() {
  const {
    setting: { site },
  } = useSettingStore();

  const t = useTranslations("Footer");

  return (
    <div className="border-t-2 space-y-2 my-4 py-4 text-sm">
      <p>
        {t.rich("Help Message", {
          link1: (chunks) => <Link href={"/page/help"}>{chunks}</Link>,
          link2: (chunks) => <Link href={"/page/contact-us"}>{chunks}</Link>,
        })}
      </p>
      <p>
        {t.rich("Order Info", {
          name: site.name,
          link1: (chunks) => <Link href="/page/privacy-policy">{chunks}</Link>,
          link2: (chunks) => <Link href="/page/conditions-of-use">{chunks}</Link>,
        })}
      </p>
      <p>
        {t.rich("Return Policy", {
          name: site.name,
          link: (chunks) => <Link href="/page/returns-policy">{chunks}</Link>,
        })}
      </p>
    </div>
  );
}
