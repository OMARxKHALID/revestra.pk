"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ReviewRow = ({ review }) => {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const hidden = review.status === "hidden";

  const handleToggle = async () => {
    setWorking(true);

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: review.author,
          createdAt: new Date(review.createdAt).toISOString(),
          status: hidden ? "published" : "hidden",
        }),
      });

      if (!response.ok) {
        toast.error("Could not update that review");
        return;
      }

      toast.success(hidden ? "Published" : "Hidden");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <article className="grid gap-3 border-b border-border py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{review.rating}/5</Badge>
          <span className="text-sm font-medium">{review.title}</span>
          {review.verified && <Badge variant="secondary">Verified buyer</Badge>}
          {hidden && <Badge variant="outline">Hidden</Badge>}
        </div>

        <p className="text-sm text-muted-foreground">{review.body}</p>

        <p className="text-xs text-muted-foreground">
          {review.author} · {new Date(review.createdAt).toLocaleDateString("en-PK")}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={working}
      >
        {hidden ? "Publish" : "Hide"}
      </Button>
    </article>
  );
};

export default ReviewRow;
