"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { request } from "@/lib/api-client";

const ProductImport = () => {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [report, setReport] = useState(null);

  const run = useMutation({
    mutationFn: (dryRun) =>
      request("/api/admin/products/import", { body: { csv, dryRun } }),
    onSuccess: (result, dryRun) => {
      setReport({ ...result, dryRun });

      if (dryRun) {
        toast.success(
          `${result.ready.length} of ${result.checked} rows are ready`
        );
        return;
      }

      toast.success(
        result.created.length === 1
          ? "1 piece added"
          : `${result.created.length} pieces added`
      );
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCsv(await file.text());
    setReport(null);
  };

  const handleCheck = () => run.mutate(true);
  const handleImport = () => run.mutate(false);

  const ready = report?.ready?.length ?? 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a file</CardTitle>
          <CardDescription>
            One piece per row, up to 200 rows. Prices are in rupees. Separate
            list values with | and write measurements as Waist=32&quot;|Inseam=30&quot;.
            Categories must already exist.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV file</Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="csv-text">Or paste the rows</Label>
            <Textarea
              id="csv-text"
              rows={8}
              value={csv}
              onChange={(event) => {
                setCsv(event.target.value);
                setReport(null);
              }}
              placeholder="name,tagline,brand,category,..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCheck}
              disabled={run.isPending || csv.trim() === ""}
            >
              {run.isPending ? "Working…" : "Check the file"}
            </Button>

            <Button
              type="button"
              onClick={handleImport}
              disabled={run.isPending || !report?.dryRun || ready === 0}
            >
              {ready > 0 ? `Import ${ready} pieces` : "Import"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              render={<a href="/api/admin/products/import" download />}
            >
              Download the template
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>
              {report.dryRun ? "Check" : "Import"} results
            </CardTitle>
            <CardDescription>
              {report.dryRun
                ? `${ready} of ${report.checked} rows are ready to import.`
                : `${report.created.length} of ${report.checked} rows were added.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 text-sm">
            {report.problems.length > 0 && (
              <ul className="grid gap-2">
                {report.problems.map((problem) => (
                  <li
                    key={`${problem.line}-${problem.error}`}
                    className="flex flex-wrap items-baseline gap-2 border-b border-border pb-2 last:border-0"
                  >
                    <Badge variant="destructive">Row {problem.line}</Badge>
                    <span className="font-medium">{problem.name || "—"}</span>
                    <span className="text-muted-foreground">{problem.error}</span>
                  </li>
                ))}
              </ul>
            )}

            {report.dryRun && ready > 0 && (
              <p className="text-muted-foreground">
                Ready: {report.ready.map(({ name }) => name).join(", ")}
              </p>
            )}

            {!report.dryRun && report.created.length > 0 && (
              <p className="text-muted-foreground">
                Added: {report.created.map(({ slug }) => slug).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductImport;
