// components/shared/order/order-details-form.tsx

"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IOrder } from "@/lib/db/models/order.model";
import { cn, formatDateTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ActionButton from "../action-button";
import { deliverOrder, updateOrderToPaid } from "@/lib/actions/order.actions";

export default function OrderDetailsForm({
  order, // 주문 내역을 매개변수로 받는다.
  isAdmin, // 관리자 여부를 매개변수로 받는다.
}: {
  order: IOrder;
  isAdmin: boolean;
}) {
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order;

  return (
    <div className="grid md:grid-cols-3 md:gap-5">
      <div className="overflow-x-auto md:col-span-2 space-y-4">
        <Card>
          {/* 배송주소 */}
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Shipping Address</h2>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.province}, {shippingAddress.postalCode},{" "}
              {shippingAddress.country}{" "}
            </p>

            {/* 배송 상태 */}
            {isDelivered ? (
              <Badge>Delivered at {formatDateTime(deliveredAt!).dateTime}</Badge>
            ) : (
              <div>
                {" "}
                <Badge variant={"destructive"}>Not delivered</Badge>
                <div>Expected delivery at {formatDateTime(expectedDeliveryDate!).dateTime}</div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* 결제 방법 */}
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Payment Method</h2>
            <p>{paymentMethod}</p>
            {isPaid ? <Badge>Paid at {formatDateTime(paidAt!).dateTime}</Badge> : <Badge variant={"destructive"}>Not Paid</Badge>}
          </CardContent>
        </Card>
        {/* 아이템 요약 */}
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link href={`/product/${item.slug}`} className="flex items-center">
                        <Image src={item.image} alt={item.name} width={50} height={50} />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="px-2">{item.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {/* 결제 요약 파트 */}
      <div>
        <Card>
          <CardContent className="p-4 gap-4 space-y-4">
            <h2 className="text-xl pb-4">Order Summary</h2>
            {/* ITEM PRICE */}
            <div className="flex justify-between">
              <div>Items</div>
              <div>
                {" "}
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            {/* TAX */}
            <div className="flex justify-between">
              <div>Tax</div>
              <div>
                {" "}
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            {/* SHIPPING */}
            <div className="flex justify-between">
              <div>Shipping</div>
              <div>
                {" "}
                <ProductPrice price={shippingPrice} plain />
              </div>
            </div>
            {/* TOTAL  */}
            <div className="flex justify-between">
              <div>Total</div>
              <div>
                {" "}
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>
            {/* 결제 전인 경우 */}
            {!isPaid && ["Stripe", "PayPal"].includes(paymentMethod) && (
              <Link className={cn(buttonVariants(), "w-full")} href={`/checkout/${order._id}`}>
                Pay Order
              </Link>
            )}

            {/* 배송 전인 경우 (Admin) */}
            {isAdmin && !isPaid && paymentMethod === "Cash On Delivery" && (
              <ActionButton caption="Mark as Paid" action={() => updateOrderToPaid(order._id)} />
            )}
            {/* 관리자이고 결제완료했지만 배송 전인 경우 */}
            {isAdmin && isPaid && !isDelivered && <ActionButton caption="Mark as delivered" action={() => deliverOrder(order._id)} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
