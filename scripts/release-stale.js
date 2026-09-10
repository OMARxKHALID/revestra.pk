const secret = process.env.CRON_SECRET?.trim();
const site =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const minutes = Number(process.argv[2] ?? 60);

if (!secret) {
  console.error("CRON_SECRET is not set. Add it to .env.local.");
  process.exit(1);
}

if (!Number.isFinite(minutes) || minutes < 5) {
  console.error("Usage: bun run release-stale [minutes >= 5]");
  process.exit(1);
}

const endpoint = new URL("/api/admin/cron/release-stale", site).toString();

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-cron-secret": secret },
    body: JSON.stringify({ minutes }),
  });

  if (!response.ok) {
    console.error(
      `The release endpoint answered ${response.status}. Check CRON_SECRET and that the site is running at ${site}.`
    );
    process.exit(1);
  }

  const { examined, released } = await response.json();

  if (released.length === 0) {
    console.log(
      `No abandoned orders older than ${minutes} minutes (${examined} examined).`
    );
  }

  for (const order of released)
    console.log(`Released ${order.lines} line(s) from ${order.reference}.`);
} catch (error) {
  console.error(`Could not reach ${endpoint}: ${error.message}`);
  process.exitCode = 1;
}
