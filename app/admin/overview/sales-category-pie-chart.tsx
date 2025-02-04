// app/admin/overview/sales-category-pie-chart.tsx

"use client";

import useColorStore from "@/hooks/use-color-store";
import { useTheme } from "next-themes";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SalesCategoryPieChart({ data }: { data: any[] }) {
  // 색상 적용을 위해 Theme과 useColorStore를 사용한다.
  const { theme } = useTheme();
  const { cssColors } = useColorStore(theme);

  // RADIAN 정의
  const RADIAN = Math.PI / 180;

  // 차트 조각(파이) 내부에 라벨을 배치하기 위한 함수
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }: any) => {
    // 중심 좌표
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={cssColors.text} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-xs">
        {`${data[index]._id} ${data[index].totalSales} sales`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width={"100%"} height={400}>
      <PieChart width={400} height={400}>
        <Pie data={data} dataKey={"totalSales"} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${cssColors["--primary"]})`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
