// app/[locale]/admin/setting/site-info-form.tsx
/* eslint-disable @next/next/no-img-element */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { ISettingInput } from "@/types";
import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";

export default function SiteInfoForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  // form 에서 필요항목들을 꺼낸다.
  const { watch, control } = form;
  const siteLogo = watch("site.logo");
  const t = useTranslations("Settings");
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Site Info")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SITE NAME, URL */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Name") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={"site.url"}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Url")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Url") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* SITE LOGO */}
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full text-left">
            <FormField
              control={control}
              name="site.logo"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("Logo")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter name", { name: t("image url") })} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SITE LOGO 가 있는 경우 버튼을 클릭하면 삭제되도록 */}
            {siteLogo && (
              <div className="flex my-2 items-center gap-4">
                <img src={siteLogo} alt="logo" width={48} height={48} />
                <Button type="button" variant={"outline"} onClick={() => form.setValue("site.logo", "")}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
            {!siteLogo && (
              <UploadButton
                className="!items-start py-2"
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  form.setValue("site.logo", res[0].url);
                }}
                onUploadError={(error: Error) => {
                  toast({ variant: "destructive", description: `ERROR! ${error.message}` });
                }}
              />
            )}
          </div>
          {/* SITE DESCRIPTION */}
          <FormField
            control={control}
            name="site.description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Description")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("Enter name", { name: t("Description") })} className="h-40" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* SITE SLOGAN & KEYWORDS */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.slogan"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Slogan")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Slogan") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.keywords"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Keywords")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Keywords") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* SITE PHONE & EMAIL */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Phone")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Phone") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("email address") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* SITE ADDRESS & COPYRIGHT */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Address")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Address") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.copyright"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Copyright")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Copyright") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
