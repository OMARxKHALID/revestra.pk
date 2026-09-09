import {
  Card,
  CardContent,
  CardDescription,
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
import { listSubscribers } from "@/lib/api/admin/subscribers";

export const dynamic = "force-dynamic";

const SubscribersPage = async () => {
  const subscribers = await listSubscribers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>
          {subscribers.length} addresses from the newsletter form.
        </CardDescription>
      </CardHeader>

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
                  <TableCell className="break-all">{subscriber.email}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {subscriber.createdAt
                      ? new Date(subscriber.createdAt).toLocaleDateString("en-PK")
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
      </CardContent>
    </Card>
  );
};

export default SubscribersPage;
