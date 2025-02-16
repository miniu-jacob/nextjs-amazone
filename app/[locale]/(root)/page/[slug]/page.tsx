// app/[locale]/(root)/page/[slug]/page.tsx

import { getWebPageBySlug } from "@/lib/actions/web-page.actions";
import { clog } from "@/lib/jlogger";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  // params 로부터 slug 를 가져와서
  const params = await props.params;
  const { slug } = params;

  // DB 에서 조회하여 title을 return 한다.
  const webPage = await getWebPageBySlug(slug);

  if (!webPage) notFound();

  return { title: webPage.title };
}

export default async function ProductDetailsPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page: string; color: string; size: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  clog.info("[ProductDetailsPage]fetching page with slug ", slug);
  const webPage = await getWebPageBySlug(slug);

  clog.info("[ProductDetailsPage] webPage", webPage?.title);
  if (!webPage) notFound();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="h1-bold py-4">{webPage.title}</h1>
      <section className="text-justify text-lg mb-20 web-page-content">
        <ReactMarkdown>{webPage.content}</ReactMarkdown>
      </section>
    </div>
  );
}
