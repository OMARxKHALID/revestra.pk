const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?[\d\s().-]+$/;

const escape = (value) => {
  if (value === null || value === undefined) return "";

  const raw = String(value);
  const text =
    typeof value === "string" && FORMULA_START.test(raw) && !PLAIN_NUMBER.test(raw)
      ? `'${raw}`
      : raw;

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (columns, rows) =>
  [
    columns.map(({ header }) => escape(header)).join(","),
    ...rows.map((row) =>
      columns.map(({ value }) => escape(value(row))).join(",")
    ),
  ].join("\r\n");

export const csvResponse = (filename, body) =>
  new Response(`﻿${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
