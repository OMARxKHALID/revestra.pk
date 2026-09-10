"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageLayout from "@/components/admin/page-layout";
import { describeError } from "@/lib/errors";
import { reportError } from "@/lib/track";

const AdminError = ({ error, reset }) => {
  const described = describeError(error);

  useEffect(() => {
    reportError(error, { boundary: "admin" });
  }, [error]);

  return (
    <PageLayout>
      <Card role="alert">
        <CardHeader>
          <CardTitle>{described.title}</CardTitle>
          <CardDescription>{described.message}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={reset}>Try again</Button>

          {error?.digest && (
            <span className="text-xs text-muted-foreground">
              Reference {error.digest}
            </span>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default AdminError;
