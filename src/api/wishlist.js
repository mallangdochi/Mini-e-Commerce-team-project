import { supabase } from '@/lib/supabase';
import { getProduct } from '@/api/products';

function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
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

async function buildWishlistItem(row) {
  const productResponse = await getProduct(row.product_id);
  const product = productResponse.data;

  return {
    id: row.id,
    wishlistId: row.id,
    productId: Number(row.product_id),
    productType:
      product?.productType === 'set' || product?.categoryId === 'sets' ? 'set' : 'product',
    createdAt: row.created_at ?? null,
    addedAt: row.created_at ?? null,
    product,
  };
}

export const getWishlist = async () => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const items = await Promise.all((data ?? []).map(buildWishlistItem));

    return {
      data: {
        items,
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '찜 목록을 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const addWishlist = async ({ productId }) => {
  try {
    const userId = await getCurrentUserId();
    const normalizedProductId = Number(productId);

    if (!Number.isFinite(normalizedProductId)) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    const { data, error } = await supabase
      .from('wishlists')
      .upsert(
        {
          user_id: userId,
          product_id: normalizedProductId,
        },
        {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: true,
        }
      )
      .select('id, product_id, created_at')
      .maybeSingle();

    if (error) {
      throw error;
    }

    let row = data;

    if (!row) {
      const { data: existingRow, error: existingError } = await supabase
        .from('wishlists')
        .select('id, product_id, created_at')
        .eq('user_id', userId)
        .eq('product_id', normalizedProductId)
        .single();

      if (existingError) {
        throw existingError;
      }

      row = existingRow;
    }

    return {
      message: '찜한 상품에 추가되었습니다.',
      data: await buildWishlistItem(row),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '찜한 상품에 추가하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const removeWishlist = async (productId) => {
  try {
    const userId = await getCurrentUserId();
    const normalizedProductId = Number(productId);

    if (!Number.isFinite(normalizedProductId)) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', normalizedProductId);

    if (error) {
      throw error;
    }

    return {
      message: '찜한 상품에서 삭제되었습니다.',
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '찜한 상품에서 삭제하지 못했습니다.'), {
      cause: error,
    });
  }
};
