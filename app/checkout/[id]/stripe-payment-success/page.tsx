// app/checkout/[id]/stripe-payment-success/page.tsx

import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import { clog } from "@/lib/jlogger";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ payment_intent: string }> }) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();

  // 결제 성공 페이지에서는 Stripe의 PaymentIntent API를 사용하여 결제 정보를 가져온다.
  const paymentIntent = await stripe.paymentIntents.retrieve(searchParams.payment_intent);
  if (paymentIntent.metadata.orderId == null || paymentIntent.metadata.orderId !== order._id.toString()) {
    return notFound();
  }
  // 결제가 성공적으로 완료되었는지 확인한다. 완료가 아니라면 다시 결제 페이지로 리다이렉션한다.
  clog.log("[Stripe Payment Success] Payment Intent", paymentIntent);
  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) return redirect(`/checkout/${id}`);

  // 화면 보여주기
  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Thanks for your purchase</h1>
        <div>We are now processing your order.</div>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
}
