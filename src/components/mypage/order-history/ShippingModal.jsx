import LoadingState from '@/components/common/LoadingState';

import { STATUS_META } from './orderHistoryUtils';

function ShippingModal({ order, detail, loading, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="order-panel-backdrop" onClick={onClose}>
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
            <p>주문번호 {order.orderId}</p>
          </div>

          <button type="button" aria-label="배송 조회 닫기" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="order-shipping-body">
          <div className="order-shipping-status">
            <span>현재 배송 상태</span>
            <strong>{STATUS_META[order.orderStatus]?.label ?? order.orderStatus}</strong>
          </div>

          {loading ? (
            <LoadingState
              className="order-history-empty"
              message="배송 정보를 불러오는 중입니다."
            />
          ) : (
            <dl className="order-shipping-info">
              <div>
                <dt>택배사</dt>
                <dd>{detail?.courier ?? '운송장 등록 대기'}</dd>
              </div>

              <div>
                <dt>운송장 번호</dt>
                <dd>{detail?.trackingNumber ?? '-'}</dd>
              </div>

              <div>
                <dt>받는 사람</dt>
                <dd>{detail?.shipping?.receiverName ?? '-'}</dd>
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
            </dl>
          )}

          <div className="order-shipping-notice">
            실제 택배사 외부 조회가 아니라 주문에 등록된 운송장 정보를 표시합니다.
          </div>
        </div>

        <div className="order-panel-actions">
          <button type="button" className="is-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </section>
    </div>
  );
}

export default ShippingModal;
