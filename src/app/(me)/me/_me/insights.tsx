import AreaChart, { Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import XAxis from "@/components/charts/x-axis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Generate 30 days of random spending data
function generateSpendingData() {
  const data = [];
  for (let day = 1; day <= 30; day++) {
    const hasSpending = Math.random() > 0.6; // 40% chance of purchase
    const originalPrice = hasSpending
      ? Math.floor(Math.random() * 8000 + 2000)
      : 0; // $2k-$10k
    const totalCost =
      originalPrice > 0
        ? Math.floor(originalPrice * (Math.random() * 0.3 + 0.4))
        : 0; // 40-70% discount
    data.push({
      date: `Apr ${day}`,
      originalPrice,
      totalCost,
    });
  }
  return data;
}

const weeklySpendingData = generateSpendingData();

export default function Insights() {
  const totalOriginal = weeklySpendingData.reduce(
    (sum, item) => sum + item.originalPrice,
    0,
  );
  const totalSpent = weeklySpendingData.reduce(
    (sum, item) => sum + item.totalCost,
    0,
  );
  const totalSavings = totalOriginal - totalSpent;
  const savingsPercent =
    totalOriginal > 0 ? ((totalSavings / totalOriginal) * 100).toFixed(1) : 0;

  return (
    <div className="w-full grid grid-cols-3 gap-4 items-start">
      <Card className="col-span-2 h-full">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Spending Overview</CardTitle>
            <Badge variant="success" className="text-xs">
              {savingsPercent}% Saved
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Original price vs what you paid with discounts
          </p>
        </CardHeader>
        <CardContent className="pt-6 flex-1 flex flex-col">
          <AreaChart data={weeklySpendingData} className="flex-1 max-h-[40dvh]">
            <Grid horizontal />
            <Area
              dataKey="originalPrice"
              fill="var(--chart-4)"
              stroke="var(--chart-4)"
              fillOpacity={0.3}
            />
            <Area
              dataKey="totalCost"
              fill="var(--chart-2)"
              stroke="var(--chart-2)"
              fillOpacity={0.8}
            />
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        </CardContent>
      </Card>

      {/* Summary Stats Card */}
      <div className="space-y-4 flex flex-col h-full">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
              <p className="text-2xl font-bold text-green-600">
                ${(totalSavings / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Discount Rate
              </p>
              <p className="text-xl font-semibold">{savingsPercent}%</p>
            </div>
            <div className="pt-2 border-t space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Original Total</span>
                <span className="font-semibold">
                  ${(totalOriginal / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">You Paid</span>
                <span className="font-semibold">
                  ${(totalSpent / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Savings Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-xs text-muted-foreground">
              <li>Set up price alerts for your favorite products.</li>
              <li>Use coupons and promo codes at checkout.</li>
              <li>Shop during sales events like Black Friday.</li>
              <li>Consider buying refurbished or open-box items.</li>
              <li>Join loyalty programs for exclusive discounts.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
