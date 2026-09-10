"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useWishlist from "@/store/use-wishlist";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";

export const useSaveWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slugs) =>
      request("/api/wishlist", { method: "PUT", body: { slugs } }),
    onSuccess: (body) => queryClient.setQueryData(keys.wishlist.all, body),
  });
};

export const useWishlistSync = () => {
  const merge = useWishlist((state) => state.merge);
  const { status } = useSession();
  const authenticated = status === "authenticated";
  const { mutate: save } = useSaveWishlist();

  const { data } = useQuery({
    queryKey: keys.wishlist.all,
    queryFn: ({ signal }) => request("/api/wishlist", { signal }),
    enabled: authenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!authenticated || !data) return;

    const remote = data.slugs ?? [];
    const union = [...new Set([...useWishlist.getState().slugs, ...remote])];

    merge(remote);

    if (union.length !== remote.length) save(union);
  }, [authenticated, data, merge, save]);
};

export default useWishlistSync;
