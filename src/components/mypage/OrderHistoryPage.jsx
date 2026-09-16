import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import useOrders from '@/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';
import '@/styles/order-history.css';

const ORDER_TABS = [
  { label: '전체', value: 'all' },
  { label: '주문/결제', value: 'order' },
  { label: '배송중', value: 'shipping' },
  { label: '배송완료', value: 'delivered' },
  { label: '취소', value: 'cancelled' },
  { label: '교환/반품', value: 'claims' },
];

const CANCEL_REASONS = [
  '단순 변심',
  '주문 실수',
  '옵션 변경',
  '배송지 변경',
  '다른 상품 구매',
  '기타',
];

const PERIOD_OPTIONS = [
  { label: '최근 3개월', value: 3 },
  { label: '최근 6개월', value: 6 },
  { label: '최근 1년', value: 12 },
  { label: '전체 기간', value: 0 },
];

const STATUS_META = {
  paymentCompleted: {
    label: '결제완료',
    step: 0,
  },
  preparing: {
    label: '상품준비중',
    step: 1,
  },
  shipping: {
    label: '배송중',
    step: 2,
  },
  delivered: {
    label: '배송완료',
    step: 3,
  },
  cancelled: {
    label: '주문취소',
    step: -1,
  },
};

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5h13l-.8 11h-11.4l-.8-11Z" />
      <path d="M9 9V6.7a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function IconCoupon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17h16v-4.5A2.5 2.5 0 0 0 17.5 10 2.5 2.5 0 0 0 20 7.5V3H4v4.5Z" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
      <path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\s/g, '');
}

function formatShortDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function getOrderName(order, detail) {
  const firstItem = detail?.items?.[0];
  const representative = order.representativeProduct;
  const baseName = firstItem?.name ?? representative?.name ?? '상품';
  const totalItemCount = Number(order.totalItemCount ?? detail?.items?.length ?? 1);

  if (totalItemCount <= 1) {
    return baseName;
  }

  return `${baseName} 외 ${totalItemCount - 1}개`;
}

function getOrderImage(order, detail) {
  return normalizeImageUrl(detail?.items?.[0]?.imageUrl ?? order.representativeProduct?.imageUrl);
}

function getOptionText(detail) {
  const firstItem = detail?.items?.[0];

  if (!firstItem) {
    return '';
  }

  return [firstItem.color?.toUpperCase(), firstItem.size].filter(Boolean).join(' / ');
}

function isWithinPeriod(dateString, months) {
  if (!months) {
    return true;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const boundary = new Date();
  boundary.setMonth(boundary.getMonth() - months);

  return date >= boundary;
}

function matchesTab(status, tab) {
  if (tab === 'all') {
    return true;
  }

  if (tab === 'order') {
    return status === 'paymentCompleted' || status === 'preparing';
  }

  if (tab === 'shipping') {
    return status === 'shipping';
  }

  if (tab === 'delivered') {
    return status === 'delivered';
  }

  if (tab === 'cancelled') {
    return status === 'cancelled';
  }

  if (tab === 'claims') {
    return false;
  }

  return true;
}

function OrderHistoryPage() {
  const navigate = useNavigate();
  const addCartItem = useCartStore((state) => state.addItem);
  const {
    user,
    orders,
    orderDetails,
    errorMessage,
    loadOrderDetail,
    isOrderDetailLoading,
    cancelOrderById,
  } = useOrders();

  const [selectedTab, setSelectedTab] = useState('all');
  const [periodMonths, setPeriodMonths] = useState(3);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [cancelStage, setCancelStage] = useState('idle');
  const [cancelError, setCancelError] = useState('');
  const [repurchaseOrderId, setRepurchaseOrderId] = useState(null);

  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const summaryItems = [
    {
      label: '주문 내역',
      value: `${orders.length}건`,
      to: '/mypage/orders',
      icon: <IconBag />,
    },
    {
      label: '보유 쿠폰',
      value: `${couponCount}개`,
      to: '/mypage/coupons',
      icon: <IconCoupon />,
    },
    {
      label: '적립금',
      value: `${pointBalance.toLocaleString()}원`,
      to: '/mypage/coupons',
      icon: <IconCoin />,
    },
    {
      label: '찜한 상품',
      value: `${wishlistCount}개`,
      to: '/mypage/wishlist',
      icon: <IconHeart />,
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        isWithinPeriod(order.orderDate, periodMonths) && matchesTab(order.orderStatus, selectedTab)
      );
    });
  }, [orders, periodMonths, selectedTab]);

  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.orderId === selectedOrderId)
    : null;

  const selectedOrderDetail = selectedOrderId ? orderDetails[selectedOrderId] : null;
  const isSelectedOrderLoading = selectedOrderId ? isOrderDetailLoading(selectedOrderId) : false;

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

  const shippingOrder = shippingOrderId
    ? orders.find((order) => order.orderId === shippingOrderId)
    : null;
  const shippingDetail = shippingOrderId ? orderDetails[shippingOrderId] : null;
  const isShippingDetailLoading = shippingOrderId ? isOrderDetailLoading(shippingOrderId) : false;
  const cancelTargetOrder = cancelOrderId
    ? orders.find((order) => order.orderId === cancelOrderId)
    : null;

  return (
    <>
      <section className="order-history-content">
        <header className="order-history-heading">
          <h1>주문 내역</h1>
          <p>지금까지의 주문 정보를 한눈에 확인하세요.</p>
        </header>

        <section className="order-history-summary">
          {summaryItems.map((item) => (
            <Link key={item.label} to={item.to} className="order-history-summary-card">
              <div className="order-history-summary-top">
                <span className="order-history-summary-icon">{item.icon}</span>
                <span aria-hidden="true">›</span>
              </div>

              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </Link>
          ))}
        </section>

        <div className="order-history-toolbar">
          <div className="order-history-tabs">
            {ORDER_TABS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={selectedTab === tab.value ? 'is-active' : ''}
                onClick={() => setSelectedTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={periodMonths}
            onChange={(event) => setPeriodMonths(Number(event.target.value))}
            aria-label="주문 조회 기간"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage ? (
          <ErrorState className="order-history-empty" message={errorMessage} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState className="order-history-empty" message="아직 주문내역이 없습니다." />
        ) : (
          <div className="order-history-list">
            {filteredOrders.map((order) => {
              const detail = orderDetails[order.orderId];
              const firstItem = detail?.items?.[0];
              const status = STATUS_META[order.orderStatus] ?? {
                label: order.orderStatus,
                step: -1,
              };
              const imageUrl = getOrderImage(order, detail);
              const optionText = getOptionText(detail);
              const finalAmount = Number(order.finalAmount ?? detail?.finalAmount ?? 0);
              const totalItemCount = Number(order.totalItemCount ?? detail?.items?.length ?? 1);
              const canCancel =
                order.orderStatus === 'paymentCompleted' || order.orderStatus === 'preparing';

              return (
                <article className="order-history-card" key={order.orderId}>
                  <div className="order-history-card-head">
                    <div>
                      <strong>{formatDate(order.orderDate)}</strong>
                      <span className="order-history-head-divider">|</span>
                      <span>주문번호 {order.orderId}</span>
                    </div>

                    <button type="button" onClick={() => void openOrderDetail(order.orderId)}>
                      주문 상세보기
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>

                  <div className="order-history-card-body">
                    <div className="order-history-product">
                      <div className="order-history-product-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={getOrderName(order, detail)} />
                        ) : (
                          <span>IMAGE</span>
                        )}
                      </div>

                      <div className="order-history-product-info">
                        <h2>{getOrderName(order, detail)}</h2>

                        {optionText && <p>{optionText}</p>}

                        <div>
                          <strong>₩ {finalAmount.toLocaleString()}</strong>
                          <span>|</span>
                          <span>수량 {firstItem?.quantity ?? totalItemCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-history-status">
                      <strong className={order.orderStatus === 'cancelled' ? 'is-cancelled' : ''}>
                        {status.label}
                      </strong>

                      {order.orderStatus === 'shipping' && <span>배송이 진행 중입니다.</span>}

                      {order.orderStatus === 'delivered' && <span>배송이 완료되었습니다.</span>}

                      {order.orderStatus === 'cancelled' && (
                        <span>
                          {detail?.cancelledAt
                            ? `${formatDate(detail.cancelledAt)} 취소 완료`
                            : '취소 완료'}
                        </span>
                      )}
                    </div>

                    <div className="order-history-progress">
                      {order.orderStatus === 'cancelled' ? (
                        <div className="order-history-progress-cancelled">
                          주문이 취소되었습니다.
                        </div>
                      ) : (
                        <>
                          <div className="order-history-progress-track">
                            {[0, 1, 2, 3].map((step) => (
                              <span key={step} className={status.step >= step ? 'is-active' : ''} />
                            ))}
                          </div>

                          <div className="order-history-progress-labels">
                            <span>
                              주문접수
                              <small>{formatShortDate(order.orderDate)}</small>
                            </span>
                            <span>
                              상품준비
                              <small>{status.step >= 1 ? '진행' : '-'}</small>
                            </span>
                            <span>
                              배송중
                              <small>{status.step >= 2 ? '진행' : '-'}</small>
                            </span>
                            <span>
                              배송완료
                              <small>{status.step >= 3 ? '완료' : '-'}</small>
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="order-history-actions">
                      {(order.orderStatus === 'shipping' || order.orderStatus === 'delivered') && (
                        <button
                          type="button"
                          className="is-primary"
                          onClick={() => handleShippingInfo(order.orderId)}
                        >
                          배송 조회
                        </button>
                      )}

                      {order.orderStatus === 'delivered' && (
                        <button type="button" className="is-primary">
                          리뷰 작성
                        </button>
                      )}

                      {canCancel && (
                        <button type="button" onClick={() => openCancelPanel(order.orderId)}>
                          주문 취소
                        </button>
                      )}

                      {order.orderStatus === 'cancelled' && (
                        <button
                          type="button"
                          disabled={repurchaseOrderId === order.orderId}
                          onClick={() => handleRepurchase(order)}
                        >
                          {repurchaseOrderId === order.orderId ? '담는 중' : '재구매하기'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {shippingOrder && (
        <div className="order-panel-backdrop" onClick={() => setShippingOrderId(null)}>
          <section
            className="order-panel-modal order-shipping-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shippingPanelTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-panel-header">
              <div>
                <h2 id="shippingPanelTitle">배송 조회</h2>
                <p>주문번호 {shippingOrder.orderId}</p>
              </div>

              <button
                type="button"
                aria-label="배송 조회 닫기"
                onClick={() => setShippingOrderId(null)}
              >
                ×
              </button>
            </div>

            <div className="order-shipping-body">
              <div className="order-shipping-status">
                <span>현재 배송 상태</span>
                <strong>
                  {STATUS_META[shippingOrder.orderStatus]?.label ?? shippingOrder.orderStatus}
                </strong>
              </div>

              {isShippingDetailLoading ? (
                <LoadingState
                  className="order-history-empty"
                  message="배송 정보를 불러오는 중입니다."
                />
              ) : (
                <dl className="order-shipping-info">
                  <div>
                    <dt>택배사</dt>
                    <dd>{shippingDetail?.courier ?? '운송장 등록 대기'}</dd>
                  </div>

                  <div>
                    <dt>운송장 번호</dt>
                    <dd>{shippingDetail?.trackingNumber ?? '-'}</dd>
                  </div>

                  <div>
                    <dt>받는 사람</dt>
                    <dd>{shippingDetail?.shipping?.receiverName ?? '-'}</dd>
                  </div>

                  <div>
                    <dt>배송지</dt>
                    <dd>
                      {shippingDetail?.shipping
                        ? `${shippingDetail.shipping.address ?? ''} ${
                            shippingDetail.shipping.detailAddress ?? ''
                          }`.trim() || '-'
                        : '-'}
                    </dd>
                  </div>
                </dl>
              )}

              <div className="order-shipping-notice">
                실제 택배사 외부 조회가 아니라 주문에 등록된 운송장 정보를 표시합니다.
              </div>
            </div>

            <div className="order-panel-actions">
              <button type="button" className="is-primary" onClick={() => setShippingOrderId(null)}>
                확인
              </button>
            </div>
          </section>
        </div>
      )}

      {cancelTargetOrder && (
        <div className="order-panel-backdrop" onClick={closeCancelPanel}>
          <section
            className="order-panel-modal order-cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancelPanelTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-panel-header">
              <div>
                <h2 id="cancelPanelTitle">주문 취소</h2>
                <p>주문번호 {cancelTargetOrder.orderId}</p>
              </div>

              {cancelStage !== 'processing' && (
                <button type="button" aria-label="주문 취소 닫기" onClick={closeCancelPanel}>
                  ×
                </button>
              )}
            </div>

            {cancelStage === 'processing' ? (
              <div className="order-cancel-processing">
                <span className="order-cancel-spinner" />
                <strong>주문 취소중입니다.</strong>
                <p>취소 처리가 완료될 때까지 잠시 기다려주세요.</p>
              </div>
            ) : cancelStage === 'success' ? (
              <div className="order-cancel-processing is-success">
                <span className="order-cancel-success">✓</span>
                <strong>주문이 취소되었습니다.</strong>
                <p>재고와 결제 상태를 반영하고 있습니다.</p>
              </div>
            ) : (
              <>
                <div className="order-cancel-body">
                  <p className="order-cancel-guide">취소 사유를 선택해주세요.</p>

                  <div className="order-cancel-reasons">
                    {CANCEL_REASONS.map((reason) => (
                      <label key={reason}>
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(event) => {
                            setCancelReason(event.target.value);
                            setCancelError('');
                          }}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {cancelReason === '기타' && (
                    <textarea
                      value={cancelReasonDetail}
                      maxLength={200}
                      onChange={(event) => {
                        setCancelReasonDetail(event.target.value);
                        setCancelError('');
                      }}
                      placeholder="취소 사유를 입력해주세요."
                    />
                  )}

                  {cancelError && <p className="order-cancel-error">{cancelError}</p>}

                  <div className="order-cancel-note">
                    주문 취소 신청 후 서버에서 재고 및 결제 상태를 함께 처리합니다.
                  </div>
                </div>

                <div className="order-panel-actions">
                  <button type="button" onClick={closeCancelPanel}>
                    돌아가기
                  </button>

                  <button type="button" className="is-primary" onClick={handleCancelOrder}>
                    취소 신청
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {selectedOrder && (
        <div className="order-detail-backdrop" onClick={() => setSelectedOrderId(null)}>
          <section
            className="order-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orderDetailTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-detail-header">
              <div>
                <h2 id="orderDetailTitle">주문 상세</h2>
                <p>{selectedOrder.orderId}</p>
              </div>

              <button
                type="button"
                aria-label="주문 상세 닫기"
                onClick={() => setSelectedOrderId(null)}
              >
                ×
              </button>
            </div>

            <div className="order-detail-body">
              {isSelectedOrderLoading ? (
                <LoadingState
                  className="order-history-empty"
                  message="주문 상세 정보를 불러오는 중입니다."
                />
              ) : !selectedOrderDetail ? (
                <ErrorState
                  className="order-history-empty"
                  message="주문 상세 정보를 불러오지 못했습니다."
                />
              ) : (
                <>
                  {(selectedOrderDetail.items ?? []).map((item) => (
                    <div className="order-detail-product" key={item.orderItemId ?? item.productId}>
                      <div className="order-detail-product-image">
                        {item.imageUrl ? (
                          <img src={normalizeImageUrl(item.imageUrl)} alt={item.name} />
                        ) : (
                          <span>IMAGE</span>
                        )}
                      </div>

                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {[item.color?.toUpperCase(), item.size].filter(Boolean).join(' / ')}
                        </span>
                        <span>
                          ₩ {Number(item.price ?? 0).toLocaleString()} · 수량 {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}

                  <dl className="order-detail-info">
                    <div>
                      <dt>주문 상태</dt>
                      <dd>
                        {STATUS_META[selectedOrder.orderStatus]?.label ?? selectedOrder.orderStatus}
                      </dd>
                    </div>

                    <div>
                      <dt>받는 사람</dt>
                      <dd>{selectedOrderDetail?.shipping?.receiverName ?? '-'}</dd>
                    </div>

                    <div>
                      <dt>연락처</dt>
                      <dd>{selectedOrderDetail?.shipping?.phone ?? '-'}</dd>
                    </div>

                    <div>
                      <dt>배송지</dt>
                      <dd>
                        {selectedOrderDetail?.shipping
                          ? `${selectedOrderDetail.shipping.address ?? ''} ${
                              selectedOrderDetail.shipping.detailAddress ?? ''
                            }`.trim() || '-'
                          : '-'}
                      </dd>
                    </div>

                    <div>
                      <dt>결제수단</dt>
                      <dd>{selectedOrderDetail?.payment?.paymentMethod ?? '-'}</dd>
                    </div>

                    <div>
                      <dt>총 결제금액</dt>
                      <dd>
                        ₩{' '}
                        {Number(
                          selectedOrderDetail?.finalAmount ?? selectedOrder.finalAmount ?? 0
                        ).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default OrderHistoryPage;
