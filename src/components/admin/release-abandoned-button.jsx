"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageRemoveIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { request } from "@/lib/api-client";

const ReleaseAbandonedButton = ({ count, minutes }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const release = useMutation({
    mutationFn: () =>
      request("/api/admin/orders/release-abandoned", { method: "POST", body: {} }),
    onSuccess: ({ released }) => {
      toast.success(
        released === 1 ? "Released 1 abandoned order" : `Released ${released} abandoned orders`
      );
      setOpen(false);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleRelease = () => release.mutate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" disabled={count === 0} />}
      >
        <HugeiconsIcon icon={PackageRemoveIcon} strokeWidth={2} />
        {count === 0 ? "No abandoned orders" : `Release ${count} abandoned`}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release abandoned orders?</DialogTitle>
          <DialogDescription>
            {count === 1 ? "1 order has" : `${count} orders have`} waited for
            payment for more than {minutes} minutes. Releasing cancels them and
            puts their pieces back on sale.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>

          <Button
            variant="destructive"
            onClick={handleRelease}
            disabled={release.isPending}
          >
            {release.isPending ? "Releasing…" : "Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseAbandonedButton;
