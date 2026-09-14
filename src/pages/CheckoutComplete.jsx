import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCartStore } from '@/store/cartStore';
import '@/styles/checkoutComplete.css';

function CheckoutComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  const removeOrderedItems = useCartStore((state) => state.removeOrderedItems);

  const { orderItems = [] } = location.state || {};

  useEffect(() => {
    if (orderItems.length > 0) {
      removeOrderedItems(orderItems);
    }
  }, [orderItems, removeOrderedItems]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <section className="checkout-complete-page">
      <div className="checkout-container">
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
