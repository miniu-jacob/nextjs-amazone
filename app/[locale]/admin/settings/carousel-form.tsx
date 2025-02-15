// app/[locale]/admin/settings/carousel-form.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { ISettingInput } from "@/types";
import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFieldArray, UseFormReturn } from "react-hook-form";

export default function CarouselForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  // react-hook-form 에서 제공하는 useFieldArray를 사용한다.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "carousels",
  });

  const {
    watch,
    formState: { errors },
  } = form;

  const t = useTranslations("Settings");

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Carousels")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-4 flex flex-col">
          {fields.map((field, index) => (
            <div key={field.id} className="w-full flex flex-col md:flex-row md:justify-between gap-1 text-sm">
              {/* TITLE */}
              <FormField
                control={form.control}
                name={`carousels.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>{t("Title")}</FormLabel>}
                    <FormControl>
                      <Input {...field} className="text-sm" placeholder={t("Enter name", { name: t("Title") })} />
                    </FormControl>
                    <FormMessage>{errors.carousels?.[index]?.title?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* DYNAMIC URL FIELD */}
              <FormField
                control={form.control}
                name={`carousels.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>{t("Url")}</FormLabel>}
                    <FormControl>
                      <Input {...field} className="text-sm" placeholder={t("Enter name", { name: t("Url") })} />
                    </FormControl>
                    <FormMessage>{errors.carousels?.[index]?.url?.message}</FormMessage>
                  </FormItem>
                )}
              />
              {/* BUTTON CAPTION */}
              <FormField
                control={form.control}
                name={`carousels.${index}.buttonCaption`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>{t("buttonCaption")}</FormLabel>}
                    <FormControl>
                      <Input {...field} className="text-sm" placeholder={t("Enter name", { name: t("buttonCaption") })} />
                    </FormControl>
                    <FormMessage>{errors.carousels?.[index]?.buttonCaption?.message}</FormMessage>
                  </FormItem>
                )}
              />
              {/* IMAGE FIELD */}
              <div>
                <FormField
                  control={form.control}
                  name={`carousels.${index}.image`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>{t("Image")}</FormLabel>}
                      <FormControl>
                        <Input {...field} className="text-sm" placeholder={t("Enter name", { name: t("image url") })} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WATCH를 사용하여 이미지를 추적한다. 있다면 이미지 표시, 없다면 업로드 버튼 표시 */}
                {watch(`carousels.${index}.image`) && (
                  <Image
                    src={watch(`carousels.${index}.image`)}
                    alt="image"
                    width={192}
                    height={68}
                    className="w-full object-cover object-center rounded-sm"
                  />
                )}
                {!watch(`carousels.${index}.image`) && (
                  <UploadButton
                    className="mt-2"
                    appearance={{
                      button: "w-full",
                    }}
                    endpoint={"imageUploader"}
                    onClientUploadComplete={(res) => {
                      form.setValue(`carousels.${index}.image`, res[0].url);
                    }}
                    onUploadError={(error: Error) => {
                      toast({ variant: "destructive", description: `ERROR! ${error.message}` });
                    }}
                  />
                )}
              </div>
              {/* DELETE IMAGE */}
              <div className="flex md:block items-center justify-between">
                {index !== 0 && <div className="text-sm"></div>}
                {index == 0 && <div className="text-sm">{t("Action")}</div>}
                <Button
                  type="button"
                  disabled={fields.length === 1}
                  variant={"outline"}
                  className={`${index == 0 ? "mt-2" : ""}`}
                  onClick={() => remove(index)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {/* ADD FIELD */}
          <Button type="button" variant={"outline"} onClick={() => append({ url: "", title: "", image: "", buttonCaption: "" })}>
            {t("Add a carousel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
