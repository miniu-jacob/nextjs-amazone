// app/[locale]/admin/settings/delivery-date-form.tsx

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

export default function DeliveryDateForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availableDeliveryDates",
  });

  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const availableDeliveryDates = watch("availableDeliveryDates");
  const defaultDeliveryDate = watch("defaultDeliveryDate");

  // availableDeliveryDates 가 변경되면 defaultDeliveryDate 를 리셋한다.
  useEffect(() => {
    const validCodes = availableDeliveryDates.map((lang) => lang.name);
    if (!validCodes.includes(defaultDeliveryDate)) {
      setValue("defaultDeliveryDate", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availableDeliveryDates)]);

  const t = useTranslations("Settings");

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Delivery Dates")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t("Text Guide")}</p>
          {/* NAME */}
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={control}
                name={`availableDeliveryDates.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Delivery Dates")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Code") })} />
                    </FormControl>
                    <FormMessage>{errors.availableDeliveryDates?.[index]?.name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* DAYS */}
              <FormField
                control={control}
                name={`availableDeliveryDates.${index}.daysToDeliver`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("DaysToDeliver")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("DaysToDeliver") })} />
                    </FormControl>
                    <FormMessage>{errors.availableDeliveryDates?.[index]?.daysToDeliver?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Shipping Price */}
              <FormField
                control={control}
                name={`availableDeliveryDates.${index}.shippingPrice`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t("Shipping Price")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("Shipping Price") })} />
                    </FormControl>
                    <FormMessage>{errors.availableDeliveryDates?.[index]?.shippingPrice?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* FREE SHIPPING MIN PRICE */}
              <FormField
                control={control}
                name={`availableDeliveryDates.${index}.freeShippingMinPrice`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel className="text-nowrap">{t("FreeShippingMinPrice")}</FormLabel>}
                    <FormControl>
                      <Input className="text-sm" {...field} placeholder={t("Enter name", { name: t("FreeShippingMinPrice") })} />
                    </FormControl>
                    <FormMessage>{errors.availableDeliveryDates?.[index]?.freeShippingMinPrice?.message}</FormMessage>
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
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* ADD DELIVERY DATE BUTTON */}
          <Button
            type="button"
            variant={"outline"}
            onClick={() => append({ name: "", daysToDeliver: 0, shippingPrice: 0, freeShippingMinPrice: 0 })}>
            {t("Add DeliveryDate")}
          </Button>
        </div>

        {/* DEFAULT DELIVERY DATE */}
        <FormField
          control={control}
          name="defaultDeliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Default DeliveryDate")}</FormLabel>
              <FormControl>
                <Select value={field.value || ""} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a delivery date")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDeliveryDates
                      .filter((x) => x.name)
                      .map((lang, index) => (
                        <SelectItem key={index} value={lang.name}>
                          {lang.name} ({lang.name})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultDeliveryDate?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
