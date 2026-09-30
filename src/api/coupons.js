import { supabase } from '@/lib/supabase';

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

function resolveCouponStatus(userCoupon, coupon) {
  if (userCoupon.status === 'used' || userCoupon.used_at) {
    return 'used';
  }

  if (userCoupon.status === 'expired') {
    return 'expired';
  }

  const expiresAt = userCoupon.expires_at ?? coupon?.ends_at ?? null;

  if (expiresAt) {
    const expiresAtTime = new Date(expiresAt).getTime();

    if (Number.isFinite(expiresAtTime) && expiresAtTime < Date.now()) {
      return 'expired';
    }
  }

  return 'available';
}

function normalizeCoupon(row) {
  const coupon = row.coupon ?? {};
  const expiresAt = row.expires_at ?? coupon.ends_at ?? null;

  return {
    id: row.id,
    userCouponId: row.id,
    couponId: coupon.id ?? row.coupon_id,
    name: coupon.name ?? 'ARC 쿠폰',
    couponName: coupon.name ?? 'ARC 쿠폰',
    code: coupon.code ?? '',
    description: coupon.description ?? '',
    discountType: coupon.discount_type ?? 'fixed',
    discountValue: Number(coupon.discount_value ?? 0),
    minOrderAmount: Number(coupon.minimum_order_amount ?? 0),
    minimumAmount: Number(coupon.minimum_order_amount ?? 0),
    maxDiscount: Number(coupon.max_discount_amount ?? 0),
    maximumDiscount: Number(coupon.max_discount_amount ?? 0),
    couponType: coupon.coupon_type ?? null,
    issueType: coupon.issue_type ?? null,
    issuedAt: row.issued_at ?? null,
    expiresAt,
    usedAt: row.used_at ?? null,
    status: resolveCouponStatus(row, coupon),
    isUsed: row.status === 'used' || Boolean(row.used_at),
  };
}

export const getCoupons = async () => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('user_coupons')
      .select(
        `
        id,
        coupon_id,
        status,
        issued_at,
        expires_at,
        used_at,
        coupon:coupons (
          id,
          name,
          code,
          description,
          discount_type,
          discount_value,
          minimum_order_amount,
          max_discount_amount,
          coupon_type,
          issue_type,
          starts_at,
          ends_at,
          is_active
        )
      `
      )
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      data: (data ?? []).filter((row) => row.coupon?.is_active !== false).map(normalizeCoupon),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '쿠폰 정보를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};
