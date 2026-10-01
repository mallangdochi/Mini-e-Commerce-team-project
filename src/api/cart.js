import { getProduct } from '@/api/products';
import {
  getCurrentUserId,
  getErrorMessage,
  normalizeText,
  unwrapRelation,
} from '@/api/supabaseUtils';
import { supabase } from '@/lib/supabase';

function getColorValue(color) {
  if (typeof color === 'string') {
    return color.trim();
  }

  if (!color || typeof color !== 'object') {
    return '';
  }

  return normalizeText(
    color.value ??
      color.filterGroup ??
      color.filterColor ??
      color.color ??
      color.name ??
      color.label
  );
}

function normalizeColorValue(value) {
  return getColorValue(value).toLowerCase();
}

function getItemColorValue(item) {
  return (
    getColorValue(item?.color) ||
    getColorValue(item?.colorValue) ||
    getColorValue(item?.filterGroup) ||
    getColorValue(item?.filterColor) ||
    getColorValue(item?.colorLabel)
  );
}

export function getCartItemKey({ productId, productType, color, size }) {
  return [
    productType ?? 'product',
    Number(productId),
    getColorValue(color) || 'none',
    normalizeText(size) || 'none',
  ].join(':');
}

async function getCartId({ create = false } = {}) {
  const userId = await getCurrentUserId();

  const { data: existingCart, error: selectError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingCart?.id) {
    return existingCart.id;
  }

  if (!create) {
    return null;
  }

  const { data: createdCart, error: insertError } = await supabase
    .from('carts')
    .insert({
      user_id: userId,
    })
    .select('id')
    .single();

  if (!insertError && createdCart?.id) {
    return createdCart.id;
  }

  if (insertError?.code === '23505') {
    const { data: retriedCart, error: retryError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (retryError) {
      throw retryError;
    }

    return retriedCart.id;
  }

  throw insertError;
}

async function getProductData(productId) {
  const response = await getProduct(productId);
  const product = response?.data ?? null;

  if (!product) {
    throw new Error('상품 정보를 찾을 수 없습니다.');
  }

  return product;
}

async function resolveCartSelection(item) {
  const productId = Number(item?.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('상품 정보를 확인할 수 없습니다.');
  }

  const product = await getProductData(productId);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const requestedSize = normalizeText(item?.size);
  let selectedVariant = null;

  if (requestedSize) {
    selectedVariant =
      sizes.find(
        (variant) => normalizeText(variant?.size).toLowerCase() === requestedSize.toLowerCase()
      ) ?? null;
  } else if (sizes.length === 1) {
    selectedVariant = sizes[0];
  }

  if (!selectedVariant?.id) {
    throw new Error('선택한 사이즈 정보를 확인할 수 없습니다.');
  }

  const requestedColor = normalizeColorValue(getItemColorValue(item));

  let selectedColor = null;

  if (requestedColor) {
    selectedColor =
      colors.find((color) => {
        const candidates = [
          color?.value,
          color?.filterGroup,
          color?.filterColor,
          color?.label,
          color?.name,
          color?.colorName,
        ]
          .filter(Boolean)
          .map((value) => normalizeColorValue(value));

        return candidates.includes(requestedColor);
      }) ?? null;
  }

  if (!selectedColor && colors.length > 0) {
    selectedColor = colors[0];
  }

  const stock = Number(selectedVariant.stock ?? 0);

  return {
    product,
    variantId: Number(selectedVariant.id),
    colorId: selectedColor?.id ? Number(selectedColor.id) : null,
    size: normalizeText(selectedVariant.size),
    stock,
    color: selectedColor ?? null,
  };
}

function applyColorFilter(query, colorId) {
  if (colorId === null || colorId === undefined) {
    return query.is('color_id', null);
  }

  return query.eq('color_id', colorId);
}

async function findRemoteCartItem(cartId, variantId, colorId) {
  let query = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId);

  query = applyColorFilter(query, colorId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

function getNormalizedProductType(product) {
  return product?.productType === 'set' || product?.categoryId === 'sets' ? 'set' : 'product';
}

function buildCartItemFromRemote(row, product) {
  const variant = unwrapRelation(row.variant);
  const colorRelation = unwrapRelation(row.color);

  const productType = getNormalizedProductType(product);
  const productColor =
    product.colors?.find((color) => Number(color.id) === Number(row.color_id)) ?? null;

  const colorValue =
    productColor?.value ??
    productColor?.filterGroup ??
    productColor?.filterColor ??
    colorRelation?.filter_group ??
    colorRelation?.filter_color ??
    colorRelation?.color_name ??
    '';

  const colorLabel =
    productColor?.label ?? productColor?.colorName ?? colorRelation?.color_name ?? colorValue;

  const size = normalizeText(variant?.size);
  const stock = Number(variant?.stock ?? 0);
  const optionParts = [];

  if (productType === 'set' && colorLabel) {
    optionParts.push(colorLabel);
  }

  if (size) {
    optionParts.push(size);
  }

  return {
    id: getCartItemKey({
      productId: product.productId,
      productType,
      color: colorValue,
      size,
    }),
    cartItemId: row.id,
    variantId: row.variant_id,
    colorId: row.color_id,
    productId: Number(product.productId),
    productType,
    name: product.name,
    imageUrl: product.imageUrl ?? product.thumbnail ?? '',
    price: Number(product.price ?? 0),
    originalPrice:
      product.originalPrice === null || product.originalPrice === undefined
        ? null
        : Number(product.originalPrice),
    color: colorValue,
    colorLabel,
    size: size || undefined,
    quantity: Math.max(1, Number(row.quantity) || 1),
    stock,
    option: optionParts.join(' / '),
  };
}

export async function getRemoteCartItems() {
  try {
    const cartId = await getCartId({
      create: false,
    });

    if (!cartId) {
      return [];
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        cart_id,
        variant_id,
        color_id,
        quantity,
        created_at,
        updated_at,
        variant:product_variants (
          id,
          product_id,
          size,
          stock,
          is_active
        ),
        color:product_colors (
          id,
          product_id,
          color_name,
          filter_color,
          filter_group,
          hex_code,
          is_active
        )
      `
      )
      .eq('cart_id', cartId)
      .order('created_at', {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    const rows = Array.isArray(data) ? data : [];
    const productIds = [
      ...new Set(
        rows
          .map((row) => {
            const variant = unwrapRelation(row.variant);

            return Number(variant?.product_id);
          })
          .filter((productId) => Number.isInteger(productId) && productId > 0)
      ),
    ];

    const productEntries = await Promise.all(
      productIds.map(async (productId) => {
        const product = await getProductData(productId);

        return [productId, product];
      })
    );

    const productMap = new Map(productEntries);

    return rows
      .map((row) => {
        const variant = unwrapRelation(row.variant);
        const productId = Number(variant?.product_id);
        const product = productMap.get(productId);

        if (!product || variant?.is_active === false) {
          return null;
        }

        return buildCartItemFromRemote(row, product);
      })
      .filter(Boolean);
  } catch (error) {
    throw new Error(getErrorMessage(error, '장바구니 정보를 불러오지 못했습니다.'), {
      cause: error,
    });
  }
}

export async function addRemoteCartItem(item) {
  try {
    const cartId = await getCartId({
      create: true,
    });

    const selection = await resolveCartSelection(item);
    const incomingQuantity = Math.max(1, Number(item?.quantity) || 1);
    const maxQuantity =
      Number.isFinite(selection.stock) && selection.stock > 0 ? selection.stock : incomingQuantity;

    const existingItem = await findRemoteCartItem(cartId, selection.variantId, selection.colorId);

    const nextQuantity = Math.min(
      maxQuantity,
      Math.max(1, Number(existingItem?.quantity ?? 0) + incomingQuantity)
    );

    if (existingItem?.id) {
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: nextQuantity,
        })
        .eq('id', existingItem.id)
        .eq('cart_id', cartId);

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await supabase.from('cart_items').insert({
      cart_id: cartId,
      variant_id: selection.variantId,
      color_id: selection.colorId,
      quantity: nextQuantity,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, '장바구니에 상품을 담지 못했습니다.'), {
      cause: error,
    });
  }
}

export async function setRemoteCartItemQuantity(item, quantity) {
  try {
    const cartId = await getCartId({
      create: true,
    });

    const selection = await resolveCartSelection(item);
    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    const nextQuantity =
      Number.isFinite(selection.stock) && selection.stock > 0
        ? Math.min(selection.stock, requestedQuantity)
        : requestedQuantity;

    const existingItem = await findRemoteCartItem(cartId, selection.variantId, selection.colorId);

    if (existingItem?.id) {
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: nextQuantity,
        })
        .eq('id', existingItem.id)
        .eq('cart_id', cartId);

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await supabase.from('cart_items').insert({
      cart_id: cartId,
      variant_id: selection.variantId,
      color_id: selection.colorId,
      quantity: nextQuantity,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, '장바구니 수량을 변경하지 못했습니다.'), {
      cause: error,
    });
  }
}

export async function removeRemoteCartItem(item) {
  try {
    const cartId = await getCartId({
      create: false,
    });

    if (!cartId) {
      return;
    }

    if (item?.cartItemId) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.cartItemId)
        .eq('cart_id', cartId);

      if (error) {
        throw error;
      }

      return;
    }

    const selection = await resolveCartSelection(item);

    let query = supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('variant_id', selection.variantId);

    query = applyColorFilter(query, selection.colorId);

    const { error } = await query;

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, '장바구니 상품을 삭제하지 못했습니다.'), {
      cause: error,
    });
  }
}

export async function removeRemoteCartItems(items) {
  const normalizedItems = Array.isArray(items) ? items : [];

  for (const item of normalizedItems) {
    await removeRemoteCartItem(item);
  }
}

export async function clearRemoteCart() {
  try {
    const cartId = await getCartId({
      create: false,
    });

    if (!cartId) {
      return;
    }

    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, '장바구니를 비우지 못했습니다.'), {
      cause: error,
    });
  }
}

export async function mergeGuestCartToRemote(items) {
  const guestItems = Array.isArray(items) ? items : [];

  for (const item of guestItems) {
    await addRemoteCartItem(item);
  }
}
