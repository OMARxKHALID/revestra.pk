"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { request } from "@/lib/api-client";

const ReviewRow = ({ review }) => {
  const router = useRouter();
  const hidden = review.status === "hidden";

  const toggle = useMutation({
    mutationFn: () =>
      request("/api/admin/reviews", {
        method: "PATCH",
        body: { id: review.id, status: hidden ? "published" : "hidden" },
      }),
    onSuccess: () => {
      toast.success(hidden ? "Published" : "Hidden");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleToggle = () => toggle.mutate();

  return (
    <article className="grid gap-3 border-b border-border py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="neutral">{review.rating}/5</Badge>
          <span className="text-sm font-medium">{review.title}</span>
          {review.verified && <Badge variant="success">Verified buyer</Badge>}
          {hidden && <Badge variant="warning">Hidden</Badge>}
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
        disabled={toggle.isPending}
      >
        {hidden ? "Publish" : "Hide"}
      </Button>
    </article>
  );
};

export default ReviewRow;
