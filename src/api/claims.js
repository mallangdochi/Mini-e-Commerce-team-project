import { supabase } from '@/lib/supabase';

function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

function normalizeRequest(row) {
  const order = Array.isArray(row?.order) ? row.order[0] : row?.order;

  const orderItem = Array.isArray(row?.order_item) ? row.order_item[0] : row?.order_item;

  return {
    claimId: row.id,
    requestId: row.id,
    orderId: order?.order_number ?? String(row.order_id ?? ''),
    orderDatabaseId: row.order_id,
    orderItemId: row.order_item_id ?? null,
    type: row.request_type,
    status: row.status ?? 'requested',
    reason: row.reason ?? order?.cancel_reason ?? '사유 정보 없음',
    detail: row.detail ?? '',
    quantity: Number(row.quantity ?? 1),
    refundAmount: Number(row.refund_amount ?? 0),
    adminNote: row.admin_note ?? '',
    requestedAt:
      row.created_at ?? row.requested_at ?? order?.cancelled_at ?? order?.created_at ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
    orderStatus: order?.order_status ?? '',
    finalAmount: Number(order?.final_amount ?? 0),
    item: orderItem
      ? {
          id: orderItem.id,
          productId: orderItem.product_id,
          productName: orderItem.product_name ?? '',
          color: orderItem.color_name ?? '',
          size: orderItem.size ?? '',
          quantity: Number(orderItem.quantity ?? 1),
        }
      : null,
  };
}

export const getOrderRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('order_requests')
      .select(
        `
        *,
        order:orders!inner (
          id,
          order_number,
          order_status,
          cancel_reason,
          cancelled_at,
          created_at,
          final_amount
        ),
        order_item:order_items (
          id,
          product_id,
          product_name,
          color_name,
          size,
          quantity
        )
      `
      )
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return {
      data: (data ?? []).map(normalizeRequest),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '취소/교환/반품 내역을 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const createOrderRequest = async ({
  orderId,
  type,
  reason,
  detail = '',
  orderItemId = null,
  quantity = 1,
}) => {
  try {
    const { data, error } = await supabase.rpc('create_order_request', {
      p_order_number: String(orderId),
      p_request_type: type,
      p_reason: String(reason ?? '').trim(),
      p_detail: String(detail ?? '').trim() || null,
      p_order_item_id:
        orderItemId === null || orderItemId === undefined ? null : Number(orderItemId),
      p_quantity: Math.max(1, Number(quantity) || 1),
    });

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.message || '신청을 접수하지 못했습니다.');
    }

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '교환/반품 신청을 접수하지 못했습니다.'), {
      cause: error,
    });
  }
};
