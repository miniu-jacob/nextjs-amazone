// app/checkout/[id]/page.tsx

import { auth } from "@/lib/auth";
import { Metadata } from "next";
import OrderPaymentForm from "./payment-form";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Payment",
};

interface CheckoutPaymentPageProps {
  params: Promise<{ id: string }>;
}

const CheckoutPaymentPage = async ({ params }: CheckoutPaymentPageProps) => {
  // ID 값을 가져온다.
  const { id } = await params;

  // 주문 내역을 가져온다.
  const order = await getOrderById(id);
  if (!order) notFound();

  // 세션 정보를 가져온다.
  const session = await auth();

  // clog.info("CheckoutPaymentPage", { id, session });

  // Stripe 결제 추가를 위해 결제 의도(Payment Intent)를 생성하고 이를 처리하기 위한 client_secret 값을 추가한다.
  let client_secret = null;
  // Stripe 결제를 선택하고 결제가 완료된 주문이 아닌 경우에 stripe의 PaymentIntent API를 사용한다.
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // 결제 금액, 단위는 센트
      currency: "USD", // 통화
      metadata: { orderId: order._id }, // 주문 ID
    });
    client_secret = paymentIntent.client_secret;
  }

  // 결제 폼을 보여주며 파라미터로 주문 내역(order) 결제 업체 clientId, Admin여부를 전달한다.
  return (
    <OrderPaymentForm
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      clientSecret={client_secret}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};
export default CheckoutPaymentPage;
