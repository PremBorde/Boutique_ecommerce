import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItemType {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  color: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface CouponType {
  code: string;
  percentOff: number;
  minOrderValue: number;
  maxDiscount?: number | null;
}

interface CartStore {
  items: CartItemType[];
  coupon: CouponType | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: CartItemType) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setCoupon: (coupon: CouponType | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentQty = updated[existingIndex].quantity;
            const newQty = Math.min(
              currentQty + newItem.quantity,
              newItem.maxStock
            );
            updated[existingIndex].quantity = newQty;
            return { items: updated, isDrawerOpen: true };
          } else {
            const safeQty = Math.min(newItem.quantity, newItem.maxStock);
            return {
              items: [...state.items, { ...newItem, quantity: safeQty }],
              isDrawerOpen: true,
            };
          }
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.variantId !== variantId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.variantId === variantId
                ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                : item
            ),
          };
        });
      },

      setCoupon: (coupon) => set({ coupon }),

      clearCart: () => set({ items: [], coupon: null }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const { coupon } = get();
        const subtotal = get().getSubtotal();
        if (!coupon || subtotal < coupon.minOrderValue) return 0;
        const discountAmount = (subtotal * coupon.percentOff) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          return coupon.maxDiscount;
        }
        return Math.round(discountAmount);
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        // Complimentary white-glove shipping on orders above ₹10,000
        if (subtotal === 0 || subtotal >= 10000) return 0;
        return 500;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const shipping = get().getShipping();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "zaria-atelier-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);
