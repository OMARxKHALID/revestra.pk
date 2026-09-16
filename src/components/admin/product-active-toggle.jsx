"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { request } from "@/lib/api-client";

const ProductActiveToggle = ({ slug, name, active }) => {
  const router = useRouter();

  const toggle = useMutation({
    mutationFn: (next) =>
      request(`/api/admin/products/${slug}`, {
        method: "PATCH",
        body: { active: next },
      }),
    onSuccess: (_body, next) => {
      toast.success(next ? `${name} is live` : `${name} is hidden`);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Switch
      checked={active}
      disabled={toggle.isPending}
      aria-label={`Show ${name} on the storefront`}
      onCheckedChange={(next) => toggle.mutate(next)}
    />
  );
};

export default ProductActiveToggle;
