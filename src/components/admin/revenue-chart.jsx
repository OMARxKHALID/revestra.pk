"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils/price";

const config = {
  revenue: { label: "Revenue", color: "var(--chart-2)" },
};

const shortDay = (day) =>
  new Date(day).toLocaleDateString("en-PK", { day: "numeric", month: "short" });

const RevenueChart = ({ series }) => {
  const data = series.map((point) => ({
    day: point.day,
    revenue: point.revenueCents / 100,
    orders: point.orders,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Settled orders, last 30 days</CardDescription>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={config} className="h-[220px] w-full sm:h-[280px]">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={shortDay}
            />

            <YAxis hide domain={[0, "dataMax + 10"]} />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={shortDay}
                  formatter={(value) => formatPrice(Math.round(value * 100))}
                />
              }
            />

            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              fill="url(#revenue-fill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
