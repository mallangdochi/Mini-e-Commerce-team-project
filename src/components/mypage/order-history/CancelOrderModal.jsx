import { CANCEL_REASONS } from './orderHistoryUtils';

function CancelOrderModal({
  order,
  stage,
  reason,
  reasonDetail,
  error,
  onReasonChange,
  onReasonDetailChange,
  onClose,
  onSubmit,
}) {
  if (!order) {
    return null;
  }

  return (
    <div className="order-panel-backdrop" onClick={onClose}>
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
            <p>주문번호 {order.orderId}</p>
          </div>

          {stage !== 'processing' && (
            <button type="button" aria-label="주문 취소 닫기" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        {stage === 'processing' ? (
          <div className="order-cancel-processing">
            <span className="order-cancel-spinner" />
            <strong>주문 취소중입니다.</strong>
            <p>취소 처리가 완료될 때까지 잠시 기다려주세요.</p>
          </div>
        ) : stage === 'success' ? (
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
                {CANCEL_REASONS.map((cancelReason) => (
                  <label key={cancelReason}>
                    <input
                      type="radio"
                      name="cancelReason"
                      value={cancelReason}
                      checked={reason === cancelReason}
                      onChange={(event) => onReasonChange(event.target.value)}
                    />
                    <span>{cancelReason}</span>
                  </label>
                ))}
              </div>

              {reason === '기타' && (
                <textarea
                  value={reasonDetail}
                  maxLength={200}
                  onChange={(event) => onReasonDetailChange(event.target.value)}
                  placeholder="취소 사유를 입력해주세요."
                />
              )}

              {error && <p className="order-cancel-error">{error}</p>}

              <div className="order-cancel-note">
                주문 취소 신청 후 서버에서 재고 및 결제 상태를 함께 처리합니다.
              </div>
            </div>

            <div className="order-panel-actions">
              <button type="button" onClick={onClose}>
                돌아가기
              </button>

              <button type="button" className="is-primary" onClick={onSubmit}>
                취소 신청
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CancelOrderModal;
