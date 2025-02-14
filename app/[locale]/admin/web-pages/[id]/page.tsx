// app/[locale]/admin/web-pages/[id]/page.tsx

import { getWebPageById } from "@/lib/actions/web-page.actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import WebPageForm from "../web-page-form";
import { getTranslations } from "next-intl/server";

type UpdateWebPageProps = {
  params: Promise<{ id: string }>;
};

const UpdateWebPage = async (props: UpdateWebPageProps) => {
  const params = await props.params;

  const { id } = params;

  const t = await getTranslations();

  // 웹 페이지를 가져오는 서버 액션 호출
  const webPage = await getWebPageById(id);
  if (!webPage) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* 네비게이션 링크 */}
      <div className="flex mb-4 gap-2 text-sm">
        <Link href={"/admin/web-pages"}>{t("Common.Web Pages")}</Link>
        <span>{" > "}</span>
        <Link href={`/admin/web-pages/${webPage._id}`}>{webPage.title}</Link>
      </div>

      {/* 메인 폼 */}
      <div className="my-8">
        <WebPageForm type="Update" webPage={webPage} webPageId={webPage._id} />
      </div>
    </main>
  );
};

export default UpdateWebPage;
