// app/[locale]/admin/settings/currency-form.tsx

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

export default function CurrencyForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availableCurrencies",
  });

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const availableCurrencies = watch("availableCurrencies");
  const defaultCurrency = watch("defaultCurrency");

  useEffect(() => {
    const validCode = availableCurrencies.map((lang) => lang.code);
    if (!validCode.includes(defaultCurrency)) {
      setValue("defaultCurrency", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availableCurrencies)]);

  const t = useTranslations("Settings");

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Currency")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              {/* CURRENCY NAME */}
              <FormField
                control={control}
                name={`availableCurrencies.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Name")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Name") })} />
                    </FormControl>
                    <FormMessage>{errors.availableCurrencies?.[index]?.name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* CURRENCY CODE */}
              <FormField
                control={control}
                name={`availableCurrencies.${index}.code`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Code")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Code") })} />
                    </FormControl>
                    <FormMessage>{errors.availableCurrencies?.[index]?.code?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* SYMBOL */}
              <FormField
                control={control}
                name={`availableCurrencies.${index}.symbol`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Symbol")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Symbol") })} />
                    </FormControl>
                    <FormMessage>{errors.availableCurrencies?.[index]?.symbol?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* CONVERT RATE */}
              <FormField
                control={control}
                name={`availableCurrencies.${index}.convertRate`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Convert Rate")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Convert Rate") })} />
                    </FormControl>
                    <FormMessage>{errors.availableCurrencies?.[index]?.convertRate?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* DELETE BUTTON - SAME LEVEL */}
              <div>
                {index == 0 && <div className="text-sm">{t("Action")}</div>}
                <Button
                  type="button"
                  variant={"outline"}
                  disabled={fields.length === 1}
                  className={`${index == 0 ? "mt-3" : ""}`}
                  onClick={() => remove(index)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* ADD CURRENCY */}
          <Button type="button" variant={"outline"} onClick={() => append({ name: "", code: "", symbol: "", convertRate: 1 })}>
            {t("Add name", { name: t("Currency") })}
          </Button>
        </div>

        {/* DEFAULT CURRENCY FORM */}
        <FormField
          control={control}
          name="defaultCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Default Currency")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies
                      .filter((x) => x.code)
                      .map((lang, index) => (
                        <SelectItem key={index} value={lang.code}>
                          {lang.name} ({lang.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultCurrency?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
