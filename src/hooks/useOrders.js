import { useCallback, useEffect, useRef, useState } from 'react';

import { cancelOrder, getOrder, getOrders } from '@/api/orders';
import { getProduct, getSet } from '@/api/products';
import useAuthStore from '@/store/authStore';
import {
  getStoredCancelReasons,
  getStoredOrderDetails,
  getStoredOrders,
  setStoredCancelReasons,
  setStoredOrderDetails,
  setStoredOrders,
} from '@/utils/storage';

const ORDERS_CACHE_TTL = 5 * 60 * 1000;
const ORDER_CHANGE_EVENT = 'arc-orders-changed';

let sharedOrders = null;
let sharedTotalCount = 0;
let sharedOrdersFetchedAt = 0;
let pendingOrdersRequest = null;
const pendingDetailRequests = new Map();
const productMetadataCache = new Map();

const asArray = (value) => (Array.isArray(value) ? value : []);

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const prefer = (primaryValue, fallbackValue) =>
  hasValue(primaryValue) ? primaryValue : fallbackValue;

const getOrderId = (order) => order?.orderId ?? order?.id ?? null;

const getColorValue = (color) => {
  if (typeof color === 'string') {
    return color;
  }

  return color?.value ?? color?.label ?? '';
};

const getProductImage = (product) => {
  if (!product) {
    return '';
  }

  return (
    product.imageUrl ??
    product.thumbnailUrl ??
    product.thumbnail ??
    product.images?.thumbnail ??
    product.images?.main ??
    product.images?.[0] ??
    ''
  );
};

const getItemName = (item) => item?.name ?? item?.productName ?? item?.product?.name ?? '';

const getItemImage = (item) =>
  item?.imageUrl ??
  item?.thumbnailUrl ??
  item?.thumbnail ??
  item?.product?.imageUrl ??
  item?.product?.images?.thumbnail ??
  '';

const getItemKey = (item, index = 0) => {
  if (hasValue(item?.orderItemId)) {
    return `orderItem:${item.orderItemId}`;
  }

  return [
    item?.productType ?? 'product',
    item?.productId ?? item?.product?.productId ?? item?.product?.id ?? index,
    getColorValue(item?.color),
    item?.size ?? '',
  ].join(':');
};

function mergeItemRecord(cachedItem = {}, serverItem = {}) {
  return {
    ...cachedItem,
    ...serverItem,
    productId: prefer(
      serverItem.productId ?? serverItem.product?.productId ?? serverItem.product?.id,
      cachedItem.productId ?? cachedItem.product?.productId ?? cachedItem.product?.id
    ),
    productType: prefer(serverItem.productType, cachedItem.productType ?? 'product'),
    name: prefer(getItemName(serverItem), getItemName(cachedItem)),
    imageUrl: prefer(getItemImage(serverItem), getItemImage(cachedItem)),
    price: prefer(
      serverItem.price ?? serverItem.unitPrice,
      cachedItem.price ?? cachedItem.unitPrice
    ),
    color: prefer(serverItem.color, cachedItem.color),
    size: prefer(serverItem.size, cachedItem.size),
    quantity: Number(prefer(serverItem.quantity, cachedItem.quantity ?? 1)),
  };
}

function mergeOrderItems(cachedItems, serverItems) {
  const cachedList = asArray(cachedItems);
  const serverList = asArray(serverItems);

  if (serverList.length === 0) {
    return cachedList;
  }

  const cachedMap = new Map(
    cachedList.map((item, index) => [getItemKey(item, index), { item, index }])
  );

  return serverList.map((serverItem, index) => {
    const exactMatch = cachedMap.get(getItemKey(serverItem, index))?.item;
    const productId =
      serverItem?.productId ?? serverItem?.product?.productId ?? serverItem?.product?.id;
    const looseMatch = cachedList.find((cachedItem) => {
      const cachedProductId =
        cachedItem?.productId ?? cachedItem?.product?.productId ?? cachedItem?.product?.id;

      return Number(cachedProductId) === Number(productId);
    });

    return mergeItemRecord(exactMatch ?? looseMatch ?? cachedList[index] ?? {}, serverItem);
  });
}

function mergeRepresentativeProduct(cachedProduct = {}, serverProduct = {}) {
  return {
    ...cachedProduct,
    ...serverProduct,
    productId: prefer(
      serverProduct.productId ?? serverProduct.id,
      cachedProduct.productId ?? cachedProduct.id
    ),
    productType: prefer(serverProduct.productType, cachedProduct.productType),
    name: prefer(
      serverProduct.name ?? serverProduct.productName,
      cachedProduct.name ?? cachedProduct.productName
    ),
    imageUrl: prefer(getProductImage(serverProduct), getProductImage(cachedProduct)),
  };
}

function mergeOrderRecord(cachedOrder = {}, serverOrder = {}) {
  const cachedRepresentative = cachedOrder.representativeProduct ?? {};
  const serverRepresentative = serverOrder.representativeProduct ?? {};
  const firstItem = serverOrder.items?.[0] ?? cachedOrder.items?.[0] ?? null;
  const itemRepresentative = firstItem
    ? {
        productId: firstItem.productId ?? firstItem.product?.productId ?? firstItem.product?.id,
        productType: firstItem.productType,
        name: getItemName(firstItem),
        imageUrl: getItemImage(firstItem),
      }
    : {};
  const representativeProduct = mergeRepresentativeProduct(
    mergeRepresentativeProduct(cachedRepresentative, itemRepresentative),
    serverRepresentative
  );

  return {
    ...cachedOrder,
    ...serverOrder,
    orderId: prefer(getOrderId(serverOrder), getOrderId(cachedOrder)),
    orderDate: prefer(
      serverOrder.orderDate ?? serverOrder.createdAt,
      cachedOrder.orderDate ?? cachedOrder.createdAt
    ),
    orderStatus: prefer(serverOrder.orderStatus ?? serverOrder.status, cachedOrder.orderStatus),
    finalAmount: Number(
      prefer(serverOrder.finalAmount ?? serverOrder.totalAmount, cachedOrder.finalAmount ?? 0)
    ),
    totalItemCount: Number(
      prefer(
        serverOrder.totalItemCount ?? serverOrder.items?.length,
        cachedOrder.totalItemCount ?? cachedOrder.items?.length ?? 1
      )
    ),
    representativeProduct,
  };
}

function mergeOrderDetail(cachedDetail = {}, serverDetail = {}) {
  const mergedItems = mergeOrderItems(cachedDetail.items, serverDetail.items);

  return {
    ...cachedDetail,
    ...serverDetail,
    orderId: prefer(getOrderId(serverDetail), getOrderId(cachedDetail)),
    orderDate: prefer(
      serverDetail.orderDate ?? serverDetail.createdAt,
      cachedDetail.orderDate ?? cachedDetail.createdAt
    ),
    orderStatus: prefer(serverDetail.orderStatus ?? serverDetail.status, cachedDetail.orderStatus),
    finalAmount: Number(
      prefer(serverDetail.finalAmount ?? serverDetail.totalAmount, cachedDetail.finalAmount ?? 0)
    ),
    shipping: {
      ...(cachedDetail.shipping ?? {}),
      ...(serverDetail.shipping ?? {}),
    },
    payment: {
      ...(cachedDetail.payment ?? {}),
      ...(serverDetail.payment ?? {}),
    },
    items: mergedItems,
  };
}

function enrichOrderFromDetail(order, detail) {
  if (!order || !detail) {
    return order;
  }

  const firstItem = detail.items?.[0];

  if (!firstItem) {
    return order;
  }

  const representativeProduct = mergeRepresentativeProduct(order.representativeProduct ?? {}, {
    productId: firstItem.productId,
    productType: firstItem.productType,
    name: getItemName(firstItem),
    imageUrl: getItemImage(firstItem),
  });

  return {
    ...order,
    finalAmount: Number(order.finalAmount ?? detail.finalAmount ?? 0),
    totalItemCount: Number(order.totalItemCount ?? detail.items?.length ?? 1),
    representativeProduct,
  };
}

async function fetchProductMetadata(item) {
  const productId = Number(item?.productId ?? item?.product?.productId ?? item?.product?.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  const productType = String(item?.productType ?? '').toLowerCase() === 'set' ? 'set' : 'product';
  const cacheKey = `${productType}:${productId}`;

  if (productMetadataCache.has(cacheKey)) {
    return productMetadataCache.get(cacheKey);
  }

  const request = (productType === 'set' ? getSet(productId) : getProduct(productId))
    .then((response) => response?.data ?? response ?? null)
    .catch(() => null);

  productMetadataCache.set(cacheKey, request);
  return request;
}

async function hydrateMissingItemMetadata(detail) {
  const items = asArray(detail?.items);

  if (items.length === 0) {
    return detail;
  }

  const hydratedItems = await Promise.all(
    items.map(async (item) => {
      if (getItemName(item) && getItemImage(item)) {
        return item;
      }

      const product = await fetchProductMetadata(item);

      if (!product) {
        return item;
      }

      return mergeItemRecord(item, {
        productId: product.productId ?? product.id ?? item.productId,
        productType: item.productType,
        name: product.name,
        imageUrl: getProductImage(product),
        price: product.price,
      });
    })
  );

  return {
    ...detail,
    items: hydratedItems,
  };
}

function mergeOrdersWithStored(serverOrders, storedOrders) {
  const storedList = asArray(storedOrders);
  const serverList = asArray(serverOrders);
  const storedMap = new Map(storedList.map((order) => [String(getOrderId(order)), order]));
  const serverIds = new Set();

  const mergedServerOrders = serverList.map((serverOrder) => {
    const orderId = String(getOrderId(serverOrder));
    serverIds.add(orderId);
    return mergeOrderRecord(storedMap.get(orderId), serverOrder);
  });

  const localOnlyOrders = storedList.filter(
    (storedOrder) => !serverIds.has(String(getOrderId(storedOrder)))
  );

  return [...mergedServerOrders, ...localOnlyOrders].sort((a, b) => {
    const aDate = new Date(a.orderDate ?? a.createdAt ?? 0).getTime();
    const bDate = new Date(b.orderDate ?? b.createdAt ?? 0).getTime();
    return bDate - aDate;
  });
}

function getOrderCollection(response) {
  const data = response?.data ?? response ?? {};
  const serverOrders = Array.isArray(data.orders)
    ? data.orders
    : Array.isArray(data?.data?.orders)
      ? data.data.orders
      : [];
  const storedOrders = getStoredOrders();
  const orders = mergeOrdersWithStored(serverOrders, storedOrders);
  const totalCount = Number(
    data.pagination?.totalCount ??
      data.pageInfo?.totalCount ??
      data.totalCount ??
      data?.data?.pagination?.totalCount ??
      data?.data?.pageInfo?.totalCount ??
      data?.data?.totalCount ??
      serverOrders.length
  );

  return {
    orders,
    totalCount: Math.max(Number.isFinite(totalCount) ? totalCount : 0, orders.length),
  };
}

async function fetchOrderPageData({ force = false } = {}) {
  const isFresh =
    Array.isArray(sharedOrders) && Date.now() - sharedOrdersFetchedAt < ORDERS_CACHE_TTL;

  if (!force && isFresh) {
    return {
      orders: sharedOrders,
      totalCount: sharedTotalCount,
    };
  }

  if (!force && pendingOrdersRequest) {
    return pendingOrdersRequest;
  }

  const request = getOrders({ page: 1, limit: 50 })
    .then((response) => {
      const result = getOrderCollection(response);

      sharedOrders = result.orders;
      sharedTotalCount = result.totalCount;
      sharedOrdersFetchedAt = Date.now();
      setStoredOrders(result.orders);

      return result;
    })
    .finally(() => {
      if (pendingOrdersRequest === request) {
        pendingOrdersRequest = null;
      }
    });

  pendingOrdersRequest = request;
  return request;
}

function normalizeCheckoutItem(item, serverItem = {}) {
  const colorValue = getColorValue(serverItem.color) || getColorValue(item.color);

  return mergeItemRecord(item, {
    ...serverItem,
    productId: prefer(serverItem.productId, item.productId),
    productType: prefer(serverItem.productType, item.productType ?? 'product'),
    name: prefer(getItemName(serverItem), item.name),
    imageUrl: prefer(getItemImage(serverItem), item.imageUrl),
    price: prefer(serverItem.price ?? serverItem.unitPrice, item.price),
    color: colorValue,
    size: prefer(serverItem.size, item.size),
    quantity: Number(prefer(serverItem.quantity, item.quantity ?? 1)),
  });
}

export function registerCreatedOrder({
  order,
  orderItems,
  shipping,
  paymentMethod,
  finalAmount,
  productTotal,
  couponId,
  pointsUsed = 0,
}) {
  const orderId = getOrderId(order);

  if (!hasValue(orderId)) {
    return null;
  }

  const serverItems = asArray(order?.items);
  const richItems = asArray(orderItems).map((item, index) =>
    normalizeCheckoutItem(item, serverItems[index] ?? {})
  );
  const mergedItems =
    serverItems.length > richItems.length ? mergeOrderItems(richItems, serverItems) : richItems;
  const orderDate = order?.orderDate ?? order?.createdAt ?? new Date().toISOString();
  const orderStatus = order?.orderStatus ?? order?.status ?? 'paymentCompleted';
  const calculatedFinalAmount = Number(
    order?.finalAmount ?? order?.totalAmount ?? finalAmount ?? productTotal ?? 0
  );
  const detail = mergeOrderDetail(
    {
      orderId,
      orderDate,
      orderStatus,
      finalAmount: calculatedFinalAmount,
      productAmount: Number(productTotal ?? 0),
      pointsUsed: Number(pointsUsed ?? 0),
      shipping: shipping ?? {},
      payment: {
        paymentMethod: paymentMethod ?? '',
      },
      coupon: couponId ? { couponId } : null,
      items: mergedItems,
    },
    order
  );
  const firstItem = detail.items?.[0];
  const summary = mergeOrderRecord(
    {
      orderId,
      orderDate,
      orderStatus,
      finalAmount: calculatedFinalAmount,
      totalItemCount: detail.items?.length ?? 1,
      representativeProduct: firstItem
        ? {
            productId: firstItem.productId,
            productType: firstItem.productType,
            name: getItemName(firstItem),
            imageUrl: getItemImage(firstItem),
          }
        : {},
    },
    order
  );

  const currentOrders = Array.isArray(sharedOrders) ? sharedOrders : getStoredOrders();
  const alreadyExists = currentOrders.some((item) => String(getOrderId(item)) === String(orderId));
  const nextOrders = [
    summary,
    ...currentOrders.filter((item) => String(getOrderId(item)) !== String(orderId)),
  ];
  const storedDetails = getStoredOrderDetails();
  const nextDetails = {
    ...storedDetails,
    [orderId]: mergeOrderDetail(storedDetails[orderId], detail),
  };

  sharedOrders = nextOrders;
  sharedTotalCount = Math.max(
    nextOrders.length,
    alreadyExists ? sharedTotalCount : sharedTotalCount + 1
  );
  sharedOrdersFetchedAt = Date.now();
  setStoredOrders(nextOrders);
  setStoredOrderDetails(nextDetails);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  }

  return {
    order: summary,
    detail: nextDetails[orderId],
  };
}

function useOrders() {
  const user = useAuthStore((state) => state.user);
  const patchUserSummary = useAuthStore((state) => state.patchUserSummary);
  const storedOrders = getStoredOrders();
  const [orders, setOrders] = useState(() =>
    Array.isArray(sharedOrders) ? sharedOrders : storedOrders
  );
  const [totalCount, setTotalCount] = useState(
    () => sharedTotalCount || Number(user?.orderCount ?? storedOrders.length)
  );
  const [orderDetails, setOrderDetails] = useState(() => getStoredOrderDetails());
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetailIds, setLoadingDetailIds] = useState([]);
  const orderDetailsRef = useRef(orderDetails);

  useEffect(() => {
    orderDetailsRef.current = orderDetails;
  }, [orderDetails]);

  const persistOrders = useCallback((nextOrders) => {
    sharedOrders = nextOrders;
    sharedTotalCount = Math.max(sharedTotalCount, nextOrders.length);
    sharedOrdersFetchedAt = Date.now();
    setStoredOrders(nextOrders);
    return nextOrders;
  }, []);

  const updateOrderSummaryFromDetail = useCallback(
    (orderId, detail) => {
      setOrders((prev) => {
        const next = prev.map((order) =>
          String(getOrderId(order)) === String(orderId)
            ? enrichOrderFromDetail(order, detail)
            : order
        );

        persistOrders(next);
        return next;
      });
    },
    [persistOrders]
  );

  const saveOrderDetail = useCallback(
    (orderId, detail) => {
      if (!detail) {
        return null;
      }

      const savedDetail = mergeOrderDetail(orderDetailsRef.current[orderId], detail);
      const nextDetails = {
        ...orderDetailsRef.current,
        [orderId]: savedDetail,
      };

      orderDetailsRef.current = nextDetails;
      setOrderDetails(nextDetails);
      setStoredOrderDetails(nextDetails);
      updateOrderSummaryFromDetail(orderId, savedDetail);

      return savedDetail;
    },
    [updateOrderSummaryFromDetail]
  );

  const loadOrderDetail = useCallback(
    async (orderId, { force = false } = {}) => {
      if (!hasValue(orderId)) {
        return null;
      }

      const cachedDetail = orderDetailsRef.current[orderId];

      if (!force && cachedDetail) {
        return cachedDetail;
      }

      const pendingRequest = pendingDetailRequests.get(orderId);

      if (pendingRequest) {
        return pendingRequest;
      }

      setLoadingDetailIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));

      const request = getOrder(orderId)
        .then((response) => response?.data ?? response ?? null)
        .then((serverDetail) => mergeOrderDetail(cachedDetail, serverDetail ?? {}))
        .then((mergedDetail) => hydrateMissingItemMetadata(mergedDetail))
        .then((hydratedDetail) => {
          saveOrderDetail(orderId, hydratedDetail);
          return hydratedDetail;
        })
        .finally(() => {
          pendingDetailRequests.delete(orderId);
          setLoadingDetailIds((prev) => prev.filter((id) => id !== orderId));
        });

      pendingDetailRequests.set(orderId, request);
      return request;
    },
    [saveOrderDetail]
  );

  const loadOrderDetails = useCallback(
    async (orderIds, { force = false } = {}) => {
      const uniqueIds = [...new Set((orderIds ?? []).filter(hasValue))];
      const targetIds = force
        ? uniqueIds
        : uniqueIds.filter((orderId) => !orderDetailsRef.current[orderId]);

      if (targetIds.length === 0) {
        return orderDetailsRef.current;
      }

      await Promise.allSettled(targetIds.map((orderId) => loadOrderDetail(orderId, { force })));
      return orderDetailsRef.current;
    },
    [loadOrderDetail]
  );

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      setErrorMessage('');

      try {
        const result = await fetchOrderPageData();

        if (!isActive) {
          return;
        }

        setOrders(result.orders);
        setTotalCount(result.totalCount);
        patchUserSummary({ orderCount: result.totalCount });
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message || '주문 내역을 불러오지 못했습니다.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const syncFromStoredOrders = () => {
      if (!isActive) {
        return;
      }

      const nextOrders = Array.isArray(sharedOrders) ? sharedOrders : getStoredOrders();
      const nextDetails = getStoredOrderDetails();
      const nextCount = Math.max(sharedTotalCount, nextOrders.length);

      setOrders(nextOrders);
      setOrderDetails(nextDetails);
      orderDetailsRef.current = nextDetails;
      setTotalCount(nextCount);
      patchUserSummary({ orderCount: nextCount });
    };

    void loadInitialData();
    window.addEventListener(ORDER_CHANGE_EVENT, syncFromStoredOrders);

    return () => {
      isActive = false;
      window.removeEventListener(ORDER_CHANGE_EVENT, syncFromStoredOrders);
    };
  }, [patchUserSummary]);

  const loadOrders = useCallback(
    async ({ force = true } = {}) => {
      setErrorMessage('');
      setIsLoading(true);

      try {
        const result = await fetchOrderPageData({ force });
        setOrders(result.orders);
        setTotalCount(result.totalCount);
        patchUserSummary({ orderCount: result.totalCount });
        return result.orders;
      } catch (error) {
        setErrorMessage(error.message || '주문 내역을 불러오지 못했습니다.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [patchUserSummary]
  );

  const cancelOrderById = useCallback(
    async (orderId, reasonText) => {
      if (!hasValue(orderId)) {
        throw new Error('취소할 주문을 찾을 수 없습니다.');
      }

      const detail = orderDetailsRef.current[orderId] ?? (await loadOrderDetail(orderId));

      await cancelOrder(orderId);

      setStoredCancelReasons({
        ...getStoredCancelReasons(),
        [orderId]: reasonText,
      });

      setOrders((prev) => {
        const next = prev.map((order) =>
          String(getOrderId(order)) === String(orderId)
            ? {
                ...order,
                orderStatus: 'cancelled',
              }
            : order
        );

        persistOrders(next);
        return next;
      });

      const restoredPoints = Number(detail?.pointsUsed ?? 0);
      const restoredCoupon = Boolean(detail?.coupon?.couponId);
      const currentPoints = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
      const currentCouponCount = Number(user?.availableCouponCount ?? user?.couponCount ?? 0);
      const nextSummary = {};

      if (restoredPoints > 0) {
        nextSummary.points = currentPoints + restoredPoints;
        nextSummary.pointBalance = currentPoints + restoredPoints;
      }

      if (restoredCoupon) {
        nextSummary.availableCouponCount = currentCouponCount + 1;
        nextSummary.couponCount = currentCouponCount + 1;
      }

      if (Object.keys(nextSummary).length > 0) {
        patchUserSummary(nextSummary);
      }

      setOrderDetails((prev) => {
        const currentDetail = prev[orderId] ?? detail;
        const next = {
          ...prev,
          [orderId]: currentDetail
            ? {
                ...currentDetail,
                orderStatus: 'cancelled',
                cancelledAt: new Date().toISOString(),
              }
            : currentDetail,
        };

        orderDetailsRef.current = next;
        setStoredOrderDetails(next);
        return next;
      });
    },
    [loadOrderDetail, patchUserSummary, persistOrders, user]
  );

  const isOrderDetailLoading = useCallback(
    (orderId) => loadingDetailIds.includes(orderId),
    [loadingDetailIds]
  );

  return {
    user,
    orders,
    totalCount,
    orderDetails,
    errorMessage,
    isLoading,
    loadOrders,
    loadOrderDetail,
    loadOrderDetails,
    isOrderDetailLoading,
    cancelOrderById,
  };
}

export default useOrders;
