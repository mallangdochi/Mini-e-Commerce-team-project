import { getCurrentUserId, getErrorMessage, unwrapRelation } from '@/api/supabaseUtils';
import { supabase } from '@/lib/supabase';

const CATEGORY_TO_TYPE = {
  상품: 'product',
  '주문 / 결제': 'order',
  배송: 'shipping',
  '취소 / 교환 / 반품': 'cancel_return',
  '회원 / 혜택': 'account',
  기타: 'general',
};

const TYPE_TO_CATEGORY = {
  general: '기타',
  product: '상품',
  order: '주문 / 결제',
  payment: '주문 / 결제',
  shipping: '배송',
  cancel_return: '취소 / 교환 / 반품',
  account: '회원 / 혜택',
};

async function resolveOrderDatabaseId(userId, orderNumber) {
  const normalizedOrderNumber = String(orderNumber ?? '').trim();

  if (!normalizedOrderNumber) {
    return null;
  }

  let query = supabase.from('orders').select('id').eq('user_id', userId);

  if (/^\d+$/.test(normalizedOrderNumber)) {
    query = query.or(`order_number.eq.${normalizedOrderNumber},id.eq.${normalizedOrderNumber}`);
  } else {
    query = query.eq('order_number', normalizedOrderNumber);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error('관련 주문을 찾을 수 없습니다.');
  }

  return data.id;
}

function normalizeInquiry(row) {
  const order = unwrapRelation(row?.order);

  return {
    inquiryId: row.id,
    id: row.id,
    category: TYPE_TO_CATEGORY[row.inquiry_type] ?? '기타',
    inquiryType: row.inquiry_type,
    orderId: order?.order_number ?? null,
    orderDatabaseId: row.order_id ?? null,
    productId: row.product_id ?? null,
    title: row.title ?? '',
    content: row.content ?? '',
    status:
      row.status === 'answered' ? 'answered' : row.status === 'closed' ? 'answered' : 'waiting',
    rawStatus: row.status,
    answer: row.answer ?? '',
    answeredAt: row.answered_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

const INQUIRY_SELECT = `
  *,
  order:orders (
    order_number
  )
`;

export const getInquiries = async () => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('inquiries')
      .select(INQUIRY_SELECT)
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return {
      data: (data ?? []).map(normalizeInquiry),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '문의 내역을 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const createInquiry = async ({ category, orderId, title, content }) => {
  try {
    const userId = await getCurrentUserId();
    const orderDatabaseId = await resolveOrderDatabaseId(userId, orderId);

    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_id: userId,
        order_id: orderDatabaseId,
        inquiry_type: CATEGORY_TO_TYPE[category] ?? 'general',
        title: String(title ?? '').trim(),
        content: String(content ?? '').trim(),
        status: 'pending',
      })
      .select(INQUIRY_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '문의가 접수되었습니다.',
      data: normalizeInquiry(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '문의를 등록하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const updateInquiry = async (inquiryId, { category, orderId, title, content }) => {
  try {
    const userId = await getCurrentUserId();
    const orderDatabaseId = await resolveOrderDatabaseId(userId, orderId);

    const { data, error } = await supabase
      .from('inquiries')
      .update({
        order_id: orderDatabaseId,
        inquiry_type: CATEGORY_TO_TYPE[category] ?? 'general',
        title: String(title ?? '').trim(),
        content: String(content ?? '').trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .select(INQUIRY_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '문의가 수정되었습니다.',
      data: normalizeInquiry(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '문의를 수정하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const deleteInquiry = async (inquiryId) => {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw error;
    }

    return {
      message: '문의가 삭제되었습니다.',
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '문의를 삭제하지 못했습니다.'), {
      cause: error,
    });
  }
};
