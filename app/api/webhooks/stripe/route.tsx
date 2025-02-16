// app/api/webhooks/stripe/route.tsx

import Stripe from "stripe";
import Order from "@/lib/db/models/order.model";
import "@/lib/db/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { sendPurchaseReceipt } from "@/emails";
import { connectToDatabase } from "@/lib/db";

// API 함수의 최대 실행 시간을 설정한다.
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  // 1). 이벤트를 검증한다. Stripe객체에서 제공하는 webhooks.constructEvent() 메소드를 사용한다.
  // clog.log("[Stripe Webhook] Event received");
  const event = await stripe.webhooks.constructEvent(
    await req.text(), // 요청의 본문을 문자열로 변환한다. 첫번째 인자로 전달한다.
    req.headers.get("stripe-signature") as string, // stripe-signature 헤더를 두번째 인자로 전달한다.
    process.env.STRIPE_WEBHOOK_SECRET as string, // stripe webhook secret을 세번째 인자로 전달한다.
  );

  // clog.log("[Stripe Webhook]:event type", event?.type);

  // 2). 이벤트 타입이 charge.succeeded인 경우(결제 성공)에만 처리한다.
  if (event.type === "charge.succeeded") {
    // 3). 이벤트 객체에서 결제 관련 정보를 추출한다.
    const charge = event.data.object;
    const orderId = charge.metadata.orderId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;

    // 4). 주문을 DB에서 조회한다.
    await connectToDatabase();
    const order = await Order.findById(orderId).populate("User", "email");
    if (order == null) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // clog.info("[Stripe Webhook] Order found", order);

    // 5) 결제 정보를 업데이트한다.
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: event.id, // Stripe 결제 ID (charge.id 가 아니라 event.id 로 해야 한다.)
      status: "COMPLETED", // 결제 상태
      email_address: email!, // 결제 이메일
      pricePaid: (pricePaidInCents / 100).toFixed(2), // 결제 금액
    };

    // 6). 주문을 저장하고 이메일을 발송한다.
    await order.save();

    try {
      await sendPurchaseReceipt({ order });
    } catch (error) {
      console.error("[Stripe Webhook] Error sending email to user", error);
    }
    return NextResponse.json({
      message: "updateOrderToPaid was successful",
    });
  }
  return new NextResponse();
}
