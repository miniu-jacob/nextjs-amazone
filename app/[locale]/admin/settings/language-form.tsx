// app/[locale]/admin/settings/language-form.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ISettingInput } from "@/types";
import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

export default function LanguageForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  // react-hook-form 에서 제공하는 useFieldArray를 사용한다.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availableLanguages",
  });

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const availableLanguages = watch("availableLanguages");
  const defaultLanguage = watch("defaultLanguage");

  // availableLanguages가 변경되면 defaultLanguage 를 리셋한다.
  useEffect(() => {
    const validCodes = availableLanguages.map((lang) => lang.code);
    if (!validCodes.includes(defaultLanguage)) {
      setValue("defaultLanguage", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availableLanguages)]);

  const t = useTranslations("Settings");
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Language")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              {/* LANGUAGE NAME */}
              <FormField
                control={control}
                name={`availableLanguages.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>{t("Name")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Language") })} />
                    </FormControl>
                    <FormMessage>{errors.availableLanguages?.[index]?.name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`availableLanguages.${index}.code`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>{t("Code")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Code") })} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* BUTTON */}
              <div>
                {index == 0 && <div className="text-sm">{t("Action")}</div>}
                <Button
                  type="button"
                  disabled={fields.length === 1}
                  variant={"outline"}
                  className={`${index == 0 ? "mt-3" : ""}`}
                  onClick={() => remove(index)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* ADD A LANGUAGE */}
          <Button type="button" variant={"outline"} onClick={() => append({ name: "", code: "" })}>
            {t("Add Language")}
          </Button>
        </div>

        {/* DEFAULT LANGUAGE */}
        <FormField
          control={control}
          name="defaultLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Default Language")}</FormLabel>
              <FormControl>
                <Select value={field.value || ""} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a language")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages
                      .filter((x) => x.code)
                      .map((lang, index) => (
                        <SelectItem key={index} value={lang.code}>
                          {lang.name} ({lang.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultLanguage?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
