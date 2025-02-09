// app/admin/orders/page.tsx

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { auth } from "@/lib/auth";
import { formatDateTime, formatId } from "@/lib/utils";
import { IOrderList } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export default async function OrdersPage(props: { searchParams: Promise<{ page: string }> }) {
  // props.searchParams 에서 searchParams를 추출한다.
  const searchParams = await props.searchParams;
  // searchParams에서 page를 추출한다. 값이 없으면 기본값을 1로 설정해 준다.
  const { page = "1" } = searchParams;

  // 권한 확인
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Admin permission required");

  // 화면에 보여줄 주문 목록을 가져온다.
  // getAllOrders 함수(서버액션)는 데이터를 반환할 때 배열 형태로 반환해야 한다.
  const orders = await getAllOrders({ page: Number(page) });

  return (
    <div className="space-y-2 p-2">
      <h1 className="h1-bold">Orders</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order: IOrderList) => (
              <TableRow key={order._id}>
                <TableCell>{formatId(order._id)}</TableCell>
                <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                <TableCell>{order.user ? order.user.name : "Deleted User"}</TableCell>
                <TableCell>
                  <ProductPrice price={order.totalPrice} plain />{" "}
                </TableCell>
                <TableCell>{order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : "No"}</TableCell>
                <TableCell>{order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : "No"}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/admin/orders/${order._id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order._id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 페이지네이션 추가 */}
        {orders.totalPages > 1 && <Pagination page={page} totalPages={orders.totalPages} />}
      </div>
    </div>
  );
}
