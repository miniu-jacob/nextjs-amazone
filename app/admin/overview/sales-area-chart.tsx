// app/admin/overview/sales-area-chart.tsx
"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Card, CardContent } from "@/components/ui/card";
import useColorStore from "@/hooks/use-color-store";
import { formatDateTime } from "@/lib/utils";
import { useTheme } from "next-themes";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";

// 툴팁 인터페이스
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  // 툴팁이 활성화(마우스가 올라가 있는 경우) -> 데이터가 있는 경우(payload.length)
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="p-2">
          {/* 날짜를 formatDateTime() 을 사용하여 YYYY/MM/DD 형식으로 변환 */}
          <p>{label && formatDateTime(new Date(label)).dateOnly}</p>
          <p className="text-primary text-xl">
            <ProductPrice price={payload[0].value} plain />
          </p>
        </CardContent>
      </Card>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <text x={x} y={y + 10} textAnchor="left" fill="#666" className="text-xs">
      {formatDateTime(new Date(payload.value)).dateOnly}
      {/* {`${payload.value.split('/')[1]}/${payload.value.split('/')[2]}`} */}
    </text>
  );
};

// STROKE COLORS
const STROKE_COLORS: { [key: string]: { [key: string]: string } } = {
  Red: { light: "#980404", dark: "#ff3333" },
  Green: { light: "#015001", dark: "#06dc06" },
  Gold: { light: "#ac9103", dark: "#f1d541" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SalesAreaChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const { color } = useColorStore(theme);

  return (
    <ResponsiveContainer width={"100%"} height={400}>
      <AreaChart data={data}>
        <CartesianGrid />
        <XAxis dataKey="date" tick={<CustomXAxisTick />} interval={3} />
        <YAxis fontSize={12} tickFormatter={(value: number) => `$${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type={"monotone"} dataKey={"totalSales"} stroke={STROKE_COLORS[color.name][theme || "light"]} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
