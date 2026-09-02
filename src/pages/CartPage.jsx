import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '@/styles/cart.css';

const initialCartItems = [
  {
    id: 1,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
  {
    id: 2,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
  {
    id: 3,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
];

function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleOrder = () => {
    navigate('/checkout');
  };

  return (
    <section className="cart-page">
      <div className="cart-container">
        <h1 className="cart-section-title">SHOPPING CART</h1>

        <div className="cart-table-header">
          <span>상품 정보</span>
          <span>가격</span>
          <span>수량</span>
          <span>합계</span>
          <span aria-hidden="true" />
        </div>

        <div className="cart-item-list">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div className="cart-item-row" key={item.id}>
                <div className="cart-product-cell">
                  {item.imageUrl ? (
                    <img className="cart-item-img" src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="cart-item-img-placeholder">IMAGE</div>
                  )}

                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-sub">{item.option}</div>
                  </div>
                </div>

                <div className="cart-item-price">₩ {item.price.toLocaleString()}</div>

                <div className="cart-quantity-box">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    aria-label={`${item.name} 수량 감소`}
                  >
                    −
                  </button>

                  <span className="cart-qty">{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    aria-label={`${item.name} 수량 증가`}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ₩ {(item.price * item.quantity).toLocaleString()}
                </div>

                <button
                  type="button"
                  className="cart-remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label={`${item.name} 장바구니에서 삭제`}
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="cart-empty">장바구니에 담긴 상품이 없습니다.</div>
          )}
        </div>

        <div className="cart-bottom-section">
          <button type="button" className="cart-btn-prev" onClick={handleContinueShopping}>
            &lt; 쇼핑 계속하기
          </button>

          <div className="cart-summary-box">
            <div className="cart-summary-row">
              <span>상품금액</span>
              <span>₩ {totalPrice.toLocaleString()}</span>
            </div>

            <div className="cart-summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <span>총 결제금액</span>
              <span>₩ {totalPrice.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="cart-btn-action"
              onClick={handleOrder}
              disabled={cartItems.length === 0}
            >
              주문하기 &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
