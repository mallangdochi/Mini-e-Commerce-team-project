import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import useWishlist from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import '@/styles/order-history.css';
import '@/styles/wishlist.css';

const SORT_OPTIONS = [
  { label: '최근 등록순', value: 'recent' },
  { label: '낮은 가격순', value: 'priceAsc' },
  { label: '높은 가격순', value: 'priceDesc' },
  { label: '이름순', value: 'name' },
];

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

function normalizeImageUrl(url) {
  return typeof url === 'string' ? url.trim().replace(/^<|>$/g, '') : '';
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
  const color = Array.isArray(product?.colors) ? product.colors[0] : null;
  if (!color) return '';
  if (typeof color === 'string') return color;
  return color?.value ?? color?.id ?? color?.name ?? '';
}

function getProductType(product) {
  return product?.productType === 'set' || product?.categoryId === 'sets' ? 'set' : 'product';
}

function isSoldOut(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  if (sizes.length === 0) return Number(product?.stock ?? 1) <= 0;
  return sizes.every((item) => Number(item?.stock ?? item?.quantity ?? 0) <= 0);
}

function WishlistPage() {
  const navigate = useNavigate();
  const addCartItem = useCartStore((state) => state.addItem);
  const { wishlistItems, errorMessage, isLoading, removeWishlistItem } = useWishlist();

  const [sortType, setSortType] = useState('recent');
  const [cartLoadingId, setCartLoadingId] = useState(null);

  const sortedItems = useMemo(() => {
    const next = [...wishlistItems];
    if (sortType === 'priceAsc')
      return next.sort((a, b) => Number(a.product.price) - Number(b.product.price));
    if (sortType === 'priceDesc')
      return next.sort((a, b) => Number(b.product.price) - Number(a.product.price));
    if (sortType === 'name')
      return next.sort((a, b) =>
        String(a.product.name).localeCompare(String(b.product.name), 'ko')
      );
    return next.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }, [sortType, wishlistItems]);

  const handleRemoveWishlist = async (wishlistId) => {
    try {
      await removeWishlistItem(wishlistId);
    } catch (error) {
      alert(error.message || '찜한 상품을 삭제하지 못했습니다.');
    }
  };

  const getProductPath = (item) => {
    return `/products/${item.productId}${getProductType(item.product) === 'set' ? '?type=set' : ''}`;
  };

  const handleAddCart = (item) => {
    const { product } = item;
    const availableSize = getFirstAvailableSize(product);
    const color = getFirstColor(product);
    if (isSoldOut(product)) return;

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
      stock:
        Number(availableSize?.stock ?? availableSize?.quantity ?? product?.stock ?? 0) || undefined,
      quantity: 1,
    });

    window.setTimeout(() => {
      setCartLoadingId(null);
      navigate('/cart');
    }, 200);
  };

  return (
    <>
      <section className="order-history-content wishlist-page wishlist-content">
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
          <ErrorState className="wishlist-empty" message={errorMessage} />
        ) : isLoading && wishlistItems.length === 0 ? (
          <LoadingState className="wishlist-empty" message="찜한 상품을 불러오는 중입니다." />
        ) : sortedItems.length === 0 ? (
          <EmptyState
            className="wishlist-empty"
            icon={<HeartIcon />}
            title="찜한 상품이 없습니다."
            description="마음에 드는 상품을 찜해두면 이곳에서 확인할 수 있습니다."
            action={<Link to="/products?category=ALL">상품 보러가기</Link>}
          />
        ) : (
          <div className="wishlist-grid">
            {sortedItems.map((item) => {
              const product = item.product;
              const soldOut = isSoldOut(product);
              const imageUrl = getProductImage(product);
              const color = getFirstColor(product);
              const size = getFirstAvailableSize(product)?.size;

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
                      onClick={() => handleRemoveWishlist(item.wishlistId)}
                      aria-label={`${product.name} 찜 해제`}
                    >
                      <HeartIcon filled />
                    </button>
                  </div>
                  <div className="wishlist-card-info">
                    <h2>{product.name}</h2>
                    {(color || size) && <p>{[color, size].filter(Boolean).join(' / ')}</p>}
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
    </>
  );
}

export default WishlistPage;
