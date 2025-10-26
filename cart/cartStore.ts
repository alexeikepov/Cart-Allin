import { create } from "zustand";
import { getUserFullData } from "./action";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  categories: any[];
  products: any[];
  serverCart: any[];

  isLoading: boolean;

  addItem: (item: CartItem) => void;
  setData: (data: {
    categories?: any[];
    products?: any[];
    serverCart?: any[];
  }) => void;
  setLoading: (val: boolean) => void;
  refreshData: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  categories: [],
  products: [],
  serverCart: [],
  isLoading: false,

  addItem: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    }),

  setData: (data) =>
    set((state) => ({
      categories: data.categories ?? state.categories,
      products: data.products ?? state.products,
      serverCart: data.serverCart ?? state.serverCart,
    })),

  setLoading: (val) => set({ isLoading: val }),

  refreshData: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const data = await getUserFullData();
      set({
        categories: data.categories,
        products: data.products,
        serverCart: data.cart,
      });
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
