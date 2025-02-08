// app/admin/orders/[id]/page.tsx

import OrderDetailsForm from "@/components/shared/order/order-details-form";
import { getOrderById } from "@/lib/actions/order.actions";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;

  // 주문 정보 가져오기(서버 액션 호출) - 주문이 없으면 404, 세션 가져오기
  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  const isAdmin = session?.user?.role === "admin" || false;

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* 네비게이션 링크 */}
      <div className="flex mb-4">
        <Link href={"/admin/orders"}>Orders</Link>
        <span className="mx-1">{" > "}</span>
        <Link href={`/admin/orders/${order._id}`}>{order._id}</Link>
      </div>

      {/* 메인 폼 */}
      <OrderDetailsForm order={order} isAdmin={isAdmin} />
    </main>
  );
};

export default OrderDetailsPage;
