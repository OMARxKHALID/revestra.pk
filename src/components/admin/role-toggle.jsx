"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { ROLE } from "@/lib/roles";
import { request } from "@/lib/api-client";

const RoleToggle = ({ id, name, role, self }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const promote = role !== ROLE.admin;
  const next = promote ? ROLE.admin : ROLE.customer;

  const change = useMutation({
    mutationFn: () =>
      request(`/api/admin/customers/${id}`, {
        method: "PATCH",
        body: { role: next },
      }),
    onSuccess: () => {
      toast.success(promote ? `${name} is now an admin` : `${name} is no longer an admin`);
      setOpen(false);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleConfirm = () => change.mutate();

  if (self)
    return <span className="text-xs text-muted-foreground">You</span>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {promote ? "Make admin" : "Remove admin"}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {promote ? `Make ${name} an admin?` : `Remove ${name} as admin?`}
          </DialogTitle>
          <DialogDescription>
            {promote
              ? "Admins can see every order and customer, change prices and site settings, and manage other admins."
              : "They keep their customer account and orders, and lose the back office within five minutes."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>

          <Button
            variant={promote ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={change.isPending}
          >
            {change.isPending ? "Saving…" : promote ? "Make admin" : "Remove admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleToggle;
