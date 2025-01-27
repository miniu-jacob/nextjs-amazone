// emails/index.tsx

import { SENDER_EMAIL, SENDER_NAME } from "@/lib/constants";
import { IOrder } from "@/lib/db/models/order.model";
import { Resend } from "resend";
import PurchaseReceiptEmail from "./purchase-receipt";
import { formatId } from "@/lib/utils";

// (1). Resend 라이브러리를 초기화하여 이메일 전송을 위한 설정을 할 수 있다.
const resend = new Resend(process.env.RESEND_API_KEY as string);

// (2). 주문 정보를 받아 이에 기반한 이메일을 전송한다.
export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  // (3). Resend 라이브러리를 통해 초기화한 resend 객체의 emails.send 메서드를 호출하여 이메일을 전송한다.
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: `Order Confirmation`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
