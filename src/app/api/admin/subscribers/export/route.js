import { guard } from "@/lib/api/admin/guard";
import { listSubscribers } from "@/lib/api/subscribers";
import { toCsv, csvResponse } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { header: "Email", value: (subscriber) => subscriber.email },
  {
    header: "Joined",
    value: (subscriber) =>
      subscriber.createdAt ? new Date(subscriber.createdAt).toISOString() : "",
  },
];

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const { subscribers } = await listSubscribers({ page: 1, perPage: 5000 });
  const stamp = new Date().toISOString().slice(0, 10);

  return csvResponse(`subscribers-${stamp}.csv`, toCsv(COLUMNS, subscribers));
};
