import {
  STATUS_META,
  formatDate,
  formatShortDate,
  getOptionText,
  getOrderImage,
  getOrderName,
} from './orderHistoryUtils';

function OrderCard({
  order,
  detail,
  isRepurchasing,
  onOpenDetail,
  onShippingInfo,
  onCancel,
  onRepurchase,
}) {
  const firstItem = detail?.items?.[0];
  const status = STATUS_META[order.orderStatus] ?? {
    label: order.orderStatus,
    step: -1,
  };
  const imageUrl = getOrderImage(order, detail);
  const optionText = getOptionText(detail);
  const finalAmount = Number(order.finalAmount ?? detail?.finalAmount ?? 0);
  const totalItemCount = Number(order.totalItemCount ?? detail?.items?.length ?? 1);
  const canCancel = order.orderStatus === 'paymentCompleted' || order.orderStatus === 'preparing';

  return (
    <article className="order-history-card">
      <div className="order-history-card-head">
        <div>
          <strong>{formatDate(order.orderDate)}</strong>
          <span className="order-history-head-divider">|</span>
          <span>주문번호 {order.orderId}</span>
        </div>

        <button type="button" onClick={() => onOpenDetail(order.orderId)}>
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
              {detail?.cancelledAt ? `${formatDate(detail.cancelledAt)} 취소 완료` : '취소 완료'}
            </span>
          )}
        </div>

        <div
          className={`order-history-progress${
            order.orderStatus === 'cancelled' ? ' is-cancelled' : ''
          }`}
        >
          {order.orderStatus === 'cancelled' ? (
            <div className="order-history-progress-cancelled">주문이 취소되었습니다.</div>
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
              onClick={() => onShippingInfo(order.orderId)}
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
            <button type="button" onClick={() => onCancel(order.orderId)}>
              주문 취소
            </button>
          )}

          {order.orderStatus === 'cancelled' && (
            <button type="button" disabled={isRepurchasing} onClick={() => onRepurchase(order)}>
              {isRepurchasing ? '담는 중' : '재구매하기'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default OrderCard;
