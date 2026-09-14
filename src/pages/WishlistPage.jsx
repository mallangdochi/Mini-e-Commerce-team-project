import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getMe } from '@/api/authApi';
import { getProduct, getSet } from '@/api/products';
import { getWishlist, removeWishlist } from '@/api/wishlist';
import { useCartStore } from '@/store/cartStore';
import '@/styles/order-history.css';
import '@/styles/wishlist.css';

const MY_PAGE_MENU = [
  { label: '마이페이지 홈', to: '/mypage' },
  { label: '주문 내역', to: '/mypage/orders' },
  { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
  { label: '내 리뷰', to: '/mypage/reviews' },
  { label: '쿠폰 및 혜택', to: '/mypage/coupons' },
  { label: '회원 정보 수정', to: '/mypage/profile' },
  { label: '배송지 관리', to: '/mypage/addresses' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '찜한 상품', to: '/mypage/wishlist' },
];

const SORT_OPTIONS = [
  { label: '최근 등록순', value: 'recent' },
  { label: '낮은 가격순', value: 'priceAsc' },
  { label: '높은 가격순', value: 'priceDesc' },
  { label: '이름순', value: 'name' },
];

function ProfileAvatar() {
  return (
    <div className="order-profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="27" r="16" />
        <path d="M16 68c3.5-16 13.6-24 24-24s20.5 8 24 24" />
      </svg>
    </div>
  );
}

function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function getProfile(response) {
  return response?.data?.user ?? response?.data ?? response?.user ?? response?.userInfo ?? null;
}

function getWishlistItems(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.wishlist)) {
    return data.wishlist;
  }

  return [];
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

function getProductImage(product) {
  return normalizeImageUrl(
    product?.imageUrl ?? product?.images?.thumbnail ?? product?.images?.front ?? product?.thumbnail
  );
}

function getFirstAvailableSize(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

  return sizes.find((item) => Number(item?.stock ?? item?.quantity ?? 0) > 0) ?? null;
}

function getFirstColor(product) {
  if (!Array.isArray(product?.colors) || product.colors.length === 0) {
    return '';
  }

  const color = product.colors[0];

  if (typeof color === 'string') {
    return color;
  }

  return color?.value ?? color?.id ?? color?.name ?? '';
}

function getProductType(product) {
  return product?.productType === 'set' || product?.categoryId === 'sets' ? 'set' : 'product';
}

function isSoldOut(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

  if (sizes.length === 0) {
    return false;
  }

  return sizes.every((item) => Number(item?.stock ?? item?.quantity ?? 0) <= 0);
}

function getOptionText(product) {
  const color = getFirstColor(product);
  const size = getFirstAvailableSize(product)?.size;

  return [color, size].filter(Boolean).join(' / ');
}

async function loadWishlistProduct(item) {
  if (item?.product && typeof item.product === 'object') {
    return item.product;
  }

  const productId = Number(item?.productId ?? item?.id);

  if (!Number.isFinite(productId)) {
    return null;
  }

  try {
    const response = await getProduct(productId);

    return response?.data ?? response;
  } catch {
    try {
      const response = await getSet(productId);

      return response?.data ?? response;
    } catch {
      return null;
    }
  }
}

function WishlistPage() {
  const navigate = useNavigate();
  const addCartItem = useCartStore((state) => state.addItem);

  const [user, setUser] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [sortType, setSortType] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartLoadingId, setCartLoadingId] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [profileResponse, wishlistResponse] = await Promise.all([
          getMe(accessToken),
          getWishlist(),
        ]);

        const rawWishlist = getWishlistItems(wishlistResponse);
        const productResults = await Promise.all(
          rawWishlist.map(async (item) => {
            const product = await loadWishlistProduct(item);

            if (!product) {
              return null;
            }

            return {
              wishlistId: item.id ?? item.wishlistId ?? `${item.productId}`,
              productId: Number(item.productId ?? product.id),
              createdAt: item.createdAt ?? item.created_at ?? null,
              product,
            };
          })
        );

        setUser(getProfile(profileResponse));
        setWishlistItems(productResults.filter(Boolean));
      } catch (error) {
        setErrorMessage(error.message || '찜한 상품을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const sortedItems = useMemo(() => {
    const nextItems = [...wishlistItems];

    if (sortType === 'priceAsc') {
      return nextItems.sort((a, b) => Number(a.product.price) - Number(b.product.price));
    }

    if (sortType === 'priceDesc') {
      return nextItems.sort((a, b) => Number(b.product.price) - Number(a.product.price));
    }

    if (sortType === 'name') {
      return nextItems.sort((a, b) => a.product.name.localeCompare(b.product.name, 'ko'));
    }

    return nextItems.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [sortType, wishlistItems]);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const email = user?.email ?? '';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  const handleRemoveWishlist = async (wishlistId) => {
    try {
      await removeWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.wishlistId !== wishlistId));
    } catch (error) {
      alert(error.message || '찜한 상품을 삭제하지 못했습니다.');
    }
  };

  const handleAddCart = (item) => {
    const { product } = item;
    const availableSize = getFirstAvailableSize(product);
    const color = getFirstColor(product);

    if (isSoldOut(product)) {
      return;
    }

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !availableSize) {
      return;
    }

    setCartLoadingId(item.wishlistId);

    addCartItem({
      productId: Number(product.id ?? item.productId),
      productType: getProductType(product),
      name: product.name,
      imageUrl: getProductImage(product),
      price: Number(product.price ?? 0),
      color,
      colorLabel: color,
      size: availableSize?.size,
      stock: Number(availableSize?.stock ?? availableSize?.quantity ?? 0) || undefined,
      quantity: 1,
    });

    window.setTimeout(() => {
      setCartLoadingId(null);
      navigate('/cart');
    }, 250);
  };

  const getProductPath = (item) => {
    const type = getProductType(item.product);

    return `/products/${item.productId}${type === 'set' ? '?type=set' : ''}`;
  };

  if (isLoading) {
    return (
      <main className="order-history-page wishlist-page">
        <div className="order-history-loading">찜한 상품을 불러오는 중입니다.</div>
      </main>
    );
  }

  return (
    <main className="order-history-page wishlist-page">
      <div className="order-history-shell">
        <aside className="order-history-sidebar">
          <div className="order-history-user">
            <ProfileAvatar />
            <strong>{userName}님</strong>
            <span>{email}</span>
          </div>

          <div className="order-history-sidebar-divider" />

          <nav className="order-history-nav" aria-label="마이페이지 메뉴">
            {MY_PAGE_MENU.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`order-history-nav-link${
                  item.to === '/mypage/wishlist' ? ' is-active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="order-history-nav-link order-history-logout"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </nav>
        </aside>

        <section className="order-history-content wishlist-content">
          <header className="wishlist-heading">
            <div>
              <h1>찜한 상품</h1>
              <p>관심 있는 상품을 한곳에서 확인하세요.</p>
            </div>
          </header>

          <div className="wishlist-toolbar">
            <strong>총 {wishlistItems.length}개</strong>

            <select
              value={sortType}
              onChange={(event) => setSortType(event.target.value)}
              aria-label="찜한 상품 정렬"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <div className="wishlist-empty">{errorMessage}</div>
          ) : sortedItems.length === 0 ? (
            <div className="wishlist-empty">
              <HeartIcon />
              <strong>찜한 상품이 없습니다.</strong>
              <span>마음에 드는 상품을 찜해두면 이곳에서 확인할 수 있습니다.</span>
              <Link to="/products?category=ALL">상품 보러가기</Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {sortedItems.map((item) => {
                const { product } = item;
                const soldOut = isSoldOut(product);
                const imageUrl = getProductImage(product);
                const optionText = getOptionText(product);

                return (
                  <article className="wishlist-card" key={item.wishlistId}>
                    <div className="wishlist-image-wrap">
                      <Link to={getProductPath(item)} className="wishlist-image-link">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} />
                        ) : (
                          <span className="wishlist-image-empty">IMAGE</span>
                        )}
                      </Link>

                      {soldOut && <span className="wishlist-soldout">SOLD OUT</span>}

                      <button
                        type="button"
                        className="wishlist-heart-button"
                        aria-label={`${product.name} 찜 해제`}
                        onClick={() => handleRemoveWishlist(item.wishlistId)}
                      >
                        <HeartIcon filled />
                      </button>
                    </div>

                    <div className="wishlist-card-info">
                      <h2>{product.name}</h2>
                      {optionText && <p>{optionText}</p>}
                      <strong>₩ {Number(product.price ?? 0).toLocaleString()}</strong>
                    </div>

                    <div className="wishlist-card-actions">
                      <Link to={getProductPath(item)}>상품 보기</Link>

                      <button
                        type="button"
                        disabled={soldOut || cartLoadingId === item.wishlistId}
                        onClick={() => handleAddCart(item)}
                      >
                        {soldOut
                          ? '재입고 알림 신청'
                          : cartLoadingId === item.wishlistId
                            ? '담는 중'
                            : '장바구니 담기'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default WishlistPage;
