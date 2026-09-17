import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import useOrders from '@/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';
import { getStoredReviews } from '@/utils/storage';
import '@/styles/order-history.css';

import CancelOrderModal from './order-history/CancelOrderModal';
import OrderCard from './order-history/OrderCard';
import OrderDetailModal from './order-history/OrderDetailModal';
import OrderSummary from './order-history/OrderSummary';
import OrderToolbar from './order-history/OrderToolbar';
import ShippingModal from './order-history/ShippingModal';
import {
  ORDER_TABS,
  hasOrderDisplayMetadata,
  isWithinPeriod,
  matchesTab,
  normalizeImageUrl,
} from './order-history/orderHistoryUtils';

const ORDER_TAB_VALUES = new Set(ORDER_TABS.map((tab) => tab.value));

function getValidOrderTab(tab) {
  return ORDER_TAB_VALUES.has(tab) ? tab : 'all';
}

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addCartItem = useCartStore((state) => state.addItem);
  const {
    user,
    orders,
    orderDetails,
    errorMessage,
    loadOrderDetail,
    loadOrderDetails,
    isOrderDetailLoading,
    cancelOrderById,
  } = useOrders();

  const [selectedTab, setSelectedTab] = useState(() => getValidOrderTab(searchParams.get('tab')));
  const [periodMonths, setPeriodMonths] = useState(3);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [cancelStage, setCancelStage] = useState('idle');
  const [cancelError, setCancelError] = useState('');
  const [repurchaseOrderId, setRepurchaseOrderId] = useState(null);
  const displayPrefetchRef = useRef(new Set());

  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const reviewedOrderIds = useMemo(() => {
    return new Set(
      getStoredReviews()
        .map((review) => review?.orderId)
        .filter((orderId) => orderId !== undefined && orderId !== null)
        .map(String)
    );
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        isWithinPeriod(order.orderDate, periodMonths) && matchesTab(order.orderStatus, selectedTab)
      );
    });
  }, [orders, periodMonths, selectedTab]);

  const missingDisplayOrderIds = useMemo(() => {
    return filteredOrders
      .filter((order) => !hasOrderDisplayMetadata(order, orderDetails[order.orderId]))
      .map((order) => order.orderId)
      .filter(Boolean);
  }, [filteredOrders, orderDetails]);

  useEffect(() => {
    const targetIds = missingDisplayOrderIds.filter(
      (orderId) => !displayPrefetchRef.current.has(String(orderId))
    );

    if (targetIds.length === 0) {
      return;
    }

    targetIds.forEach((orderId) => displayPrefetchRef.current.add(String(orderId)));
    void loadOrderDetails(targetIds, { force: true });
  }, [loadOrderDetails, missingDisplayOrderIds]);

  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.orderId === selectedOrderId)
    : null;
  const selectedOrderDetail = selectedOrderId ? orderDetails[selectedOrderId] : null;
  const isSelectedOrderLoading = selectedOrderId ? isOrderDetailLoading(selectedOrderId) : false;

  const shippingOrder = shippingOrderId
    ? orders.find((order) => order.orderId === shippingOrderId)
    : null;
  const shippingDetail = shippingOrderId ? orderDetails[shippingOrderId] : null;
  const isShippingDetailLoading = shippingOrderId ? isOrderDetailLoading(shippingOrderId) : false;

  const cancelTargetOrder = cancelOrderId
    ? orders.find((order) => order.orderId === cancelOrderId)
    : null;

  const openCancelPanel = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setCancelReasonDetail('');
    setCancelStage('idle');
    setCancelError('');
  };

  const closeCancelPanel = () => {
    if (cancelStage === 'processing') {
      return;
    }

    setCancelOrderId(null);
    setCancelReason('');
    setCancelReasonDetail('');
    setCancelStage('idle');
    setCancelError('');
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId || !cancelReason) {
      setCancelError('취소 사유를 선택해주세요.');
      return;
    }

    if (cancelReason === '기타' && !cancelReasonDetail.trim()) {
      setCancelError('취소 사유를 입력해주세요.');
      return;
    }

    setCancelStage('processing');
    setCancelError('');

    const reasonText = cancelReason === '기타' ? cancelReasonDetail.trim() : cancelReason;

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 800);
      });

      await cancelOrderById(cancelOrderId, reasonText);
      setCancelStage('success');

      window.setTimeout(() => {
        setCancelOrderId(null);
        setCancelReason('');
        setCancelReasonDetail('');
        setCancelStage('idle');
      }, 900);
    } catch (error) {
      setCancelStage('idle');
      setCancelError(error.message || '주문 취소에 실패했습니다.');
    }
  };

  const openOrderDetail = async (orderId) => {
    setSelectedOrderId(orderId);

    try {
      await loadOrderDetail(orderId);
    } catch (error) {
      alert(error.message || '주문 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleShippingInfo = async (orderId) => {
    setShippingOrderId(orderId);

    try {
      await loadOrderDetail(orderId);
    } catch (error) {
      alert(error.message || '배송 정보를 불러오지 못했습니다.');
    }
  };

  const handleReview = (orderId) => {
    navigate(`/mypage/reviews?orderId=${encodeURIComponent(orderId)}`);
  };

  const handleRepurchase = async (order) => {
    if (repurchaseOrderId) {
      return;
    }

    setRepurchaseOrderId(order.orderId);

    try {
      const detail = await loadOrderDetail(order.orderId);
      const items = detail?.items ?? [];

      if (items.length === 0) {
        throw new Error('재구매할 상품 정보를 불러오지 못했습니다.');
      }

      items.forEach((item) => {
        const colorValue = typeof item.color === 'string' ? item.color : (item.color?.value ?? '');
        const colorLabel =
          typeof item.color === 'string'
            ? item.color
            : (item.color?.label ?? item.color?.value ?? '');

        addCartItem({
          productId: Number(item.productId),
          productType: item.productType ?? 'product',
          name: item.name,
          imageUrl: normalizeImageUrl(item.imageUrl),
          price: Number(item.price ?? 0),
          originalPrice: null,
          color: colorValue,
          colorLabel,
          size: item.size || undefined,
          quantity: Number(item.quantity ?? 1),
          option: [colorLabel, item.size].filter(Boolean).join(' / '),
        });
      });

      navigate('/cart');
    } catch (error) {
      alert(error.message || '재구매 상품을 장바구니에 담지 못했습니다.');
    } finally {
      setRepurchaseOrderId(null);
    }
  };

  return (
    <>
      <section className="order-history-content">
        <header className="order-history-heading">
          <h1>주문 내역</h1>
          <p>지금까지의 주문 정보를 한눈에 확인하세요.</p>
        </header>

        <OrderSummary
          orderCount={orders.length}
          couponCount={couponCount}
          pointBalance={pointBalance}
          wishlistCount={wishlistCount}
        />

        <OrderToolbar
          selectedTab={selectedTab}
          periodMonths={periodMonths}
          onTabChange={setSelectedTab}
          onPeriodChange={setPeriodMonths}
        />

        {errorMessage ? (
          <ErrorState className="order-history-empty" message={errorMessage} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState className="order-history-empty" message="아직 주문내역이 없습니다." />
        ) : (
          <div className="order-history-list">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                detail={orderDetails[order.orderId]}
                isRepurchasing={repurchaseOrderId === order.orderId}
                hasReview={reviewedOrderIds.has(String(order.orderId))}
                onOpenDetail={(orderId) => void openOrderDetail(orderId)}
                onShippingInfo={(orderId) => void handleShippingInfo(orderId)}
                onCancel={openCancelPanel}
                onRepurchase={(targetOrder) => void handleRepurchase(targetOrder)}
                onReview={handleReview}
              />
            ))}
          </div>
        )}
      </section>

      <ShippingModal
        order={shippingOrder}
        detail={shippingDetail}
        loading={isShippingDetailLoading}
        onClose={() => setShippingOrderId(null)}
      />

      <CancelOrderModal
        order={cancelTargetOrder}
        stage={cancelStage}
        reason={cancelReason}
        reasonDetail={cancelReasonDetail}
        error={cancelError}
        onReasonChange={(value) => {
          setCancelReason(value);
          setCancelError('');
        }}
        onReasonDetailChange={(value) => {
          setCancelReasonDetail(value);
          setCancelError('');
        }}
        onClose={closeCancelPanel}
        onSubmit={() => void handleCancelOrder()}
      />

      <OrderDetailModal
        order={selectedOrder}
        detail={selectedOrderDetail}
        loading={isSelectedOrderLoading}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
}

export default OrderHistoryPage;
