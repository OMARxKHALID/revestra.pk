import { HugeiconsIcon } from "@hugeicons/react";
import { TrendingDownIcon, TrendingUpIcon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import cn from "@/lib/utils/cn";

export const KpiCard = ({
  title,
  value,
  change,
  trend,
  period,
  icon,
  className,
}) => {
  const isPositive = trend === "up";
  const trendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className={cn("@container/card gap-2", className)}>
      <CardHeader className="pb-2">
        <div>
          <CardDescription className="text-xs">{title}</CardDescription>
          <CardTitle className="text-lg font-semibold tabular-nums sm:text-xl @[250px]/card:text-2xl">
            {value}
          </CardTitle>
        </div>

        <CardAction>
          {icon && (
            <HugeiconsIcon
              icon={icon}
              size={16}
              className="text-muted-foreground"
            />
          )}

          {change && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <HugeiconsIcon icon={trendIcon} size={12} />
              {change}
            </Badge>
          )}
        </CardAction>
      </CardHeader>

      {period && (
        <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
          {trend && (
            <div className="line-clamp-1 flex gap-1 font-medium">
              {isPositive ? "Trending up" : "Down this period"}
              <HugeiconsIcon icon={trendIcon} size={12} />
            </div>
          )}
          <div className="text-muted-foreground">{period}</div>
        </CardFooter>
      )}
    </Card>
  );
};

export const KpiCardsGrid = ({ children, className }) => (
  <div
    className={cn(
      "grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card",
      className
    )}
  >
    {children}
  </div>
);
