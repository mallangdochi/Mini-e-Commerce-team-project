import { supabase } from '@/lib/supabase';

function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

function getPublicImageUrl(storagePath) {
  if (!storagePath) {
    return '';
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);

  return data?.publicUrl ?? '';
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  return user.id;
}

function normalizeReview(row) {
  const orderItem = Array.isArray(row?.order_item) ? row.order_item[0] : row?.order_item;

  const order = Array.isArray(orderItem?.order) ? orderItem.order[0] : orderItem?.order;

  const product = Array.isArray(orderItem?.product) ? orderItem.product[0] : orderItem?.product;

  return {
    reviewId: row.id,
    id: row.id,
    orderItemId: row.order_item_id,
    orderId: order?.order_number ?? null,
    productId: Number(row.product_id ?? orderItem?.product_id ?? product?.id),
    productType: product?.product_type ?? 'product',
    name: orderItem?.product_name ?? product?.name ?? '구매 상품',
    productName: orderItem?.product_name ?? product?.name ?? '구매 상품',
    imageUrl: getPublicImageUrl(orderItem?.image_path),
    price: Number(orderItem?.unit_price ?? product?.price ?? 0),
    color: orderItem?.color_name ?? '',
    size: orderItem?.size ?? '',
    rating: Number(row.rating ?? 0),
    title: row.title ?? '',
    content: row.content ?? '',
    userName: '구매 고객',
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

const REVIEW_RELATION_SELECT = `
  id,
  user_id,
  order_item_id,
  product_id,
  rating,
  title,
  content,
  is_visible,
  created_at,
  updated_at,
  order_item:order_items (
    id,
    order_id,
    product_id,
    product_name,
    color_name,
    size,
    image_path,
    unit_price,
    quantity,
    order:orders (
      order_number,
      order_status
    ),
    product:products (
      id,
      product_type,
      name,
      price
    )
  )
`;

async function getPublicReviews(productId, { page = 1, limit = 10 } = {}) {
  const normalizedProductId = Number(productId);
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.max(1, Number(limit) || 10);
  const from = (normalizedPage - 1) * normalizedLimit;
  const to = from + normalizedLimit - 1;

  try {
    const [pageResult, ratingResult] = await Promise.all([
      supabase
        .from('reviews')
        .select(REVIEW_RELATION_SELECT, {
          count: 'exact',
        })
        .eq('product_id', normalizedProductId)
        .eq('is_visible', true)
        .order('created_at', {
          ascending: false,
        })
        .range(from, to),

      supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', normalizedProductId)
        .eq('is_visible', true),
    ]);

    if (pageResult.error) {
      throw pageResult.error;
    }

    if (ratingResult.error) {
      throw ratingResult.error;
    }

    const ratings = (ratingResult.data ?? []).map((item) => Number(item.rating ?? 0));

    const reviewCount = Number(pageResult.count ?? ratings.length);

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    return {
      data: {
        reviews: (pageResult.data ?? []).map(normalizeReview),
        averageRating,
        reviewCount,
        pagination: {
          currentPage: normalizedPage,
          limit: normalizedLimit,
          totalCount: reviewCount,
          totalPages: Math.max(1, Math.ceil(reviewCount / normalizedLimit)),
          hasNextPage: normalizedPage * normalizedLimit < reviewCount,
        },
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '상품 리뷰를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
}

export const getProductReviews = async (productId, params = {}) => {
  return getPublicReviews(productId, params);
};

export const getSetReviews = async (productId, params = {}) => {
  return getPublicReviews(productId, params);
};

export const getMyReviews = async () => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('reviews')
      .select(REVIEW_RELATION_SELECT)
      .eq('user_id', userId)
      .order('updated_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const reviews = (data ?? []).map(normalizeReview);

    return {
      data: {
        reviews,
        items: reviews,
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '내 리뷰를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const getEligibleReviews = async () => {
  try {
    const userId = await getCurrentUserId();

    const [orderItemsResult, reviewsResult] = await Promise.all([
      supabase
        .from('order_items')
        .select(
          `
          id,
          order_id,
          product_id,
          product_name,
          color_name,
          size,
          image_path,
          unit_price,
          quantity,
          order:orders!inner (
            id,
            user_id,
            order_number,
            order_status,
            delivered_at
          ),
          product:products (
            id,
            product_type,
            name,
            price
          )
        `
        )
        .eq('order.user_id', userId)
        .eq('order.order_status', 'delivered')
        .order('id', {
          ascending: false,
        }),

      supabase.from('reviews').select('order_item_id').eq('user_id', userId),
    ]);

    if (orderItemsResult.error) {
      throw orderItemsResult.error;
    }

    if (reviewsResult.error) {
      throw reviewsResult.error;
    }

    const reviewedOrderItemIds = new Set(
      (reviewsResult.data ?? []).map((review) => Number(review.order_item_id))
    );

    const items = (orderItemsResult.data ?? [])
      .filter((item) => !reviewedOrderItemIds.has(Number(item.id)))
      .map((item) => {
        const order = Array.isArray(item.order) ? item.order[0] : item.order;

        const product = Array.isArray(item.product) ? item.product[0] : item.product;

        return {
          orderItemId: item.id,
          orderId: order?.order_number ?? null,
          productId: Number(item.product_id),
          productType: product?.product_type ?? 'product',
          name: item.product_name ?? product?.name ?? '구매 상품',
          productName: item.product_name ?? product?.name ?? '구매 상품',
          imageUrl: getPublicImageUrl(item.image_path),
          price: Number(item.unit_price ?? product?.price ?? 0),
          color: item.color_name ?? '',
          size: item.size ?? '',
          quantity: Number(item.quantity ?? 1),
          deliveredAt: order?.delivered_at ?? null,
        };
      });

    return {
      data: {
        items,
        reviews: items,
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '작성 가능한 리뷰를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const createReview = async ({ orderItemId, rating, content }) => {
  try {
    const userId = await getCurrentUserId();

    const { data: orderItem, error: orderItemError } = await supabase
      .from('order_items')
      .select(
        `
        id,
        product_id,
        order:orders!inner (
          user_id,
          order_status
        )
      `
      )
      .eq('id', orderItemId)
      .eq('order.user_id', userId)
      .eq('order.order_status', 'delivered')
      .single();

    if (orderItemError) {
      throw orderItemError;
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        order_item_id: orderItemId,
        product_id: orderItem.product_id,
        rating: Number(rating),
        content: String(content ?? '').trim(),
        is_visible: true,
      })
      .select(REVIEW_RELATION_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '리뷰가 등록되었습니다.',
      data: normalizeReview(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '리뷰를 등록하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const updateReview = async (reviewId, { rating, content }) => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating: Number(rating),
        content: String(content ?? '').trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select(REVIEW_RELATION_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '리뷰가 수정되었습니다.',
      data: normalizeReview(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '리뷰를 수정하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {
      message: '리뷰가 삭제되었습니다.',
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '리뷰를 삭제하지 못했습니다.'), {
      cause: error,
    });
  }
};
