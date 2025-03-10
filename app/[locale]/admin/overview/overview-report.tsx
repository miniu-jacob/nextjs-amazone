// app/[locale]/admin/overview/overview-report.tsx

"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderSummary } from "@/lib/actions/order.actions";
import { calculatePastDate, formatDateTime, formatNumber } from "@/lib/utils";
import { BadgeDollarSign, Barcode, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { CalendarDateRangePicker } from "./date-range-picker";
import SalesAreaChart from "./sales-area-chart";
import TableChart from "./table-chart";
import SalesCategoryPieChart from "./sales-category-pie-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IOrderList } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export default function OverviewReport() {
  const t = useTranslations();
  const locale = useLocale();
  // 날짜 범위 관리
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30), // 30일 전
    to: new Date(), // 오늘
  });

  // getOrderSummary()를 통해 가져온 데이터를 저장할 데이터 상태 관리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  // 날짜 범위를 바꾸면 데이터를 다시 가져오도록 useEffect 사용
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        setData(await getOrderSummary(date));
      });
    }
  }, [date]);

  // 데이터 로딩 전 로딩 UI 표시
  if (!data)
    return (
      <div className="space-y-4">
        <div>
          <h1 className="h1-bold">Dashboard</h1>
        </div>
        {/* FIRST ROW */}
        <div className="flex gap-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>

        {/* SECOND ROW */}
        <div>
          <Skeleton className="h-[30rem] w-full" />
        </div>

        {/* THIRD ROW */}
        <div className="flex gap-4">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-60 w-full" />
          ))}
        </div>

        {/* FOURTH ROW */}
        <div className="flex gap-4">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-60 w-full" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="p-2">
      {/* TITLE & CALENDAR DATE RANGE PICKER */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="h1-bold">{t("Admin.Dashboard")}</h1>
        {/* <div>Calendar Date Range Picker</div> */}
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>
      {/* GRID */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* REVENUE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Admin.Total Revenue")}</CardTitle>
              <BadgeDollarSign />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                <ProductPrice price={data.totalSales} plain />
              </div>
              <div>
                <Link className="text-xs" href={"/admin/orders"}>
                  {t("Admin.View revenue")}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ORDERS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Admin.Sales")}</CardTitle>
              <CreditCard />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatNumber(data.ordersCount)}</div>
              <div>
                <Link href={"admin/orders"} className="text-xs">
                  {t("Admin.View orders")}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* USERS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Admin.Customers")}</CardTitle>
              <Users />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{data.usersCount}</div>
              <div>
                <Link href={"/admin/users"} className="text-xs">
                  {t("Admin.View customers")}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* PRODUCTS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Admin.Products")}</CardTitle>
              <Barcode />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{data.productsCount}</div>
              <div>
                <Link href={"/admin/products"} className="text-xs">
                  {t("Admin.View products")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHART - SALES   */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("Admin.Sales Overview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesAreaChart data={data.salesChartData} />
            </CardContent>
          </Card>
        </div>

        {/* CHART - TABLE */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Admin.How much you’re earning")}</CardTitle>
              <CardDescription>
                {t("Admin.Estimated")} · {t("Admin.Last 6 months")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.monthlySales} labelType="month" />
            </CardContent>
          </Card>
          {/* CHART - TABLE - PRODUCTS */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Admin.Product Performance")}</CardTitle>
              <CardDescription>
                {t("DatePicker.From", { from: formatDateTime(date!.from!, locale).dateOnly })} -{" "}
                {t("DatePicker.To", { to: formatDateTime(date!.to!, locale).dateOnly })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.topSalesProducts} labelType="product" />
            </CardContent>
          </Card>
        </div>

        {/* CHART - RECENT SALES */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Admin.Best-Selling Categories")}</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesCategoryPieChart data={data.topSalesCategories} />
            </CardContent>
          </Card>
          {/* RECENT ORDER LIST */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Admin.Recent Sales")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Admin.Buyer")}</TableHead>
                    <TableHead>{t("Admin.Date")}</TableHead>
                    <TableHead>{t("Admin.Total")}</TableHead>
                    <TableHead className="text-start px-6">{t("Admin.Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestOrders.map((order: IOrderList) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.user ? order.user.name : t("Admin.Deleted User")}</TableCell>
                      <TableCell>{formatDateTime(order.createdAt).dateOnly}</TableCell>
                      <TableCell>
                        <ProductPrice price={order.totalPrice} plain />
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order._id}`}>
                          <span className="px-2">{t("Admin.Details")}</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
