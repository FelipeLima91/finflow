import { Button } from "@/components/ui/button";
import { PeriodFilter, periodLabels } from "@/lib/summary-helpers";

interface PeriodFilterButtonsProps {
  value: PeriodFilter;
  onChange: (v: PeriodFilter) => void;
  options: { value: string; label: string }[];
}

export function PeriodFilterButtons({
  value,
  onChange,
  options,
}: PeriodFilterButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {(["all", "30days", "thisMonth"] as const).map((period) => (
        <Button
          key={period}
          variant={value === period ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(period)}
          className="text-xs"
        >
          {periodLabels[period]}
        </Button>
      ))}

      {options.length > 0 && (
        <select
          className="flex h-8 w-fit rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={value.includes("-") ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Selecionar mês...
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
