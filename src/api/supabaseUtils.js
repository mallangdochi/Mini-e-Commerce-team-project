import { supabase } from '@/lib/supabase';

export function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

export async function getCurrentUser(errorMessage = '로그인이 필요합니다.') {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(errorMessage);
  }

  return user;
}

export async function getCurrentUserId(errorMessage) {
  const user = await getCurrentUser(errorMessage);
  return user.id;
}

export function getProductImageUrl(storagePath) {
  if (!storagePath) {
    return '';
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);

  return data?.publicUrl ?? '';
}

export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function normalizePhone(value) {
  return String(value ?? '').replace(/[^\d]/g, '');
}

export function unwrapRelation(value) {
  return Array.isArray(value) ? value[0] : value;
}
