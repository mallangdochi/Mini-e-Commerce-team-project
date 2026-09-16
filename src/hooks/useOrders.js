import { useCallback, useEffect, useRef, useState } from 'react';

import { cancelOrder, getOrder, getOrders } from '@/api/orders';
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

let sharedOrders = null;
let sharedTotalCount = 0;
let sharedOrdersFetchedAt = 0;
let pendingOrdersRequest = null;
const pendingDetailRequests = new Map();

function getOrderCollection(response) {
  const data = response?.data ?? response ?? {};
  const orders = Array.isArray(data.orders)
    ? data.orders
    : Array.isArray(data?.data?.orders)
      ? data.data.orders
      : [];
  const totalCount = Number(
    data.pagination?.totalCount ??
      data.pageInfo?.totalCount ??
      data.totalCount ??
      data?.data?.pagination?.totalCount ??
      data?.data?.pageInfo?.totalCount ??
      data?.data?.totalCount ??
      orders.length
  );

  return {
    orders,
    totalCount: Number.isFinite(totalCount) ? totalCount : orders.length,
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

  const saveOrderDetail = useCallback((orderId, detail) => {
    if (!detail) {
      return;
    }

    setOrderDetails((prev) => {
      const next = {
        ...prev,
        [orderId]: detail,
      };

      orderDetailsRef.current = next;
      setStoredOrderDetails(next);
      return next;
    });
  }, []);

  const loadOrderDetail = useCallback(
    async (orderId) => {
      if (!orderId) {
        return null;
      }

      const cachedDetail = orderDetailsRef.current[orderId];

      if (cachedDetail) {
        return cachedDetail;
      }

      const pendingRequest = pendingDetailRequests.get(orderId);

      if (pendingRequest) {
        return pendingRequest;
      }

      setLoadingDetailIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));

      const request = getOrder(orderId)
        .then((response) => {
          const detail = response?.data ?? response ?? null;
          saveOrderDetail(orderId, detail);
          return detail;
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
    async (orderIds) => {
      const uniqueIds = [...new Set((orderIds ?? []).filter(Boolean))];
      const missingIds = uniqueIds.filter((orderId) => !orderDetailsRef.current[orderId]);

      if (missingIds.length === 0) {
        return orderDetailsRef.current;
      }

      await Promise.allSettled(missingIds.map((orderId) => loadOrderDetail(orderId)));
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

    void loadInitialData();

    return () => {
      isActive = false;
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
      if (!orderId) {
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
          order.orderId === orderId
            ? {
                ...order,
                orderStatus: 'cancelled',
              }
            : order
        );

        sharedOrders = next;
        sharedOrdersFetchedAt = Date.now();
        setStoredOrders(next);
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
    [loadOrderDetail, patchUserSummary, user]
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
