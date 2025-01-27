// app/checkout/[id]/stripe-form.tsx

import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import { SERVER_URL } from "@/lib/constants";

export default function StripeForm({
  priceInCents, // 결제 금액
  orderId, // 주문 ID
}: {
  priceInCents: number;
  orderId: string;
}) {
  // Stripe 객체를 가져온다.
  const stripe = useStripe();
  const elements = useElements();

  // 결제 상태(결제 처리 중인지 여부) 관리
  const [isLoading, setIsLoading] = useState(false);

  // 결제 중 발생한 에러 처리
  const [errorMessage, setErrorMessage] = useState<string>();

  // 결제 이메일 관리
  const [email, setEmail] = useState<string>();

  // 결제 폼 제출 처리
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null || email == null) return;

    setIsLoading(true);
    stripe
      .confirmPayment({
        elements, // Stripe 요소
        confirmParams: { return_url: `${SERVER_URL}/checkout/${orderId}/stripe-payment-success` },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred'");
        }
      })
      .finally(() => setIsLoading(false));
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="text-xl">Stripe Checkout</div>
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      <PaymentElement />
      <div>
        <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
      </div>
      <Button className="w-full" size={"lg"} disabled={stripe == null || elements == null || isLoading}>
        {isLoading ? (
          "Purchasing..."
        ) : (
          <div className="">
            Purchase - <ProductPrice price={priceInCents / 100} plain />
          </div>
        )}
      </Button>
    </form>
  );
}
