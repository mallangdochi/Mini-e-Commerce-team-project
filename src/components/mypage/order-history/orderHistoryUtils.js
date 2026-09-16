export const ORDER_TABS = [
  { label: '전체', value: 'all' },
  { label: '주문/결제', value: 'order' },
  { label: '배송중', value: 'shipping' },
  { label: '배송완료', value: 'delivered' },
  { label: '취소', value: 'cancelled' },
  { label: '교환/반품', value: 'claims' },
];

export const CANCEL_REASONS = [
  '단순 변심',
  '주문 실수',
  '옵션 변경',
  '배송지 변경',
  '다른 상품 구매',
  '기타',
];

export const PERIOD_OPTIONS = [
  { label: '최근 3개월', value: 3 },
  { label: '최근 6개월', value: 6 },
  { label: '최근 1년', value: 12 },
  { label: '전체 기간', value: 0 },
];

export const STATUS_META = {
  paymentCompleted: {
    label: '결제완료',
    step: 0,
  },
  preparing: {
    label: '상품준비중',
    step: 1,
  },
  shipping: {
    label: '배송중',
    step: 2,
  },
  delivered: {
    label: '배송완료',
    step: 3,
  },
  cancelled: {
    label: '주문취소',
    step: -1,
  },
};

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

export function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\s/g, '');
}

export function formatShortDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function getOrderName(order, detail) {
  const firstItem = detail?.items?.[0];
  const representative = order.representativeProduct;
  const baseName = firstItem?.name ?? representative?.name ?? '상품';
  const totalItemCount = Number(order.totalItemCount ?? detail?.items?.length ?? 1);

  if (totalItemCount <= 1) {
    return baseName;
  }

  return `${baseName} 외 ${totalItemCount - 1}개`;
}

export function getOrderImage(order, detail) {
  return normalizeImageUrl(detail?.items?.[0]?.imageUrl ?? order.representativeProduct?.imageUrl);
}

export function getOptionText(detail) {
  const firstItem = detail?.items?.[0];

  if (!firstItem) {
    return '';
  }

  const color = typeof firstItem.color === 'string' ? firstItem.color : firstItem.color?.label;

  return [color?.toUpperCase(), firstItem.size].filter(Boolean).join(' / ');
}

export function isWithinPeriod(dateString, months) {
  if (!months) {
    return true;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const boundary = new Date();
  boundary.setMonth(boundary.getMonth() - months);

  return date >= boundary;
}

export function matchesTab(status, tab) {
  if (tab === 'all') {
    return true;
  }

  if (tab === 'order') {
    return status === 'paymentCompleted' || status === 'preparing';
  }

  if (tab === 'shipping') {
    return status === 'shipping';
  }

  if (tab === 'delivered') {
    return status === 'delivered';
  }

  if (tab === 'cancelled') {
    return status === 'cancelled';
  }

  if (tab === 'claims') {
    return false;
  }

  return true;
}
