// app/checkout/[id]/page.tsx

import { auth } from "@/lib/auth";
import { Metadata } from "next";
import OrderPaymentForm from "./payment-form";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";

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

  // 결제 폼을 보여주며 파라미터로 주문 내역(order) 결제 업체 clientId, Admin여부를 전달한다.
  return (
    <div className="">
      <OrderPaymentForm order={order} paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"} isAdmin={session?.user?.role === "admin"} />
    </div>
  );
};
export default CheckoutPaymentPage;
