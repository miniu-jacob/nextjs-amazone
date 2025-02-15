// app/[locale]/admin/settings/common-form.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COLORS, THEMES } from "@/lib/constants";
import { ISettingInput } from "@/types";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";

export default function CommonForm({ form, id }: { form: UseFormReturn<ISettingInput>; id: string }) {
  const { control } = form;
  const t = useTranslations("Settings");

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t("Common Setting")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* COMMON PAGE SIZE & FREE SHIPPING MIN PRICE */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="common.pageSize"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Page Size")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Page Size") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="common.freeShippingMinPrice"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Free Shipping Minimum Price")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Enter name", { name: t("Free Shipping Minimum Price") })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* DEFAULT COLOR & THEME */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="common.defaultColor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Default Color")}</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select a color")} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color, index) => (
                        <SelectItem key={index} value={color}>
                          {t(`${color}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="common.defaultTheme"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Default Theme")}</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select a theme")} />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((theme, index) => (
                        <SelectItem key={index} value={theme}>
                          {t(`${theme}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* MAINTENANCE MODE */}
        <div>
          <FormField
            control={control}
            name="common.isMaintenanceMode"
            render={({ field }) => (
              <FormItem className="space-x-2 items-center">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t("Maintenance Mode")}</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
