import { supabase } from '@/lib/supabase';

function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

function mapOrderStatus(status) {
  const statusMap = {
    payment_completed: 'paymentCompleted',
    preparing: 'preparing',
    shipping: 'shipping',
    delivered: 'delivered',
    cancelled: 'cancelled',
    return_requested: 'returnRequested',
    returned: 'returned',
    exchange_requested: 'exchangeRequested',
    exchanged: 'exchanged',
  };

  return statusMap[status] ?? status ?? 'paymentCompleted';
}

function getPublicImageUrl(storagePath) {
  if (!storagePath) {
    return '';
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);

  return data?.publicUrl ?? '';
}

function normalizeOrderItem(item) {
  const productRelation = Array.isArray(item?.product) ? item.product[0] : item?.product;

  return {
    orderItemId: item.id,
    id: item.id,
    productId: item.product_id,
    productType: productRelation?.product_type ?? 'product',
    name: item.product_name ?? '',
    productName: item.product_name ?? '',
    color: item.color_name ?? '',
    size: item.size ?? '',
    imagePath: item.image_path ?? '',
    imageUrl: getPublicImageUrl(item.image_path),
    unitPrice: Number(item.unit_price ?? 0),
    price: Number(item.unit_price ?? 0),
    quantity: Number(item.quantity ?? 1),
    lineTotal: Number(item.line_total ?? 0),
  };
}

function normalizeOrder(row) {
  const items = (row.order_items ?? []).map(normalizeOrderItem);
  const firstItem = items[0] ?? null;

  return {
    id: row.id,
    databaseId: row.id,
    orderId: row.order_number,
    orderNumber: row.order_number,
    orderDate: row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    orderStatus: mapOrderStatus(row.order_status),
    status: mapOrderStatus(row.order_status),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal ?? 0),
    productAmount: Number(row.subtotal ?? 0),
    couponDiscount: Number(row.coupon_discount ?? 0),
    pointsUsed: Number(row.points_used ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    finalAmount: Number(row.final_amount ?? 0),
    totalAmount: Number(row.final_amount ?? 0),
    totalItemCount: items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    userCouponId: row.user_coupon_id ?? null,
    courier: row.courier ?? '',
    trackingNumber: row.tracking_number ?? '',
    cancelledAt: row.cancelled_at ?? null,
    deliveredAt: row.delivered_at ?? null,
    cancelReason: row.cancel_reason ?? '',
    shipping: {
      receiverName: row.recipient_name ?? '',
      name: row.recipient_name ?? '',
      phone: row.recipient_phone ?? '',
      postcode: row.postcode ?? '',
      zonecode: row.postcode ?? '',
      address: row.shipping_address ?? '',
      detailAddress: row.shipping_detail_address ?? '',
      memo: row.delivery_message ?? '',
    },
    payment: {
      paymentMethod: row.payment_method ?? '',
      paymentStatus: row.payment_status ?? '',
    },
    items,
    representativeProduct: firstItem
      ? {
          productId: firstItem.productId,
          productType: firstItem.productType,
          name: firstItem.name,
          imageUrl: firstItem.imageUrl,
        }
      : {},
  };
}

const ORDER_SELECT = `
  id,
  order_number,
  order_status,
  payment_status,
  payment_method,
  subtotal,
  coupon_discount,
  points_used,
  shipping_fee,
  final_amount,
  user_coupon_id,
  recipient_name,
  recipient_phone,
  postcode,
  shipping_address,
  shipping_detail_address,
  delivery_message,
  courier,
  tracking_number,
  cancel_reason,
  cancelled_at,
  delivered_at,
  created_at,
  updated_at,
  order_items (
    id,
    product_id,
    variant_id,
    product_name,
    color_name,
    size,
    image_path,
    unit_price,
    quantity,
    line_total,
    product:products (
      product_type
    )
  )
`;

export const createOrder = async ({ items, shipping, paymentMethod, couponId, pointsUsed = 0 }) => {
  try {
    const normalizedCouponId =
      couponId === undefined || couponId === null || couponId === '' ? null : Number(couponId);

    const { data, error } = await supabase.rpc('create_order', {
      p_items: items,
      p_shipping: shipping,
      p_payment_method: paymentMethod,
      p_coupon_id: Number.isFinite(normalizedCouponId) ? normalizedCouponId : null,
      p_points_used: Math.max(0, Number(pointsUsed) || 0),
    });

    if (error) {
      throw error;
    }

    if (!data?.success || !data?.data) {
      throw new Error(data?.message || '주문을 완료하지 못했습니다.');
    }

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '주문을 완료하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const getOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 10);
    const from = (normalizedPage - 1) * normalizedLimit;
    const to = from + normalizedLimit - 1;

    const { data, count, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT, {
        count: 'exact',
      })
      .order('created_at', {
        ascending: false,
      })
      .range(from, to);

    if (error) {
      throw error;
    }

    const orders = (data ?? []).map(normalizeOrder);

    return {
      data: {
        orders,
        pagination: {
          page: normalizedPage,
          limit: normalizedLimit,
          totalCount: Number(count ?? orders.length),
          totalPages: Math.max(1, Math.ceil(Number(count ?? orders.length) / normalizedLimit)),
        },
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '주문 내역을 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const getOrder = async (orderId) => {
  try {
    const normalizedOrderId = String(orderId ?? '').trim();

    if (!normalizedOrderId) {
      throw new Error('주문번호를 확인할 수 없습니다.');
    }

    let query = supabase.from('orders').select(ORDER_SELECT);

    if (/^\d+$/.test(normalizedOrderId)) {
      query = query.or(`order_number.eq.${normalizedOrderId},id.eq.${normalizedOrderId}`);
    } else {
      query = query.eq('order_number', normalizedOrderId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('주문 정보를 찾을 수 없습니다.');
    }

    return {
      data: normalizeOrder(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '주문 정보를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const cancelOrder = async (orderId, reason = '', detail = '') => {
  try {
    const normalizedOrderId = String(orderId ?? '').trim();

    const { data, error } = await supabase.rpc('cancel_my_order', {
      p_order_number: normalizedOrderId,
      p_reason: String(reason ?? '').trim() || null,
      p_detail: String(detail ?? '').trim() || null,
    });

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.message || '주문을 취소하지 못했습니다.');
    }

    return getOrder(normalizedOrderId);
  } catch (error) {
    throw new Error(getErrorMessage(error, '주문을 취소하지 못했습니다.'), {
      cause: error,
    });
  }
};
