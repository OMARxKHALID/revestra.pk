import cn from "@/lib/utils/cn";
import { META, SPEC } from "@/lib/type";
import { measurementList } from "@/lib/utils/stock";

const MeasurementsTable = ({ product }) => {
  const rows = measurementList(product);

  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <p className={cn(META, "text-black/45")}>Measurements, laid flat</p>

      <dl className="mt-3 divide-y divide-black/10 border-y border-black/10">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between py-2.5">
            <dt className={cn(SPEC, "text-black/70")}>{label}</dt>
            <dd className={cn(SPEC, "tabular-nums text-black")}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default MeasurementsTable;
