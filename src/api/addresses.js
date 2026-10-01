import { getCurrentUserId, getErrorMessage } from '@/api/supabaseUtils';
import { supabase } from '@/lib/supabase';

function normalizeAddress(item) {
  return {
    id: item.id,
    addressId: item.id,
    addressName: item.label ?? '배송지',
    label: item.label ?? '배송지',
    receiverName: item.recipient_name ?? '',
    recipientName: item.recipient_name ?? '',
    phone: item.phone ?? '',
    postcode: item.postcode ?? '',
    address: item.address ?? '',
    detailAddress: item.detail_address ?? '',
    isDefault: Boolean(item.is_default),
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  };
}

function normalizePayload(payload = {}) {
  return {
    label: String(payload.addressName ?? payload.label ?? '배송지').trim() || '배송지',
    recipient_name: String(payload.receiverName ?? payload.recipientName ?? '').trim(),
    phone: String(payload.phone ?? '').replace(/[^\d]/g, ''),
    postcode: String(payload.postcode ?? '').trim(),
    address: String(payload.address ?? '').trim(),
    detail_address: String(payload.detailAddress ?? payload.detail_address ?? '').trim(),
  };
}

async function clearDefaultAddress(userId) {
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);

  if (error) {
    throw error;
  }
}

export const getAddresses = async () => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      data: (data ?? []).map(normalizeAddress),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '배송지 정보를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
};

export const createAddress = async (payload) => {
  try {
    const userId = await getCurrentUserId();
    const normalizedPayload = normalizePayload(payload);
    const shouldBeDefault = Boolean(payload?.isDefault);

    const { count, error: countError } = await supabase
      .from('addresses')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', userId);

    if (countError) {
      throw countError;
    }

    const isDefault = shouldBeDefault || Number(count ?? 0) === 0;

    if (isDefault) {
      await clearDefaultAddress(userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        ...normalizedPayload,
        is_default: isDefault,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '배송지가 저장되었습니다.',
      data: normalizeAddress(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '배송지를 저장하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const updateAddress = async (addressId, payload) => {
  try {
    const userId = await getCurrentUserId();
    const normalizedPayload = normalizePayload(payload);

    const { data, error } = await supabase
      .from('addresses')
      .update(normalizedPayload)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '배송지가 수정되었습니다.',
      data: normalizeAddress(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '배송지를 수정하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const userId = await getCurrentUserId();

    const { data: targetAddress, error: targetError } = await supabase
      .from('addresses')
      .select('id, is_default')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (targetError) {
      throw targetError;
    }

    if (!targetAddress) {
      throw new Error('삭제할 배송지를 찾을 수 없습니다.');
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (targetAddress.is_default) {
      const { data: nextAddress, error: nextAddressError } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextAddressError) {
        throw nextAddressError;
      }

      if (nextAddress?.id) {
        const { error: setDefaultError } = await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', nextAddress.id)
          .eq('user_id', userId);

        if (setDefaultError) {
          throw setDefaultError;
        }
      }
    }

    return {
      message: '배송지가 삭제되었습니다.',
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '배송지를 삭제하지 못했습니다.'), {
      cause: error,
    });
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const userId = await getCurrentUserId();

    const { data: targetAddress, error: targetError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (targetError) {
      throw targetError;
    }

    if (!targetAddress) {
      throw new Error('기본 배송지로 지정할 주소를 찾을 수 없습니다.');
    }

    await clearDefaultAddress(userId);

    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      message: '기본 배송지가 변경되었습니다.',
      data: normalizeAddress(data),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, '기본 배송지를 변경하지 못했습니다.'), {
      cause: error,
    });
  }
};
