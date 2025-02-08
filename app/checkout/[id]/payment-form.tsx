// app/checkout/[id]/payment-form.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { IOrder } from "@/lib/db/models/order.model";
import { redirect, useRouter } from "next/navigation";
import { usePayPalScriptReducer, PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { approvePayPalOrder, createPayPalOrder } from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import CheckoutFooter from "../checkout-footer";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { clog } from "@/lib/jlogger";

// Stripe 결제을 위한 Stripe SDK 불러오기
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeForm from "./stripe-form";

// OrderPaymentForm 컴포넌트 외부에서 Stripe 클라이언트 결제를 위한 publishable key를 가져온다.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function OrderPaymentForm({
  order, // 주문 내역
  paypalClientId, // 페이팔 클라이언트 ID
  clientSecret, // Stripe 결제를 위한 client_secret 추가
}: {
  order: IOrder;
  paypalClientId: string;
  clientSecret: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, shippingAddress, paymentMethod, expectedDeliveryDate, itemsPrice, shippingPrice, taxPrice, totalPrice, isPaid } = order;

  // 1). 완료된 주문인 경우 리다이렉션 처리 (order.isPaid === true)
  if (order.isPaid) {
    redirect(`/account/orders/${order._id}`);
  }

  // clientSecret 로그 확인
  // clog.info("[OrderPaymentForm]: clientSecret", clientSecret);

  // 2). 로딩 함수 정의(PayPal SDK 로딩 상태를 표시)
  function ShowLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = "";
    if (isPending) {
      status = "Loading PayPal ...";
    } else if (isRejected) {
      status = "Error in loading PayPal.";
    }
    return status;
  }

  // 3) 초기 결제 처리 함수를 정의한다.
  const handleCreatePayPalOrder = async () => {
    try {
      const response = await createPayPalOrder(order._id);

      // if (!response.success) {
      if (!response.success) {
        throw new Error(response?.message || "Throw - Failed to create PayPal order");
      }
      return response.data;
    } catch (error) {
      clog.error("[handleCreatePayPalOrder]: function error: ", error);
      return null;
    }
  };

  // 4). 결제 승인 처리 함수 정의
  // const handleApprovePayPalOrder = async (data: { orderId: string }) => {
  // data 타입 불일치에 대한 수정
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const response = await approvePayPalOrder(order._id, data);
    toast({
      description: response.message,
      variant: response.success ? "default" : "destructive",
    });
  };

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        <div>
          <div className="text-lg font-bold">Order Summary</div>
          {/* ITEM PRICE */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items: </span>
              <span>
                {" "}
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            {/* SHIPPING PRICE */}
            <div className="flex justify-between">
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? "--" : shippingPrice === 0 ? "FREE" : <ProductPrice price={shippingPrice} plain />}
              </span>
            </div>
            {/* TAX */}
            <div className="flex justify-between">
              <span> Tax: </span>
              <span>{taxPrice === undefined ? "--" : <ProductPrice price={taxPrice} plain />}</span>
            </div>
            {/* TOTAL PRICE */}
            <div className="flex justify-between pt-1 font-bold text-lg">
              <span>Order Total: </span>
              <span>
                {" "}
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {/* 결제 전이라면 페이팔 버튼 노출 */}
            {!isPaid && paymentMethod === "PayPal" && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <ShowLoadingState />
                  <PayPalButtons createOrder={handleCreatePayPalOrder} onApprove={handleApprovePayPalOrder} />
                </PayPalScriptProvider>
              </div>
            )}

            {/* STRIPE를 선택한 경우 처리 */}
            {!isPaid && paymentMethod === "Stripe" && clientSecret && (
              <Elements
                options={{
                  clientSecret, // client_secret 추가
                }}
                stripe={stripePromise}>
                <StripeForm priceInCents={Math.round(order.totalPrice * 100)} orderId={order._id} />
              </Elements>
            )}

            {/* 비용지불되기 전이고 Cash On Deliver 를 선택했다면 버튼 보여주기  */}
            {!isPaid && paymentMethod === "Cash On Delivery" && (
              <Button className="w-full rounded-full" onClick={() => router.push(`/account/orders/${order._id}`)}>
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 5). 메인 컴포넌트
  return (
    <main className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        {/* MAIN SECTION - 75% */}
        <div className="md:col-span-3">
          {/* Shipping Address - 배송 주소 */}
          <div>
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">
                <span>Shipping Address</span>
              </div>
              <div className="col-span-2">
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode},
                  ${shippingAddress.country} `}
                </p>
              </div>
            </div>
          </div>
          {/* PAYMENT METHOD */}
          <div className="border-y">
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">
                <span>Payment Method</span>
              </div>
              <div className="col-span-2">
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>
          {/* 주문 항목 */}
          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="flex text-lg font-bold">
              <span>Items and shipping</span>
            </div>
            <div className="col-span-2">
              <p>Delivery date: {formatDateTime(expectedDeliveryDate).dateOnly}</p>
              <ul>
                {items.map((item) => (
                  <li key={`${item.product}-${item.slug}-${item.color}-${item.size}`}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* SUMMARY - MOBILE */}
          <div className="block md:hidden">
            <CheckoutSummary />
          </div>

          {/* CHECKOUT FOOTER */}
          <CheckoutFooter />
        </div>
        {/* SUMMARY - DESKTOP */}
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
