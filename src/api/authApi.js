import { getCurrentUser, normalizePhone, normalizeText } from '@/api/supabaseUtils';
import { supabase } from '@/lib/supabase';

function getAuthErrorMessage(error, fallbackMessage) {
  const message = String(error?.message ?? '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('email not confirmed')) {
    if (message.includes('email not confirmed')) {
      return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해 주세요.';
    }

    return '아이디 또는 이메일과 비밀번호를 확인해 주세요.';
  }

  if (message.includes('user already registered') || message.includes('already been registered')) {
    return '이미 가입된 이메일입니다.';
  }

  if (message.includes('password')) {
    return error?.message || '비밀번호를 확인해 주세요.';
  }

  return error?.message || fallbackMessage;
}

function normalizeProfile(profile, authUser, summary = {}) {
  const username =
    profile?.username ??
    authUser?.user_metadata?.username ??
    authUser?.user_metadata?.loginId ??
    authUser?.email?.split('@')?.[0] ??
    '';

  const email = profile?.email ?? authUser?.email ?? '';

  return {
    id: profile?.id ?? authUser?.id ?? null,
    userId: profile?.id ?? authUser?.id ?? null,
    loginId: username,
    identifier: username,
    username,
    email,
    name: profile?.name ?? authUser?.user_metadata?.name ?? '',
    phone: profile?.phone ?? authUser?.user_metadata?.phone ?? '',
    role: profile?.role ?? 'user',
    isActive: profile?.is_active !== false,
    agreeTerms: Boolean(profile?.agree_terms),
    agreePrivacy: Boolean(profile?.agree_privacy),
    agreeMarketing: Boolean(profile?.agree_marketing),
    agreedAt: profile?.agreed_at ?? null,
    noticeEmail: profile?.notice_email === undefined ? true : Boolean(profile.notice_email),
    noticeSms: profile?.notice_sms === undefined ? true : Boolean(profile.notice_sms),
    noticePush: Boolean(profile?.notice_push),
    createdAt: profile?.created_at ?? authUser?.created_at ?? null,
    updatedAt: profile?.updated_at ?? null,
    pointBalance: Number(summary.pointBalance ?? 0),
    points: Number(summary.pointBalance ?? 0),
    mileage: Number(summary.pointBalance ?? 0),
    availableCouponCount: Number(summary.availableCouponCount ?? 0),
    couponCount: Number(summary.availableCouponCount ?? 0),
    wishlistCount: Number(summary.wishlistCount ?? 0),
    wishCount: Number(summary.wishlistCount ?? 0),
  };
}

async function getCurrentAuthUser() {
  return getCurrentUser('로그인 정보가 없습니다.');
}

async function getUserSummary(userId) {
  const [pointResult, couponResult, wishlistResult] = await Promise.all([
    supabase.from('point_accounts').select('balance').eq('user_id', userId).maybeSingle(),
    supabase.from('user_coupons').select('status, expires_at, used_at').eq('user_id', userId),
    supabase
      .from('wishlists')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', userId),
  ]);

  const now = Date.now();

  const availableCouponCount = (couponResult.data ?? []).filter((coupon) => {
    if (coupon.status !== 'available') {
      return false;
    }

    if (coupon.used_at) {
      return false;
    }

    if (!coupon.expires_at) {
      return true;
    }

    const expiresAt = new Date(coupon.expires_at).getTime();

    return !Number.isFinite(expiresAt) || expiresAt >= now;
  }).length;

  return {
    pointBalance: Number(pointResult.data?.balance ?? 0),
    availableCouponCount,
    wishlistCount: Number(wishlistResult.count ?? 0),
  };
}

export const login = async ({ id, identifier, password }) => {
  const normalizedIdentifier = normalizeText(identifier ?? id);
  const normalizedPassword = String(password ?? '');

  if (!normalizedIdentifier || !normalizedPassword) {
    throw new Error('아이디 또는 이메일과 비밀번호를 입력해 주세요.');
  }

  try {
    const { data: resolvedEmail, error: resolveError } = await supabase.rpc('resolve_login_email', {
      candidate: normalizedIdentifier,
    });

    if (resolveError) {
      throw resolveError;
    }

    const email = normalizeText(resolvedEmail);

    if (!email) {
      throw new Error('아이디 또는 이메일과 비밀번호를 확인해 주세요.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: normalizedPassword,
    });

    if (error) {
      throw error;
    }

    const meResponse = await getMe();
    const user = meResponse.data.user;

    return {
      message: '로그인되었습니다.',
      data: {
        token: data.session?.access_token ?? null,
        user,
      },
      token: data.session?.access_token ?? null,
      userInfo: user,
    };
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.'),
      {
        cause: error,
      }
    );
  }
};

export const checkIdAvailability = async (loginId) => {
  const candidate = normalizeText(loginId);

  if (!candidate) {
    throw new Error('아이디를 입력해 주세요.');
  }

  try {
    const { data, error } = await supabase.rpc('is_username_available', {
      candidate,
    });

    if (error) {
      throw error;
    }

    const available = Boolean(data);

    return {
      message: available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.',
      data: {
        available,
      },
      available,
    };
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, '아이디 중복확인을 완료하지 못했습니다. 다시 시도해 주세요.'),
      {
        cause: error,
      }
    );
  }
};

export const checkEmailAvailability = async (email) => {
  const candidate = normalizeText(email).toLowerCase();

  if (!candidate) {
    throw new Error('이메일을 입력해 주세요.');
  }

  try {
    const { data, error } = await supabase.rpc('is_email_available', {
      candidate,
    });

    if (error) {
      throw error;
    }

    const available = Boolean(data);

    return {
      message: available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.',
      data: {
        available,
      },
      available,
    };
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, '이메일 중복확인을 완료하지 못했습니다. 다시 시도해 주세요.'),
      {
        cause: error,
      }
    );
  }
};

export const signup = async (signupData) => {
  const normalizedSignupData = {
    loginId: normalizeText(signupData?.loginId),
    email: normalizeText(signupData?.email).toLowerCase(),
    password: String(signupData?.password ?? ''),
    name: normalizeText(signupData?.name),
    phone: normalizePhone(signupData?.phone),
    postcode: normalizeText(signupData?.postcode),
    address: normalizeText(signupData?.address),
    detailAddress: normalizeText(signupData?.detailAddress),
    agreeTerms: Boolean(signupData?.agreeTerms),
    agreePrivacy: Boolean(signupData?.agreePrivacy),
    agreeMarketing: Boolean(signupData?.agreeMarketing),
  };

  try {
    const [idCheck, emailCheck] = await Promise.all([
      checkIdAvailability(normalizedSignupData.loginId),
      checkEmailAvailability(normalizedSignupData.email),
    ]);

    if (!idCheck.available) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }

    if (!emailCheck.available) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedSignupData.email,
      password: normalizedSignupData.password,
      options: {
        data: {
          username: normalizedSignupData.loginId,
          loginId: normalizedSignupData.loginId,
          name: normalizedSignupData.name,
          phone: normalizedSignupData.phone,
          postcode: normalizedSignupData.postcode,
          address: normalizedSignupData.address,
          detailAddress: normalizedSignupData.detailAddress,
          agreeTerms: normalizedSignupData.agreeTerms,
          agreePrivacy: normalizedSignupData.agreePrivacy,
          agreeMarketing: normalizedSignupData.agreeMarketing,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('회원가입 정보를 생성하지 못했습니다.');
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    return {
      message: data.session
        ? '회원가입이 완료되었습니다. 로그인해 주세요.'
        : '회원가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.',
      data: {
        userId: data.user.id,
      },
    };
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, '회원가입을 완료하지 못했습니다. 다시 시도해 주세요.'),
      {
        cause: error,
      }
    );
  }
};

export const getMe = async () => {
  try {
    const authUser = await getCurrentAuthUser();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      throw error;
    }

    const summary = await getUserSummary(authUser.id);
    const user = normalizeProfile(profile, authUser, summary);

    return {
      data: {
        user,
      },
      user,
      userInfo: user,
    };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error, '로그인 정보를 확인할 수 없습니다.'), {
      cause: error,
    });
  }
};

export const updateMe = async ({ email, name, phone, noticeEmail, noticeSms, noticePush }) => {
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedName = normalizeText(name);
  const normalizedPhone = normalizePhone(phone);

  try {
    const authUser = await getCurrentAuthUser();

    if (normalizedEmail && normalizedEmail !== authUser.email) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: normalizedEmail,
      });

      if (authUpdateError) {
        throw authUpdateError;
      }
    }

    const {
      data: { user: refreshedAuthUser },
    } = await supabase.auth.getUser();

    const confirmedEmail = refreshedAuthUser?.email ?? authUser.email ?? normalizedEmail;

    const profileUpdate = {
      email: confirmedEmail,
      name: normalizedName,
      phone: normalizedPhone,
    };

    if (noticeEmail !== undefined) {
      profileUpdate.notice_email = Boolean(noticeEmail);
    }

    if (noticeSms !== undefined) {
      profileUpdate.notice_sms = Boolean(noticeSms);
    }

    if (noticePush !== undefined) {
      profileUpdate.notice_push = Boolean(noticePush);
    }

    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', authUser.id);

    if (error) {
      throw error;
    }

    return getMe();
  } catch (error) {
    throw new Error(getAuthErrorMessage(error, '회원 정보를 수정하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const verifyPassword = async (password) => {
  const normalizedPassword = String(password ?? '');

  try {
    const authUser = await getCurrentAuthUser();

    const { error } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: normalizedPassword,
    });

    if (error) {
      throw error;
    }

    return {
      message: '비밀번호가 확인되었습니다.',
      data: {
        verified: true,
      },
    };
  } catch (error) {
    throw new Error('현재 비밀번호가 일치하지 않습니다.', {
      cause: error,
    });
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    await verifyPassword(currentPassword);

    const { error } = await supabase.auth.updateUser({
      password: String(newPassword ?? ''),
    });

    if (error) {
      throw error;
    }

    return {
      message: '비밀번호가 변경되었습니다.',
    };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error, '비밀번호를 변경하지 못했습니다.'), {
      cause: error,
    });
  }
};
