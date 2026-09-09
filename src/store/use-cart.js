"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "company-store-cart";

const useCart = create()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set(({ items }) =>
          items.some((item) => item.slug === product.slug)
            ? { items }
            : {
                items: [
                  ...items,
                  {
                    slug: product.slug,
                    sku: product.sku,
                    name: product.name,
                    image: product.image,
                    size: product.sizeLabel,
                    condition: product.condition,
                    quantity: 1,
                    unitCents: product.salePriceCents ?? product.priceCents,
                  },
                ],
              }
        ),

      removeItem: (slug) =>
        set(({ items }) => ({
          items: items.filter((item) => item.slug !== slug),
        })),

      has: (slug) => get().items.some((item) => item.slug === slug),

      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 3,
      migrate: (persisted, version) => (version < 3 ? { items: [] } : persisted),
    }
  )
);

export const selectCount = ({ items }) => items.length;

export const selectSubtotal = ({ items }) =>
  items.reduce((total, item) => total + item.unitCents, 0);

export default useCart;
