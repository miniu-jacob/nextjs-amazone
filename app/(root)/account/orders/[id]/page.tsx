// app/(root)/account/orders/[id]/page.tsx

import { getOrderById } from "@/lib/actions/order.actions";
import { auth } from "@/lib/auth";
import { formatId } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetailsForm from "../../../../../components/shared/order/order-details-form";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return {
    title: `Order ${formatId(params.id)}`,
  };
}

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  // 1). 결제 페이지에서 '/account/orders/[id]' 경로로 이동하면 해당 주문 ID를 가져온다.
  const params = await props.params;
  const { id } = params;

  // 2). id(주문id)를 기반으로 주문 정보를 가져온다.
  const order = await getOrderById(id);
  if (!order) notFound();

  // 3). 사용자 정보를 가져온다.
  const session = await auth();

  // 4). 주문 정보를 보여준다.
  return (
    <>
      <div className="flex gap-2">
        <Link href={"/account"}>Your Account</Link>
        <span>{">"}</span>
        <Link href={"/account/orders"}>Your Orders</Link>
        <span>{">"}</span>
        <span>Order {formatId(order._id)}</span>
      </div>
      <h1 className="h1-bold py-4">Order {formatId(order._id)}</h1>
      <OrderDetailsForm order={order} isAdmin={session?.user?.role === "admin" || false} />
    </>
  );
}
