import { formatPrice } from "@/lib/utils/price";

const normalise = (city) => String(city ?? "").trim().toLowerCase();

export const codProblem = ({ commerce, totalCents, city }) => {
  const max = commerce?.codMaxCents ?? 0;
  const cities = commerce?.codCities ?? [];

  if (max > 0 && totalCents > max)
    return `Cash on delivery is available up to ${formatPrice(max)}`;

  const allowed = cities.map(normalise);

  if (allowed.length > 0 && normalise(city) && !allowed.includes(normalise(city)))
    return `Cash on delivery is not available in ${String(city).trim()}`;

  return null;
};
