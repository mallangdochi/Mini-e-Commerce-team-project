import { useNavigate } from 'react-router-dom';

import '@/styles/checkoutComplete.css';

function CheckoutComplete() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <section className="checkout-complete-page">
      <div className="checkout-container">
        {/* 상단 단계 인디케이터 (3단계 주문완료 활성화) */}
        <div className="checkout-step-indicator">
          <div className="checkout-step">
            <span className="checkout-step-num">1</span>
            결제 수단
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step">
            <span className="checkout-step-num">2</span>
            배송지 정보
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step checkout-step-active">
            <span className="checkout-step-num">3</span>
            주문완료
          </div>
        </div>

        {/* 주문 완료 안내 영역 */}
        <div className="checkout-complete-content">
          <div className="checkout-complete-icon-box" aria-hidden="true">
            <svg
              className="checkout-complete-check-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="checkout-complete-title">주문이 완료되었습니다.</h1>
          <p className="checkout-complete-desc">이용해주셔서 감사합니다.</p>

          <button type="button" className="checkout-btn-action" onClick={handleGoHome}>
            홈으로 가기
          </button>
        </div>
      </div>
    </section>
  );
}

export default CheckoutComplete;
