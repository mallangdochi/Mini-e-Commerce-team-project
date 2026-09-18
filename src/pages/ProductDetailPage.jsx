import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { handleAddToCart } from '@/api/alert';
import { getAccessToken } from '@/utils/storage';
import { useCartStore } from '@/store/cartStore';
import { getProduct, getSet } from '@/api/products';
import { getProductReviews, getSetReviews } from '@/api/reviews';
import useWishlistStore from '@/store/wishlistStore';
import '@/styles/product-detail.css';

const COLOR_MAP = {
  black: '#111111',
  white: '#ffffff',
  gray: '#9ca3af',
  navy: '#1f2a44',
  blue: '#5875bf',
  green: '#657a5a',
  khaki: '#7b8062',
  brown: '#7a5541',
  beige: '#d8c6a5',
  pink: '#e8aeb7',
  red: '#b94b4b',
  orange: '#d98245',
  yellow: '#d6b74c',
  purple: '#80649a',
  silver: '#c3c7cc',
};

const APPAREL_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

const KOREAN_SIZE_LABELS = {
  XS: '44',
  S: '44–55',
  M: '55–66',
  L: '66–77',
  XL: '77–88',
  XXL: '88–99',
  '3XL': '99–110',
  '4XL': '110 이상',
};

function getBaseFitSize(height, weight) {
  let sizeIndex;

  if (weight < 48) {
    sizeIndex = 0;
  } else if (weight < 55) {
    sizeIndex = 1;
  } else if (weight < 63) {
    sizeIndex = 2;
  } else if (weight < 72) {
    sizeIndex = 3;
  } else if (weight < 82) {
    sizeIndex = 4;
  } else if (weight < 92) {
    sizeIndex = 5;
  } else if (weight < 102) {
    sizeIndex = 6;
  } else {
    sizeIndex = 7;
  }

  if (height >= 175) {
    sizeIndex += 1;
  } else if (height <= 155) {
    sizeIndex -= 1;
  }

  return APPAREL_SIZE_ORDER[Math.max(0, Math.min(APPAREL_SIZE_ORDER.length - 1, sizeIndex))];
}

function getClosestAvailableSize(baseSize, availableSizes) {
  const baseIndex = APPAREL_SIZE_ORDER.indexOf(baseSize);

  if (baseIndex === -1 || availableSizes.length === 0) {
    return null;
  }

  return availableSizes.reduce((closest, size) => {
    const sizeIndex = APPAREL_SIZE_ORDER.indexOf(size);

    if (sizeIndex === -1) {
      return closest;
    }

    if (!closest) {
      return size;
    }

    const closestIndex = APPAREL_SIZE_ORDER.indexOf(closest);
    const currentDistance = Math.abs(sizeIndex - baseIndex);
    const closestDistance = Math.abs(closestIndex - baseIndex);

    if (currentDistance < closestDistance) {
      return size;
    }

    if (currentDistance === closestDistance && sizeIndex > closestIndex) {
      return size;
    }

    return closest;
  }, null);
}

function getFitLabel(baseSize, recommendedSize) {
  const baseIndex = APPAREL_SIZE_ORDER.indexOf(baseSize);
  const recommendedIndex = APPAREL_SIZE_ORDER.indexOf(recommendedSize);

  if (baseIndex === -1 || recommendedIndex === -1 || baseIndex === recommendedIndex) {
    return '정사이즈 핏 예상';
  }

  if (recommendedIndex > baseIndex) {
    return '조금 여유 있는 핏 예상';
  }

  return '조금 슬림한 핏 예상';
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

const IMAGE_TYPE_ORDER = ['thumbnail', 'styled', 'front', 'side', 'back'];

function getImageValue(image) {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return normalizeImageUrl(image);
  }

  if (Array.isArray(image)) {
    return getImageValue(image[0]);
  }

  return normalizeImageUrl(
    image.imageUrl ??
      image.image_url ??
      image.url ??
      image.src ??
      image.path ??
      image.fileUrl ??
      image.file_url
  );
}

function getImageType(image) {
  return String(
    image?.type ?? image?.imageType ?? image?.image_type ?? image?.kind ?? image?.name ?? ''
  ).toLowerCase();
}

function getImagesContainer(product) {
  return product?.images ?? product?.productImages ?? product?.product_images ?? null;
}

function getSelectedColorImages(product, selectedColor) {
  if (!Array.isArray(product?.colors) || product.colors.length === 0) {
    return [];
  }

  const selected =
    product.colors.find((color) => {
      const keys = [color?.id, color?.value, color?.filterGroup, color?.name, color?.label]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return selectedColor && keys.includes(String(selectedColor).toLowerCase());
    }) ?? product.colors[0];

  const colorImages =
    selected?.images ?? selected?.imageUrls ?? selected?.image_urls ?? selected?.gallery ?? [];

  if (!Array.isArray(colorImages)) {
    return [];
  }

  return colorImages.map(getImageValue).filter(Boolean);
}

function getProductImageByType(product, type) {
  if (!product) {
    return '';
  }

  const images = getImagesContainer(product);

  if (Array.isArray(images)) {
    const matched = images.find((image) => getImageType(image) === type);

    return getImageValue(matched);
  }

  if (images && typeof images === 'object') {
    const direct = images[type] ?? images[type.toUpperCase()];

    if (direct) {
      return getImageValue(direct);
    }

    const matchedEntry = Object.entries(images).find(([key]) => String(key).toLowerCase() === type);

    return getImageValue(matchedEntry?.[1]);
  }

  return '';
}

function getExtraImageCandidates(product, selectedColor) {
  const candidates = [];
  const images = getImagesContainer(product);

  if (Array.isArray(images)) {
    const sorted = [...images].sort(
      (a, b) =>
        Number(a?.sortOrder ?? a?.sort_order ?? 999) - Number(b?.sortOrder ?? b?.sort_order ?? 999)
    );

    sorted.forEach((image) => {
      const value = getImageValue(image);

      if (value) {
        candidates.push(value);
      }
    });
  } else if (images && typeof images === 'object') {
    Object.values(images).forEach((image) => {
      if (Array.isArray(image)) {
        image.forEach((item) => {
          const value = getImageValue(item);

          if (value) {
            candidates.push(value);
          }
        });
        return;
      }

      const value = getImageValue(image);

      if (value) {
        candidates.push(value);
      }
    });
  }

  [product?.imageUrls, product?.image_urls, product?.gallery].forEach((list) => {
    if (!Array.isArray(list)) {
      return;
    }

    list.forEach((image) => {
      const value = getImageValue(image);

      if (value) {
        candidates.push(value);
      }
    });
  });

  candidates.push(...getSelectedColorImages(product, selectedColor));

  return candidates;
}

function getImageList(product, selectedColor) {
  if (!product) {
    return [];
  }

  const slots = IMAGE_TYPE_ORDER.map((type) => {
    if (type === 'thumbnail') {
      return (
        getProductImageByType(product, type) ||
        normalizeImageUrl(product.thumbnail) ||
        normalizeImageUrl(product.thumbnailUrl) ||
        normalizeImageUrl(product.thumbnail_url) ||
        normalizeImageUrl(product.imageUrl) ||
        normalizeImageUrl(product.image_url)
      );
    }

    return getProductImageByType(product, type);
  });

  const extras = getExtraImageCandidates(product, selectedColor);
  let extraIndex = 0;

  const filledSlots = slots.map((slot) => {
    if (slot) {
      return slot;
    }

    while (extraIndex < extras.length) {
      const candidate = extras[extraIndex];
      extraIndex += 1;

      if (candidate) {
        return candidate;
      }
    }

    return '';
  });

  return filledSlots.filter(Boolean).slice(0, 5);
}

function ProductImage({ src, alt, placeholder = 'PRODUCT IMAGE' }) {
  const [failedSrc, setFailedSrc] = useState('');

  if (!src || failedSrc === src) {
    return <span className="main-image-placeholder">{placeholder}</span>;
  }

  return <img src={src} alt={alt} onError={() => setFailedSrc(src)} />;
}

function getReviewStars(rating) {
  const filledCount = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return `${'★'.repeat(filledCount)}${'☆'.repeat(5 - filledCount)}`;
}

function formatReviewDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();

  const isSet = searchParams.get('type') === 'set';

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewLoadError, setReviewLoadError] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const thumbnailListRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const [quantity, setQuantity] = useState(1);

  const [cartMessages, setCartMessages] = useState([]);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);

  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [fitHeight, setFitHeight] = useState('');
  const [fitWeight, setFitWeight] = useState('');
  const [fitRecommendation, setFitRecommendation] = useState(null);
  const [fitError, setFitError] = useState('');

  const addCartItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const response = isSet ? await getSet(productId) : await getProduct(productId);

        if (!isMounted) {
          return;
        }

        const data = response?.data ?? null;

        if (!data) {
          setProduct(null);
          setLoadError('상품 정보를 찾을 수 없습니다.');
          return;
        }

        const firstAvailableSize = data.sizes?.find((item) => Number(item.stock ?? 0) > 0);

        setProduct(data);
        setActiveImageIndex(0);
        setSelectedColor(
          data.colors?.[0]?.value ??
            data.colors?.[0]?.filterGroup ??
            data.colors?.[0]?.filterColor ??
            data.colors?.[0]?.color ??
            data.colors?.[0]?.name ??
            data.colors?.[0]?.label ??
            ''
        );
        setSelectedSize(firstAvailableSize?.size ?? data.sizes?.[0]?.size ?? '');
        setQuantity(1);
        setFitHeight('');
        setFitWeight('');
        setFitRecommendation(null);
        setFitError('');
      } catch {
        if (!isMounted) {
          return;
        }

        setProduct(null);
        setLoadError('상품 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [isSet, productId]);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setReviewLoadError('');

        const response = isSet
          ? await getSetReviews(productId, { page: 1, limit: 3 })
          : await getProductReviews(productId, { page: 1, limit: 3 });

        if (!isMounted) {
          return;
        }

        const data = response?.data ?? {};

        setReviewSummary({
          averageRating: Number(data.averageRating ?? 0),
          reviewCount: Number(data.reviewCount ?? 0),
        });
        setRecentReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setReviewSummary({
          averageRating: 0,
          reviewCount: 0,
        });
        setRecentReviews([]);
        setReviewLoadError(error.message || '리뷰를 불러오지 못했습니다.');
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [isSet, productId]);

  const isWishlisted = wishlistItems.some((item) => {
    const itemProductId = Number(
      item?.productId ?? item?.product?.productId ?? item?.product?.id ?? item?.id
    );
    const currentProductId = Number(product?.productId ?? product?.id ?? productId);

    return itemProductId === currentProductId;
  });

  const imageList = useMemo(() => getImageList(product, selectedColor), [product, selectedColor]);

  const activeImage = imageList[activeImageIndex] ?? '';

  const thumbnailImages = imageList
    .map((image, index) => ({
      image,
      index,
    }))
    .slice(0, 5);

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;

  const availableApparelSizes = useMemo(() => {
    if (!hasSizes) {
      return [];
    }

    return product.sizes
      .filter((item) => Number(item.stock ?? 0) > 0)
      .map((item) => String(item.size).toUpperCase())
      .filter((size) => APPAREL_SIZE_ORDER.includes(size));
  }, [hasSizes, product]);

  const canRecommendFit = availableApparelSizes.length > 0;
  const isShoes = product?.categoryId === 'shoes';

  const sizeGuideTitle = isShoes
    ? '한국 여성 신발 사이즈 가이드'
    : product?.categoryId === 'bottom'
      ? '한국 여성 하의 사이즈 가이드'
      : product?.categoryId === 'sets' || isSet
        ? '한국 여성 세트 사이즈 가이드'
        : '한국 여성 의류 사이즈 가이드';

  const selectedSizeData = hasSizes
    ? product.sizes.find((item) => String(item.size) === String(selectedSize))
    : null;

  const availableStock = hasSizes
    ? Number(selectedSizeData?.stock ?? 0)
    : Number(product?.stock ?? 0);

  const isUnavailable =
    Boolean(product?.isSoldOut) ||
    availableStock <= 0 ||
    (isSet && !selectedColor) ||
    (hasSizes && !selectedSize);

  const price = Number(product?.price ?? 0);
  const reviewDetailPath = `/products/${productId}/reviews${isSet ? '?type=set' : ''}`;

  const originalPrice =
    product?.originalPrice === null || product?.originalPrice === undefined
      ? null
      : Number(product.originalPrice);

  const discountRate =
    originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;

  const detailImageOne =
    getProductImageByType(product, 'styled') ||
    getProductImageByType(product, 'front') ||
    normalizeImageUrl(product?.imageUrl);

  const detailImageTwo =
    getProductImageByType(product, 'front') ||
    getProductImageByType(product, 'side') ||
    normalizeImageUrl(product?.imageUrl);

  const detailWideImage =
    getProductImageByType(product, 'side') ||
    getProductImageByType(product, 'back') ||
    normalizeImageUrl(product?.imageUrl);

  const detailImageThree =
    getProductImageByType(product, 'back') ||
    getProductImageByType(product, 'styled') ||
    normalizeImageUrl(product?.imageUrl);

  const setComponents =
    product?.components ??
    product?.componentProductIds?.map((id) => ({
      productId: id,
      name: `상품 ${id}`,
    })) ??
    [];

  const handleThumbnailScroll = (direction) => {
    const list = thumbnailListRef.current;

    if (!list) {
      return;
    }

    const thumbnail = list.querySelector('.thumbnail');

    if (!thumbnail) {
      return;
    }

    const styles = window.getComputedStyle(list);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const scrollAmount = thumbnail.getBoundingClientRect().width + gap;

    list.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMobileImageChange = (direction) => {
    if (imageList.length <= 1) {
      return;
    }

    setActiveImageIndex((currentIndex) => {
      if (direction === 'next') {
        return (currentIndex + 1) % imageList.length;
      }

      return (currentIndex - 1 + imageList.length) % imageList.length;
    });
  };

  const handleDecreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((currentQuantity) => {
      if (availableStock <= 0) {
        return currentQuantity;
      }

      return Math.min(availableStock, currentQuantity + 1);
    });
  };

  const handleDetailTabClick = (tab, targetId) => {
    setActiveDetailTab(tab);

    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleWriteReview = () => {
    navigate(reviewDetailPath);
  };

  const handleFitRecommendation = () => {
    const height = Number(fitHeight);
    const weight = Number(fitWeight);

    setFitError('');
    setFitRecommendation(null);

    if (!Number.isFinite(height) || !Number.isFinite(weight) || !fitHeight || !fitWeight) {
      setFitError('키와 몸무게를 모두 입력해 주세요.');
      return;
    }

    if (height < 130 || height > 200) {
      setFitError('키는 130cm부터 200cm 사이로 입력해 주세요.');
      return;
    }

    if (weight < 30 || weight > 150) {
      setFitError('몸무게는 30kg부터 150kg 사이로 입력해 주세요.');
      return;
    }

    if (!canRecommendFit) {
      setFitError('이 상품은 키와 몸무게를 이용한 사이즈 추천을 지원하지 않습니다.');
      return;
    }

    const baseSize = getBaseFitSize(height, weight);
    const recommendedSize = getClosestAvailableSize(baseSize, availableApparelSizes);

    if (!recommendedSize) {
      setFitError('현재 추천할 수 있는 재고 보유 사이즈가 없습니다.');
      return;
    }

    setFitRecommendation({
      size: recommendedSize,
      fit: getFitLabel(baseSize, recommendedSize),
      isAdjusted: recommendedSize !== baseSize,
    });
  };

  const handleApplyRecommendedSize = () => {
    if (!fitRecommendation?.size) {
      return;
    }

    setSelectedSize(fitRecommendation.size);
    setQuantity(1);
  };

  const handleWishlistToggle = async () => {
    if (!product) {
      return;
    }

    if (!getAccessToken()) {
      navigate('/login');
      return;
    }

    try {
      const normalizedProductId = Number(product.productId ?? product.id ?? productId);

      if (!Number.isFinite(normalizedProductId)) {
        throw new Error('상품 정보를 확인할 수 없습니다.');
      }

      await toggleWishlistItem({
        ...product,
        id: product.id ?? normalizedProductId,
        productId: normalizedProductId,
        productType: isSet ? 'set' : (product.productType ?? 'product'),
      });
    } catch (error) {
      alert(error.message || '찜한 상품 상태를 변경하지 못했습니다.');
    }
  };

  const createSelectedOrderItem = () => {
    if (!product || isUnavailable) {
      return null;
    }

    const selectedColorData = product.colors?.find(
      (color) =>
        (color.value ??
          color.filterGroup ??
          color.filterColor ??
          color.color ??
          color.name ??
          color.label) === selectedColor
    );

    const colorValue =
      selectedColor ||
      product.colors?.[0]?.value ||
      product.colors?.[0]?.filterGroup ||
      product.colors?.[0]?.filterColor ||
      product.colors?.[0]?.color ||
      product.colors?.[0]?.name ||
      product.colors?.[0]?.label ||
      '';

    const colorLabel =
      selectedColorData?.label ??
      selectedColorData?.filterColor ??
      product.colors?.[0]?.label ??
      product.colors?.[0]?.filterColor ??
      colorValue;

    const optionParts = [];

    if (isSet && colorLabel) {
      optionParts.push(colorLabel);
    }

    if (hasSizes && selectedSize) {
      optionParts.push(selectedSize);
    }

    const productType = isSet ? 'set' : (product.productType ?? 'product');
    const productIdNumber = Number(product.productId);
    const itemId = [
      'direct',
      productType,
      product.productId,
      colorValue || 'none',
      hasSizes ? selectedSize : 'none',
    ].join(':');

    return {
      id: itemId,
      productId: productIdNumber,
      productType,
      name: product.name,
      imageUrl: getProductImageByType(product, 'thumbnail') || normalizeImageUrl(product.imageUrl),
      price,
      originalPrice,
      color: colorValue,
      colorLabel,
      size: hasSizes ? selectedSize : undefined,
      quantity,
      stock: availableStock,
      option: optionParts.join(' / '),
    };
  };

  const handleCartAdd = () => {
    const orderItem = createSelectedOrderItem();

    if (!orderItem) {
      return;
    }

    addCartItem(orderItem);

    handleAddToCart(setCartMessages);
  };

  const handleBuyNow = () => {
    const orderItem = createSelectedOrderItem();

    if (!orderItem) {
      return;
    }

    navigate('/checkout', {
      state: {
        orderItems: [orderItem],
        finalPrice: orderItem.price * orderItem.quantity,
      },
    });
  };

  if (isLoading) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-state">상품 정보를 불러오는 중입니다.</div>
      </main>
    );
  }

  if (loadError || !product) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-state product-detail-state--error">
          <p>{loadError || '상품 정보를 찾을 수 없습니다.'}</p>

          <Link to="/products">상품 목록으로 돌아가기</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">HOME</Link>
        <span>/</span>
        <Link to={`/products?categoryId=${product.categoryId}&gender=${product.gender ?? 'women'}`}>
          {(product.gender ?? 'women').toUpperCase()}
        </Link>
        <span>/</span>
        <Link
          to={`/products?categoryId=${product.categoryId}&category=${product.subCategoryId ?? product.categoryId}`}
        >
          {product.subCategoryId?.toUpperCase() ?? product.categoryId?.toUpperCase()}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-layout">
        <div className="product-gallery">
          <div className="thumbnail-carousel">
            {thumbnailImages.length > 4 && (
              <button
                type="button"
                className="thumbnail-arrow thumbnail-arrow--prev"
                aria-label="이전 상품 이미지"
                onClick={() => handleThumbnailScroll('prev')}
              >
                ‹
              </button>
            )}

            <div className="thumbnail-list" ref={thumbnailListRef}>
              {thumbnailImages.map(({ image, index }) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className="thumbnail"
                  aria-label={`상품 이미지 ${index + 1}`}
                  aria-pressed={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    placeholder={`IMAGE ${index + 1}`}
                  />
                </button>
              ))}
            </div>

            {thumbnailImages.length > 4 && (
              <button
                type="button"
                className="thumbnail-arrow thumbnail-arrow--next"
                aria-label="다음 상품 이미지"
                onClick={() => handleThumbnailScroll('next')}
              >
                ›
              </button>
            )}
          </div>

          <div className="main-image">
            <ProductImage src={activeImage} alt={product.name} />

            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  className="mobile-main-image-arrow mobile-main-image-arrow--prev"
                  aria-label="이전 상품 이미지"
                  onClick={() => handleMobileImageChange('prev')}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="mobile-main-image-arrow mobile-main-image-arrow--next"
                  aria-label="다음 상품 이미지"
                  onClick={() => handleMobileImageChange('next')}
                >
                  ›
                </button>

                <span className="mobile-image-count" aria-hidden="true">
                  {activeImageIndex + 1} / {imageList.length}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="product-info">
          <div className="product-category">{product.categoryId?.toUpperCase()}</div>

          <h1 className="product-title">{product.name}</h1>

          <p className="product-subtitle">{product.subCategoryId?.toUpperCase()}</p>

          <div className="price-area">
            <span className="sale-price">₩ {price.toLocaleString()}</span>

            {discountRate !== null && <span className="discount">{discountRate}%</span>}

            {originalPrice !== null && originalPrice > price && (
              <span className="original-price">₩ {originalPrice.toLocaleString()}</span>
            )}
          </div>

          <Link
            to={reviewDetailPath}
            className="star-rating product-rating-link"
            aria-label={`평균 별점 ${reviewSummary.averageRating.toFixed(1)}점, 리뷰 ${reviewSummary.reviewCount}개`}
          >
            <span className="product-rating-stars">
              {getReviewStars(reviewSummary.averageRating)}
            </span>
            <span className="product-rating-score">{reviewSummary.averageRating.toFixed(1)}</span>
            <span className="review-count">({reviewSummary.reviewCount})</span>
          </Link>

          <p className="product-description">{product.description}</p>

          {isSet && product.colors?.length > 0 && (
            <fieldset className="option-group">
              <legend className="option-title">COLOR</legend>

              <div className="color-list">
                {product.colors.map((color) => {
                  const colorValue =
                    color.value ??
                    color.filterGroup ??
                    color.filterColor ??
                    color.color ??
                    color.name ??
                    color.label;

                  return (
                    <label className="color-option" key={colorValue}>
                      <input
                        type="radio"
                        name="color"
                        value={colorValue}
                        checked={selectedColor === colorValue}
                        onChange={() => setSelectedColor(colorValue)}
                      />

                      <span
                        className="color-circle"
                        title={color.label}
                        style={{
                          backgroundColor:
                            COLOR_MAP[color.filterGroup] ?? COLOR_MAP[colorValue] ?? '#d9d9d9',
                          border:
                            color.filterGroup === 'white' || colorValue === 'white'
                              ? '1px solid #d1d1d1'
                              : undefined,
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {hasSizes && (
            <fieldset className="option-group">
              <legend className="option-title">SIZE</legend>

              <div className="size-list">
                {product.sizes.map((sizeData) => {
                  const size = String(sizeData.size);
                  const isSoldOut = Number(sizeData.stock ?? 0) <= 0;

                  return (
                    <label key={size} className={isSoldOut ? 'is-sold-out' : ''}>
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={selectedSize === size}
                        disabled={isSoldOut}
                        onChange={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                      />
                      <span>{size}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {isSet && setComponents.length > 0 && (
            <section className="set-components">
              <h2 className="option-title">SET 구성</h2>

              <div className="set-component-list">
                {setComponents.map((component) => (
                  <Link
                    key={component.productId}
                    to={`/products/${component.productId}`}
                    className="set-component-item"
                  >
                    {component.imageUrl && (
                      <div className="set-component-image">
                        <ProductImage
                          src={component.imageUrl}
                          alt={component.name}
                          placeholder="IMAGE"
                        />
                      </div>
                    )}

                    <div className="set-component-meta">
                      <strong>{component.name}</strong>

                      {component.price !== undefined && (
                        <span>₩ {Number(component.price).toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="divider" />

          <div className="quantity-area">
            <span className="quantity-label">수량</span>

            <div className="quantity-control">
              <button type="button" onClick={handleDecreaseQuantity} aria-label="수량 감소">
                −
              </button>

              <output aria-live="polite" aria-label="현재 수량">
                {quantity}
              </output>

              <button
                type="button"
                onClick={handleIncreaseQuantity}
                aria-label="수량 증가"
                disabled={availableStock <= quantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="purchase-area">
            <button
              type="button"
              className="buy-button"
              disabled={isUnavailable}
              onClick={handleBuyNow}
            >
              BUY NOW
            </button>

            <div className="cart-row">
              <button
                type="button"
                className="cart-button"
                disabled={isUnavailable}
                onClick={handleCartAdd}
              >
                ADD TO CART
              </button>

              <button
                type="button"
                className={`wish-button${isWishlisted ? ' is-active' : ''}`}
                aria-label={isWishlisted ? '위시리스트에서 삭제' : '위시리스트에 추가'}
                aria-pressed={isWishlisted}
                onClick={handleWishlistToggle}
              >
                {isWishlisted ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="product-detail-content">
        <nav
          className={`detail-tabs${hasSizes ? '' : ' detail-tabs--two'}`}
          aria-label="상품 상세 메뉴"
        >
          <button
            type="button"
            className={`detail-tab${activeDetailTab === 'info' ? ' is-active' : ''}`}
            onClick={() => handleDetailTabClick('info', 'product-info')}
          >
            <span className="detail-tab-icon">◉</span>
            제품 정보
          </button>

          <button
            type="button"
            className={`detail-tab${activeDetailTab === 'review' ? ' is-active' : ''}`}
            onClick={() => handleDetailTabClick('review', 'reviews')}
          >
            <span className="detail-tab-icon">☆</span>
            리뷰
          </button>

          {hasSizes && (
            <button
              type="button"
              className={`detail-tab${activeDetailTab === 'size' ? ' is-active' : ''}`}
              onClick={() => handleDetailTabClick('size', 'size-guide')}
            >
              <span className="detail-tab-icon">✎</span>
              사이즈 가이드
            </button>
          )}
        </nav>

        <section id="product-info" className="detail-info-section detail-scroll-target">
          <h2 className="detail-section-title">특징</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <h3>{product.features || product.name}</h3>

              <p>{product.description}</p>
            </div>

            <div className="detail-image-pair">
              <div className="detail-image">
                <ProductImage
                  src={detailImageOne}
                  alt={`${product.name} 상품 이미지`}
                  placeholder="DETAIL IMAGE"
                />
              </div>

              <div className="detail-image">
                <ProductImage
                  src={detailImageTwo}
                  alt={`${product.name} 착용 이미지`}
                  placeholder="DETAIL IMAGE"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="detail-info-section">
          <h2 className="detail-section-title">핏 &amp; 소재</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>제품 상세</h3>
                <p>{product.details}</p>
              </div>

              <div className="detail-text-block">
                <h3>소재</h3>
                <p>{product.material}</p>
              </div>
            </div>

            <div className="detail-wide-image">
              <ProductImage
                src={detailWideImage}
                alt={`${product.name} 제품 소재와 핏 이미지`}
                placeholder="DETAIL IMAGE"
              />
            </div>
          </div>
        </section>

        <section className="detail-info-section">
          <h2 className="detail-section-title">기능</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>제품 특징</h3>
                <p>{product.features}</p>
              </div>

              <div className="detail-text-block">
                <h3>제품 디테일</h3>
                <p>{product.details}</p>
              </div>
            </div>

            <div className="detail-image-pair">
              <div className="detail-image">
                <ProductImage
                  src={detailImageThree}
                  alt={`${product.name} 기능 설명 이미지`}
                  placeholder="DETAIL IMAGE"
                />
              </div>

              <div className="detail-image">
                <ProductImage
                  src={detailImageOne}
                  alt={`${product.name} 상세 설명 이미지`}
                  placeholder="DETAIL IMAGE"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="detail-info-section">
          <h2 className="detail-section-title">소재 &amp; 관리 방법</h2>

          <div className="detail-info-grid detail-info-grid--text-only">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>소재</h3>

                <p>{product.material}</p>
              </div>

              <div className="detail-text-block">
                <h3>관리 방법</h3>

                <p>{product.care}</p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="reviews" className="product-review-section detail-scroll-target">
        <div className="review-section-header">
          <h2 className="review-section-title">리뷰</h2>

          <button type="button" className="write-review-button" onClick={handleWriteReview}>
            리뷰 작성
          </button>
        </div>

        <div className="review-summary">
          <div className="review-score">
            <strong>{reviewSummary.averageRating.toFixed(1)}</strong>

            <div>
              <div className="review-stars">{getReviewStars(reviewSummary.averageRating)}</div>
              <span>{reviewSummary.reviewCount}개의 리뷰</span>
            </div>
          </div>

          {reviewSummary.reviewCount > 0 && (
            <Link to={reviewDetailPath} className="review-summary-link">
              전체 리뷰 보기
            </Link>
          )}
        </div>

        {reviewLoadError ? (
          <div className="review-list-state">{reviewLoadError}</div>
        ) : recentReviews.length === 0 ? (
          <div className="review-list-state">아직 등록된 리뷰가 없습니다.</div>
        ) : (
          <div className="review-list">
            {recentReviews.map((review) => (
              <article className="review-preview-card" key={review.reviewId}>
                <div className="review-preview-header">
                  <div>
                    <strong>{review.userName || '구매 고객'}</strong>
                    <span>{formatReviewDate(review.createdAt)}</span>
                  </div>

                  <span className="review-preview-badge">구매 리뷰</span>
                </div>

                <div className="review-preview-rating">
                  <span>{getReviewStars(review.rating)}</span>
                  <strong>{Number(review.rating ?? 0).toFixed(1)}</strong>
                </div>

                <p>{review.content}</p>
              </article>
            ))}
          </div>
        )}

        {reviewSummary.reviewCount > 0 && (
          <Link to={reviewDetailPath} className="review-all-button">
            전체 리뷰 보기
          </Link>
        )}
      </section>

      {hasSizes && (
        <section id="size-guide" className="product-size-guide-section detail-scroll-target">
          <div className="size-guide-heading">
            <span>사이즈 가이드</span>

            <h2>{sizeGuideTitle}</h2>

            <p>
              한국에서 익숙한 사이즈 표기를 기준으로 확인해 주세요. 실제 착용감은 상품 디자인과
              체형에 따라 달라질 수 있습니다.
            </p>
          </div>

          <div className="size-guide-content">
            <h3>한국 기준 사이즈</h3>

            <p>현재 상품에서 선택할 수 있는 사이즈를 한국 기준 참고 표기와 함께 정리했습니다.</p>

            <div className="size-table-scroll">
              <table className="size-guide-table">
                <tbody>
                  <tr>
                    <th>{isShoes ? '한국 사이즈' : 'ARC 사이즈'}</th>
                    {product.sizes.map((sizeData) => (
                      <td key={`arc-${sizeData.size}`}>
                        {isShoes ? `${sizeData.size}mm` : String(sizeData.size).toUpperCase()}
                      </td>
                    ))}
                  </tr>

                  {!isShoes && (
                    <tr>
                      <th>한국 기준 참고</th>
                      {product.sizes.map((sizeData) => {
                        const size = String(sizeData.size).toUpperCase();

                        return (
                          <td key={`kr-${sizeData.size}`}>{KOREAN_SIZE_LABELS[size] ?? size}</td>
                        );
                      })}
                    </tr>
                  )}

                  <tr>
                    <th>재고 상태</th>
                    {product.sizes.map((sizeData) => (
                      <td key={`stock-${sizeData.size}`}>
                        {Number(sizeData.stock ?? 0) > 0 ? '선택 가능' : '품절'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {canRecommendFit && (
              <section className="fit-recommendation">
                <div className="fit-recommendation-heading">
                  <span>MY FIT</span>

                  <h3>키와 몸무게로 사이즈 찾기</h3>

                  <p>
                    키와 몸무게를 입력하면 현재 상품의 재고가 있는 사이즈 중 가장 가까운 사이즈를
                    추천합니다.
                  </p>
                </div>

                <div className="fit-recommendation-form">
                  <label className="fit-input-field">
                    <span>키</span>

                    <div>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="130"
                        max="200"
                        step="1"
                        value={fitHeight}
                        onChange={(event) => {
                          setFitHeight(event.target.value);
                          setFitRecommendation(null);
                          setFitError('');
                        }}
                        placeholder="165"
                        aria-label="키 입력"
                      />

                      <span>cm</span>
                    </div>
                  </label>

                  <label className="fit-input-field">
                    <span>몸무게</span>

                    <div>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="30"
                        max="150"
                        step="0.1"
                        value={fitWeight}
                        onChange={(event) => {
                          setFitWeight(event.target.value);
                          setFitRecommendation(null);
                          setFitError('');
                        }}
                        placeholder="55"
                        aria-label="몸무게 입력"
                      />

                      <span>kg</span>
                    </div>
                  </label>

                  <button
                    type="button"
                    className="fit-recommendation-button"
                    onClick={handleFitRecommendation}
                  >
                    추천 사이즈 확인
                  </button>
                </div>

                {fitError && <p className="fit-recommendation-error">{fitError}</p>}

                {fitRecommendation && (
                  <div className="fit-recommendation-result">
                    <div>
                      <span>추천 사이즈</span>
                      <strong>{fitRecommendation.size}</strong>
                    </div>

                    <div>
                      <span>예상 착용감</span>
                      <strong>{fitRecommendation.fit}</strong>
                    </div>

                    <p>
                      {fitRecommendation.isAdjusted
                        ? '기본 추천 사이즈와 가장 가까운 재고 보유 사이즈를 안내했습니다.'
                        : '입력한 키와 몸무게를 기준으로 가장 가까운 사이즈를 안내했습니다.'}
                    </p>

                    <button
                      type="button"
                      className="fit-apply-button"
                      onClick={handleApplyRecommendedSize}
                    >
                      추천 사이즈 선택
                    </button>
                  </div>
                )}

                <p className="fit-recommendation-note">
                  키와 몸무게를 이용한 간단 추천으로, 실제 핏은 체형과 상품별 실측에 따라 달라질 수
                  있습니다.
                </p>
              </section>
            )}

            {!isShoes && (
              <div className="measurement-guide">
                <div className="measurement-text">
                  <h3>측정 방법</h3>

                  <p>
                    편안한 자세로 허리를 곧게 펴고 발끝이 나란하게 서 주세요. 줄자를 몸에 너무
                    조이거나 느슨하지 않게 두고 측정하면 사이즈를 비교하기 쉽습니다.
                  </p>

                  <div className="measurement-item">
                    <strong>1. 가슴둘레</strong>

                    <p>
                      양팔을 자연스럽게 내린 상태에서 가슴의 가장 넓은 부분을 수평으로 측정해
                      주세요.
                    </p>
                  </div>

                  <div className="measurement-item">
                    <strong>2. 허리둘레</strong>

                    <p>허리의 가장 가는 부분을 기준으로 둘레를 측정해 주세요.</p>
                  </div>

                  <div className="measurement-item">
                    <strong>3. 엉덩이둘레</strong>

                    <p>
                      양발을 골반 너비로 벌리고 선 뒤 엉덩이의 가장 볼록한 부분을 수평으로 측정해
                      주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {cartMessages.length > 0 && (
        <div className="cart-alert-overlay">
          <div className="cart-alert-stack">
            {cartMessages.map((message) => (
              <div className="cart-alert" key={message.id}>
                <button
                  type="button"
                  className="cart-alert-close"
                  onClick={() =>
                    setCartMessages((messages) =>
                      messages.filter((cartMessage) => cartMessage.id !== message.id)
                    )
                  }
                  aria-label="알림 닫기"
                >
                  ×
                </button>

                <span className="cart-alert-label">CART</span>

                <strong className="cart-alert-message">장바구니에 상품을 담았습니다.</strong>

                <div className="cart-alert-progress" />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductDetailPage;
