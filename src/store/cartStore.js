import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getCartKey = ({ productId, productType, color, size }) => {
  return [productType ?? 'product', productId, color || 'none', size || 'none'].join(':');
};

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (item) => {
        const cartKey = getCartKey(item);

        set((state) => {
          const existingItem = state.items.find((cartItem) => cartItem.id === cartKey);

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  id: cartKey,
                },
              ],
            };
          }

          const stock = Number(existingItem.stock ?? item.stock);
          const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;

          return {
            items: state.items.map((cartItem) =>
              cartItem.id === cartKey
                ? {
                    ...cartItem,
                    quantity: Math.min(maxQuantity, cartItem.quantity + item.quantity),
                  }
                : cartItem
            ),
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) {
              return item;
            }

            const stock = Number(item.stock);
            const maxQuantity =
              Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;

            return {
              ...item,
              quantity: Math.min(maxQuantity, Math.max(1, quantity)),
            };
          }),
        }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      removeItems: (itemIds) => {
        const targetIds = new Set(itemIds);

        set((state) => ({
          items: state.items.filter((item) => !targetIds.has(item.id)),
        }));
      },

      clearCart: () => {
        set({
          items: [],
        });
      },
    }),
    {
      name: 'arc-cart',
    }
  )
);
