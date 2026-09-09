export const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

export const fillDailySeries = (rows, days = 30, now = new Date()) => {
  const totals = new Map(rows.map((row) => [row.day, row]));
  const series = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);

    date.setUTCDate(date.getUTCDate() - offset);

    const day = dayKey(date);
    const row = totals.get(day);

    series.push({
      day,
      revenueCents: row?.revenueCents ?? 0,
      orders: row?.orders ?? 0,
    });
  }

  return series;
};

export const sinceDays = (days, now = new Date()) => {
  const date = new Date(now);

  date.setUTCDate(date.getUTCDate() - (days - 1));
  date.setUTCHours(0, 0, 0, 0);

  return date;
};
