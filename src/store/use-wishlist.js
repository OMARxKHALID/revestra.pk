"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "general-store-wishlist";

const useWishlist = create()(
  persist(
    (set, get) => ({
      slugs: [],

      toggle: (slug) =>
        set(({ slugs }) => ({
          slugs: slugs.includes(slug)
            ? slugs.filter((entry) => entry !== slug)
            : [...slugs, slug],
        })),

      remove: (slug) =>
        set(({ slugs }) => ({
          slugs: slugs.filter((entry) => entry !== slug),
        })),

      merge: (incoming) =>
        set(({ slugs }) => ({ slugs: [...new Set([...slugs, ...incoming])] })),

      has: (slug) => get().slugs.includes(slug),

      clear: () => set({ slugs: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
    }
  )
);

export const selectWishlistCount = ({ slugs }) => slugs.length;

export default useWishlist;
