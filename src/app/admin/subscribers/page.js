import { Mail01Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ExportButton from "@/components/admin/export-button";
import NewsletterComposer from "@/components/admin/newsletter-composer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pager from "@/components/admin/pager";
import { listSubscribers } from "@/lib/api/subscribers";
import { listNewsletters } from "@/lib/api/admin/newsletters";
import { listQuerySchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

const SubscribersPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const [{ subscribers, total, page, perPage }, newsletters] = await Promise.all([
    listSubscribers(query),
    listNewsletters(),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title="Subscribers"
        description={`${total} addresses from the newsletter form.`}
        icon={Mail01Icon}
      >
        <ExportButton href="/api/admin/subscribers/export" />
      </PageHeader>

      <NewsletterComposer
        subscribers={total}
        emailConfigured={Boolean(process.env.RESEND_API_KEY?.trim())}
      />

      {newsletters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent sends</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-2 text-sm">
            {newsletters.map((entry) => (
              <div
                key={`${entry.sentAt}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2 last:border-0"
              >
                <span className="font-medium">{entry.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.sentAt).toLocaleString("en-PK")} · sent{" "}
                  {entry.sent}
                  {entry.failed > 0 ? `, ${entry.failed} failed` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.email}>
                    <TableCell className="break-all">
                      {subscriber.email}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {subscriber.createdAt
                        ? new Date(subscriber.createdAt).toLocaleDateString(
                            "en-PK"
                          )
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}

                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Nobody has signed up yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 sm:px-0">
            <Pager page={page} perPage={perPage} total={total} />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default SubscribersPage;
