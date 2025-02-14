// app/[locale]/(root)/account/orders/page.tsx

import ProductPrice from "@/components/shared/product/product-price";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMyOrders } from "@/lib/actions/order.actions";
import { IOrder } from "@/lib/db/models/order.model";
import { formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";

const PAGE_TITLE = "My Orders"; // 페이지 제목 상수 정의

// 메타데이터 정의
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

type OrdersPageProps = {
  searchParams: Promise<{ page: string }>;
};

// 메인 함수
export default async function OrdersPage(props: OrdersPageProps) {
  // props에서 searchParams를 추출
  const searchParams = await props.searchParams; // searchParams를 await로 받아온다.
  const page = Number(searchParams.page) || 1; // page를 Number로 변환하여 page에 저장한다.
  // page정보를 매개변수로 주문 목록을 가져오는 서버 액션을 호출한다.
  const orders = await getMyOrders({ page }); // page를 매개변수로 전달한다.

  // 주문 목록을 출력한다.
  return (
    <div>
      {/* CURRENT MENU - 계정 페이지 이동 링크 */}
      <div className="flex gap-2">
        <Link href={"/account"}>Your Account</Link>
        <span>{">"}</span>
        <span>{PAGE_TITLE}</span>
      </div>
      {/* TITLE */}
      <h1 className="h1-bold pt-4">{PAGE_TITLE}</h1>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 주문이 없는 경우 */}
            {orders.data.length === 0 && (
              <TableRow>
                {/* colSpan: 해당 테이블 셀이 6개의 열(컬럼)을 차지하도록 설정 */}
                <TableCell colSpan={6}>You have no orders.</TableCell>
              </TableRow>
            )}

            {/* 주문이 있는 경우 */}
            {orders.data.map((order: IOrder) => (
              <TableRow key={order._id}>
                {/* 주문 아이디 */}
                <TableCell>
                  <Link href={`/account/orders/${order._id}`}>{formatId(order._id)}</Link>
                </TableCell>
                {/* 주문 날짜 */}
                <TableCell>{formatDateTime(order.createdAt!).dateTime}</TableCell>
                {/* 총 금액 */}
                <TableCell>
                  <ProductPrice price={order.totalPrice} plain />
                </TableCell>
                {/* 결제 여부 */}
                <TableCell>{order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : "No"}</TableCell>
                {/* 배송 여부 */}
                <TableCell>{order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : "No"}</TableCell>
                {/* 주문 상세 페이지 링크 */}
                <TableCell>
                  <Link href={`/account/orders/${order._id}`}>
                    <span className="px-2">Details</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 페이지네이션 컴포넌트 */}
        {orders.totalPages > 1 && (
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          <Pagination page={page} totalPages={orders?.totalPages!} />
        )}
      </div>
      {/* 최신 본 상품 목록 */}
      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
