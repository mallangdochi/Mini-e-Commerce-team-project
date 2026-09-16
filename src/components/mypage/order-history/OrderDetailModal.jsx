import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';

import { STATUS_META, normalizeImageUrl } from './orderHistoryUtils';

function OrderDetailModal({ order, detail, loading, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="order-detail-backdrop" onClick={onClose}>
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
            <p>{order.orderId}</p>
          </div>

          <button type="button" aria-label="주문 상세 닫기" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="order-detail-body">
          {loading ? (
            <LoadingState
              className="order-history-empty"
              message="주문 상세 정보를 불러오는 중입니다."
            />
          ) : !detail ? (
            <ErrorState
              className="order-history-empty"
              message="주문 상세 정보를 불러오지 못했습니다."
            />
          ) : (
            <>
              {(detail.items ?? []).map((item) => {
                const color = typeof item.color === 'string' ? item.color : item.color?.label;

                return (
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
                      <span>{[color?.toUpperCase(), item.size].filter(Boolean).join(' / ')}</span>
                      <span>
                        ₩ {Number(item.price ?? 0).toLocaleString()} · 수량 {item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}

              <dl className="order-detail-info">
                <div>
                  <dt>주문 상태</dt>
                  <dd>{STATUS_META[order.orderStatus]?.label ?? order.orderStatus}</dd>
                </div>

                <div>
                  <dt>받는 사람</dt>
                  <dd>{detail?.shipping?.receiverName ?? '-'}</dd>
                </div>

                <div>
                  <dt>연락처</dt>
                  <dd>{detail?.shipping?.phone ?? '-'}</dd>
                </div>

                <div>
                  <dt>배송지</dt>
                  <dd>
                    {detail?.shipping
                      ? `${detail.shipping.address ?? ''} ${detail.shipping.detailAddress ?? ''}`.trim() ||
                        '-'
                      : '-'}
                  </dd>
                </div>

                <div>
                  <dt>결제수단</dt>
                  <dd>{detail?.payment?.paymentMethod ?? '-'}</dd>
                </div>

                <div>
                  <dt>총 결제금액</dt>
                  <dd>
                    ₩ {Number(detail?.finalAmount ?? order.finalAmount ?? 0).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default OrderDetailModal;
