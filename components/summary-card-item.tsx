import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardItemProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  onClick: () => void;
  iconColor?: string;
  amountColor?: string;
  hoverBorderColor?: string;
}

export function SummaryCardItem({
  title,
  amount,
  icon: Icon,
  onClick,
  iconColor,
  amountColor,
  hoverBorderColor,
}: SummaryCardItemProps) {
  return (
    <Card
      className={cn(
        "min-w-0 py-3 gap-2 md:py-6 md:gap-6 cursor-pointer transition-all hover:scale-[1.02]",
        hoverBorderColor
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", amountColor)}>
          {amount}
        </div>
        <p className="text-xs text-muted-foreground">
          Clique para ver relatório
        </p>
      </CardContent>
    </Card>
  );
}
