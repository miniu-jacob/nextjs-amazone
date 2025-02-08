// emails/index.tsx

import { SENDER_EMAIL, SENDER_NAME } from "@/lib/constants";
import { IOrder } from "@/lib/db/models/order.model";
import { Resend } from "resend";
import PurchaseReceiptEmail from "./purchase-receipt";
import AskReviewOrderItemsEmail from "./ask-review-order-items";

// (1). Resend 라이브러리를 초기화하여 이메일 전송을 위한 설정을 할 수 있다.
const resend = new Resend(process.env.RESEND_API_KEY as string);

// (2). 주문 정보를 받아 이에 기반한 이메일을 전송한다.
export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  // (3). Resend 라이브러리를 통해 초기화한 resend 객체의 emails.send 메서드를 호출하여 이메일을 전송한다.

  const emailTo = (order.user as { email: string }).email;

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: emailTo,
    subject: `Order Confirmation`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};

// 3). 리뷰 요청 이메일 함수를 추가한다.
export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  // 하루 뒤에 리뷰 요청 메일을 보낼 수 있도록 24시간 뒤의 시간을 정의해 준다.
  const oneDayFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const rightNow = new Date(Date.now()).toISOString();
  const emailTo = (order.user as { email: string }).email;

  // default() 에러 방지를 위해 emailHtml로 정의한 후에 시도

  // Resend 라이브러리를 통해 이메일을 전송한다.
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: emailTo, // 주문자의 이메일로 이메일을 전송한다.
    subject: "Review your order items",
    // react 속성에 리뷰 요청 이메일 컴포넌트를 전달한다.
    react: <AskReviewOrderItemsEmail order={order} />,
    scheduledAt: oneDayFromNow, //  24시간 뒤에 이메일을 전송한다.
    // scheduledAt: rightNow,  <----- 테스트를 위해 즉시로 변경한다.
  });
};
