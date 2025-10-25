import { create } from "zustand";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

interface CartState {
  cart: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.cart.find((p) => p.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((p) =>
            p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
          ),
        };
      } else {
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }
    }),
  removeItem: (id) =>
    set((state) => ({
      cart: state.cart.filter((p) => p.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
}));
