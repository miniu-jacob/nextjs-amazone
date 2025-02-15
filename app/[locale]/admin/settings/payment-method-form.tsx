// app/[locale]/admin/settings/payment-method-form.tsx

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

export default function PaymentMethodForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availablePaymentMethods",
  });

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const availablePaymentMethods = watch("availablePaymentMethods");
  const defaultPaymentMethod = watch("defaultPaymentMethod");

  // availablePaymentMethods가 변경되면 defaultPaymentMethod를 리셋한다.
  useEffect(() => {
    const validCode = availablePaymentMethods.map((lang) => lang.name);
    if (!validCode.includes(defaultPaymentMethod)) {
      setValue("defaultPaymentMethod", "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availablePaymentMethods)]);

  const t = useTranslations("Settings");

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Payment Methods")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={control}
                name={`availablePaymentMethods.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Name")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Name") })} />
                    </FormControl>
                    <FormMessage>{errors.availablePaymentMethods?.[index]?.name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* COMMISSION */}
              <FormField
                control={control}
                name={`availablePaymentMethods.${index}.commission`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Commission")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Commission") })} />
                    </FormControl>
                    <FormMessage>{errors.availablePaymentMethods?.[index]?.commission?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* DELETE BUTTON - SAME LEVEL */}
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

          {/* ADD PAYMENT METHOD */}
          <Button type="button" variant={"outline"} onClick={() => append({ name: "", commission: 0 })}>
            {t("Add PaymentMethod")}
          </Button>
        </div>

        {/* DEFAULT PAYMENT METHOD */}
        <FormField
          control={control}
          name={"defaultPaymentMethod"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Default PaymentMethod")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a payment method")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods
                      .filter((x) => x.name)
                      .map((lang, index) => (
                        <SelectItem key={index} value={lang.name}>
                          {lang.name} ({lang.name})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultPaymentMethod?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
