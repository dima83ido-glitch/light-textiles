import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  productIds: string[];
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isFavorite: (productId) => get().productIds.includes(productId),
    }),
    { name: "light-textiles-favorites" },
  ),
);
