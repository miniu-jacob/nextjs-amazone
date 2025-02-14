// app/[locale]/admin/web-pages/page.tsx

import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteWebPage, getAllWebPages } from "@/lib/actions/web-page.actions";
import { IWebPage } from "@/lib/db/models/web-page-model";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Web Pages",
};

export default async function WebPageAdminPage() {
  // 모든 웹 페이지를 가져온다.
  const t = await getTranslations();
  const webPages = await getAllWebPages();

  return (
    <div className="space-y-2 p-2">
      {/* TITLE AREA */}
      <div className="flex-between">
        <h1 className="h1-bold">{t("Common.Web Pages")}</h1>
        <Button asChild variant={"default"}>
          <Link href={"/admin/web-pages/create"}>{t("Common.type name", { type: t("Common.Create"), name: t("Common.WebPage") })} </Link>
        </Button>
      </div>

      {/* TABLE AREA */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("Common.Id")}</TableHead>
              <TableHead>{t("Common.Name")}</TableHead>
              <TableHead>{t("Product.Slug")}</TableHead>
              <TableHead>{t("Common.isPublished")}</TableHead>
              <TableHead className="w-[100px]">{t("Common.Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webPages.map((webPage: IWebPage) => (
              <TableRow key={webPage._id}>
                <TableCell>{formatId(webPage._id)}</TableCell>
                <TableCell>{webPage.title}</TableCell>
                <TableCell>{webPage.slug}</TableCell>
                <TableCell>{webPage.isPublished ? "Yes" : "No"}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/admin/web-pages/${webPage._id}`}>{t("Common.Edit")}</Link>
                  </Button>
                  <DeleteDialog id={webPage._id} action={deleteWebPage} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
