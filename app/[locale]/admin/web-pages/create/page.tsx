// app/[locale]/admin/web-pages/create/page.tsx

import { Metadata } from "next";
import WebPageForm from "../web-page-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Create Web Page",
};

export default async function CreateWebPage() {
  const t = await getTranslations();
  return (
    <>
      <h1 className="h1-bold">{t("Common.type name", { type: t("Common.Create"), name: t("Common.WebPage") })} </h1>
      <div className="my-8">
        <WebPageForm type="Create" />
      </div>
    </>
  );
}
