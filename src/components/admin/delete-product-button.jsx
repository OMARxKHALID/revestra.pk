"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
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

const DeleteProductButton = ({ slug, name }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () =>
      request(`/api/admin/products/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(`${name} removed`);
      setOpen(false);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDelete = () => remove.mutate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${name}`} />
        }
      >
        <HugeiconsIcon icon={Delete02Icon} size={16} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            This removes the piece from the catalogue for good. Pieces that
            appear on an order cannot be deleted — mark those sold instead.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductButton;
