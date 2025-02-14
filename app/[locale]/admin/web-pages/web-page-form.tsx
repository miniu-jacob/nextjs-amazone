// app/[locale]/admin/web-pages/web-page-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createWebPage, updateWebPage } from "@/lib/actions/web-page.actions";
import { IWebPage } from "@/lib/db/models/web-page-model";
import { toSlug } from "@/lib/utils";
import { WebPageInputSchema, WebPageUpdateSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "react-markdown-editor-lite/lib/index.css";

// Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import ReactMarkdown from "react-markdown";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

const webPageDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        title: "Sample Page",
        slug: "sample-page",
        content: "Sample Content",
      }
    : {
        title: "",
        slug: "",
        content: "",
      };

const WebPageForm = ({ type, webPage, webPageId }: { type: "Create" | "Update"; webPage?: IWebPage; webPageId?: string }) => {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const form = useForm<z.infer<typeof WebPageInputSchema>>({
    resolver: type === "Update" ? zodResolver(WebPageUpdateSchema) : zodResolver(WebPageInputSchema),
    defaultValues: webPage && type === "Update" ? webPage : webPageDefaultValues,
  });

  async function onSubmit(values: z.infer<typeof WebPageInputSchema>) {
    if (type === "Create") {
      const res = await createWebPage(values);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        toast({ description: res.message });
        router.push("/admin/web-pages");
      }
    }
    if (type === "Update") {
      if (!webPageId) {
        router.push("/admin/web-pages");
        return;
      }
      const res = await updateWebPage({ ...values, _id: webPageId });

      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        toast({ title: "Success", description: "Web Page updated successfully. Security reason, only Owner can update" });
        router.push("/admin/web-pages");
      }
    }
  }

  return (
    <Form {...form}>
      <form method="post" className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        {/* TITLE & SLUG + AUTO GENERATION BUTTON */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Product.Title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Product.Enter title name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Product.Slug")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder={t("Product.Enter slug name")} {...field} />
                    <Button
                      type="button"
                      size={"sm"}
                      variant={"outline"}
                      className="border-none absolute top-0.5 right-0.5"
                      // className="absolute right-2 top-2.5" (일반 버튼 기준)
                      onClick={() => {
                        form.setValue("slug", toSlug(form.getValues("title")));
                      }}>
                      {t("Product.Generate")}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* MARKDOWN EDITOR LITE */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Common.Content")}</FormLabel>
                <FormControl>
                  <MdEditor
                    {...field}
                    style={{ height: "500px" }}
                    view={{ menu: true, md: true, html: true }}
                    renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                    onChange={({ text }) => form.setValue("content", text)}
                    placeholder={`${t("Common.Content")} ...`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* CHECKBOX FORM FIELD */}
        <div>
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="space-x-2 items-center">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t("Product.Is Published")}</FormLabel>
              </FormItem>
            )}
          />
        </div>
        {/* SUBMIT BUTTON */}
        <div>
          <Button type="submit" size={"lg"} disabled={form.formState.isSubmitting} className="button col-span-2 w-full">
            {/* {form.formState.isSubmitting ? "Submitting..." : `${type} Page`} */}
            {form.formState.isSubmitting ? t("Product.Submitting") : t("Product.type Product", { type: t(`Product.${type}`) })}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WebPageForm;
