import { create } from 'zustand';

import {
  clearStoredCartSnapshot,
  getCartOwnerId,
  getStoredCartSnapshot,
  setStoredCartSnapshot,
} from '@/utils/storage';

const CART_CHANNEL_NAME = 'arc-cart-sync-v1';
const TAB_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let cartChannel = null;

const getCartKey = ({ productId, productType, color, size }) => {
  return [productType ?? 'product', productId, color || 'none', size || 'none'].join(':');
};

const normalizeItems = (items) => (Array.isArray(items) ? items : []);

const getChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!cartChannel) {
    cartChannel = new BroadcastChannel(CART_CHANNEL_NAME);
  }

  return cartChannel;
};

const broadcastSnapshot = (snapshot) => {
  getChannel()?.postMessage({
    type: 'CART_UPDATED',
    sourceId: TAB_ID,
    snapshot,
  });
};

const mergeCartItems = (baseItems, incomingItems) => {
  const merged = new Map();

  for (const item of [...normalizeItems(baseItems), ...normalizeItems(incomingItems)]) {
    const id = item.id ?? getCartKey(item);
    const normalizedItem = {
      ...item,
      id,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };

    const existing = merged.get(id);

    if (!existing) {
      merged.set(id, normalizedItem);
      continue;
    }

    const stock = Number(existing.stock ?? normalizedItem.stock);
    const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;

    merged.set(id, {
      ...existing,
      ...normalizedItem,
      quantity: Math.min(maxQuantity, existing.quantity + normalizedItem.quantity),
    });
  }

  return [...merged.values()];
};

const createSnapshot = ({ ownerId, items, previousUpdatedAt = 0 }) => ({
  ownerId,
  items: normalizeItems(items),
  updatedAt: Math.max(Date.now(), Number(previousUpdatedAt) + 1),
});

const initialSnapshot = getStoredCartSnapshot();

export const useCartStore = create((set, get) => {
  const applySnapshot = (snapshot) => {
    set({
      ownerId: snapshot.ownerId,
      items: normalizeItems(snapshot.items),
      lastSyncedAt: Number(snapshot.updatedAt) || 0,
    });

    return normalizeItems(snapshot.items);
  };

  const commitItems = (items, ownerId = getCartOwnerId()) => {
    const state = get();
    const snapshot = createSnapshot({
      ownerId,
      items,
      previousUpdatedAt: state.lastSyncedAt,
    });

    setStoredCartSnapshot(snapshot);
    applySnapshot(snapshot);
    broadcastSnapshot(snapshot);

    return snapshot.items;
  };

  const ensureCurrentOwner = () => {
    const currentOwnerId = getCartOwnerId();
    const state = get();

    if (state.ownerId === currentOwnerId) {
      return state;
    }

    const nextSnapshot = getStoredCartSnapshot(currentOwnerId);
    applySnapshot(nextSnapshot);

    return get();
  };

  return {
    ownerId: initialSnapshot.ownerId,
    items: initialSnapshot.items,
    lastSyncedAt: initialSnapshot.updatedAt,

    addItem: (item) => {
      const state = ensureCurrentOwner();
      const cartKey = getCartKey(item);
      const existingItem = state.items.find((cartItem) => cartItem.id === cartKey);

      if (!existingItem) {
        commitItems([
          ...state.items,
          {
            ...item,
            id: cartKey,
            quantity: Math.max(1, Number(item.quantity) || 1),
          },
        ]);
        return;
      }

      const stock = Number(existingItem.stock ?? item.stock);
      const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;
      const incomingQuantity = Math.max(1, Number(item.quantity) || 1);

      commitItems(
        state.items.map((cartItem) =>
          cartItem.id === cartKey
            ? {
                ...cartItem,
                ...item,
                id: cartKey,
                quantity: Math.min(maxQuantity, cartItem.quantity + incomingQuantity),
              }
            : cartItem
        )
      );
    },

    updateQuantity: (itemId, quantity) => {
      const state = ensureCurrentOwner();

      commitItems(
        state.items.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const stock = Number(item.stock);
          const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;

          return {
            ...item,
            quantity: Math.min(maxQuantity, Math.max(1, Number(quantity) || 1)),
          };
        })
      );
    },

    removeItem: (itemId) => {
      const state = ensureCurrentOwner();
      commitItems(state.items.filter((item) => item.id !== itemId));
    },

    removeItems: (itemIds) => {
      const state = ensureCurrentOwner();
      const targetIds = new Set(itemIds);

      commitItems(state.items.filter((item) => !targetIds.has(item.id)));
    },

    removeOrderedItems: (orderItems) => {
      const state = ensureCurrentOwner();

      commitItems(
        state.items.filter((cartItem) => {
          return !orderItems.some((orderItem) => {
            if (orderItem.id && cartItem.id === orderItem.id) {
              return true;
            }

            return (
              Number(cartItem.productId) === Number(orderItem.productId) &&
              (cartItem.productType ?? 'product') === (orderItem.productType ?? 'product') &&
              (cartItem.color || '') === (orderItem.color || '') &&
              (cartItem.size || '') === (orderItem.size || '')
            );
          });
        })
      );
    },

    clearCart: () => {
      ensureCurrentOwner();
      commitItems([]);
    },

    syncCart: ({ force = false, mergeGuest = true } = {}) => {
      const currentOwnerId = getCartOwnerId();
      const state = get();

      if (state.ownerId !== currentOwnerId) {
        const targetSnapshot = getStoredCartSnapshot(currentOwnerId);

        if (mergeGuest && state.ownerId === 'guest' && currentOwnerId !== 'guest') {
          const guestSnapshot = getStoredCartSnapshot('guest');
          const mergedItems = mergeCartItems(targetSnapshot.items, guestSnapshot.items);

          if (guestSnapshot.items.length > 0) {
            const mergedSnapshot = createSnapshot({
              ownerId: currentOwnerId,
              items: mergedItems,
              previousUpdatedAt: Math.max(state.lastSyncedAt, targetSnapshot.updatedAt),
            });

            setStoredCartSnapshot(mergedSnapshot);
            clearStoredCartSnapshot('guest');
            applySnapshot(mergedSnapshot);
            broadcastSnapshot(mergedSnapshot);

            return mergedSnapshot.items;
          }
        }

        return applySnapshot(targetSnapshot);
      }

      const storedSnapshot = getStoredCartSnapshot(currentOwnerId);

      if (force || Number(storedSnapshot.updatedAt) > Number(state.lastSyncedAt)) {
        return applySnapshot(storedSnapshot);
      }

      return state.items;
    },

    applyExternalSnapshot: (snapshot) => {
      if (!snapshot || snapshot.ownerId !== getCartOwnerId()) {
        return;
      }

      const state = get();
      const incomingUpdatedAt = Number(snapshot.updatedAt) || 0;

      if (incomingUpdatedAt <= Number(state.lastSyncedAt)) {
        return;
      }

      applySnapshot({
        ownerId: snapshot.ownerId,
        items: normalizeItems(snapshot.items),
        updatedAt: incomingUpdatedAt,
      });
    },
  };
});

export const subscribeToCartBroadcast = (listener) => {
  const channel = getChannel();

  if (!channel) {
    return () => {};
  }

  const handleMessage = (event) => {
    const message = event.data;

    if (!message || message.type !== 'CART_UPDATED' || message.sourceId === TAB_ID) {
      return;
    }

    listener(message.snapshot);
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel.removeEventListener('message', handleMessage);
  };
};
