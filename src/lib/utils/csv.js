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

export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let started = false;

  const endField = () => {
    row.push(started && quoted ? field : field.trim());
    field = "";
    quoted = false;
    started = false;
  };

  const endRow = () => {
    endField();

    if (row.some((value) => value !== "")) rows.push(row);

    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char !== '"') {
        field += char;
        continue;
      }

      if (text[index + 1] === '"') {
        field += '"';
        index += 1;
        continue;
      }

      quoted = false;
      continue;
    }

    if (char === '"' && !started) {
      quoted = true;
      started = true;
      continue;
    }

    if (char === ",") {
      endField();
      continue;
    }

    if (char === "\r") continue;

    if (char === "\n") {
      endRow();
      continue;
    }

    field += char;
    started = true;
  }

  if (field !== "" || row.length > 0) endRow();

  if (rows.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...body] = rows;
  const headers = headerRow.map((header) =>
    header.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s_]+/g, "")
  );

  return {
    headers,
    rows: body.map((values) =>
      Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""]))
    ),
  };
};
