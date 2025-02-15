// app/[locale]/admin/settings/setting-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useSettingStore from "@/hooks/use-setting-store";
import { useToast } from "@/hooks/use-toast";
import { updateSetting } from "@/lib/actions/setting.actions";
import { SettingInputSchema } from "@/lib/validator";
import { ClientSetting, ISettingInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SiteInfoForm from "./site-info-form";
import CommonForm from "./common-form";
import CarouselForm from "./carousel-form";
import LanguageForm from "./language-form";
import CurrencyForm from "./currency-form";
import PaymentMethodForm from "./payment-method-form";
import DeliveryDateForm from "./delivery-date-form";

const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  // 설정을 변경하기 위해서는 설정을 저장, 관리해야 한다. 이를 위해 useSettingStore에서 setSetting을 가져온다.
  const { setSetting } = useSettingStore();

  // clog.info("[SettingForm] setting", setting.availableCurrencies);
  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema),
    defaultValues: setting,
  });

  const {
    formState: { isSubmitting },
  } = form;

  const { toast } = useToast();
  async function onSubmit(values: ISettingInput) {
    const res = await updateSetting({ ...values });
    // 결과가 성공이 아니면 토스트 팝업

    if (!res.success) {
      toast({ variant: "destructive", description: res.message });
    } else {
      toast({ description: res.message });
    }

    // DB 업데이트가 성공이면 설정도 업데이트한다.
    setSetting(values as ClientSetting);
  }
  return (
    <Form {...form}>
      <form className="space-y-4" method="post" onSubmit={form.handleSubmit(onSubmit)}>
        <SiteInfoForm id="setting-site-info" form={form} />
        <CommonForm id="setting-common" form={form} />
        <CarouselForm id="setting-carousels" form={form} />
        <LanguageForm id="setting-languages" form={form} />
        <CurrencyForm id="setting-currencies" form={form} />
        <PaymentMethodForm id="setting-payment-methods" form={form} />
        <DeliveryDateForm id="setting-delivery-dates" form={form} />
        <div>
          <Button type="submit" size={"lg"} disabled={isSubmitting} className="w-full mb-24">
            {isSubmitting ? "Submitting..." : "Save Setting"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingForm;
