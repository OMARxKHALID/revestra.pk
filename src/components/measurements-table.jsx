import cn from "@/lib/utils/cn";
import { META, SPEC } from "@/lib/type";
import { measurementList } from "@/lib/utils/stock";

const MeasurementsTable = ({ product }) => {
  const rows = measurementList(product);

  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <p className={cn(META, "text-ink-soft")}>Measurements, laid flat</p>

      <dl className="mt-3 divide-y divide-rule border-y border-rule">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between py-2.5">
            <dt className={cn(SPEC, "text-ink-muted")}>{label}</dt>
            <dd className={cn(SPEC, "tabular-nums text-ink")}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default MeasurementsTable;
