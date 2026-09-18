import apiClient from './client';

export const getHomeData = async () => {
  const response = await apiClient.get('/main');

  return response.data;
};

export const getBanners = async () => {
  const response = await apiClient.get('/main');

  return {
    ...response.data,
    data: response.data?.data?.banners ?? [],
  };
};

export const getBestSellers = async () => {
  const response = await apiClient.get('/products', {
    params: {
      sort: 'popular',
      page: 1,
      limit: 6,
    },
  });

  return {
    ...response.data,
    data: response.data?.data?.products ?? [],
  };
};

const NEW_PRODUCT_CATEGORIES = {
  tops: {
    categoryId: 'top',
  },
  bottoms: {
    categoryId: 'bottom',
  },
  sunglasses: {
    categoryId: 'accessories',
    subCategoryId: 'sunglasses',
  },
  hats: {
    categoryId: 'accessories',
    subCategoryId: 'hat',
  },
};

const normalizeNewProduct = (product) => ({
  ...product,
  id: product.id ?? product.productId,
  productId: product.productId ?? product.id,
  imageUrl:
    product.mainImageUrl ||
    product.imageUrl ||
    product.images?.front ||
    product.images?.styled ||
    '',
});

const getNewProductsByCategory = async ({ categoryId, subCategoryId }) => {
  const response = await apiClient.get('/products', {
    params: {
      gender: 'women',
      categoryId,
      ...(subCategoryId ? { subCategoryId } : {}),
      sort: 'new',
      page: 1,
      limit: 6,
    },
  });

  return (response.data?.data?.products ?? []).map(normalizeNewProduct);
};

export const getNewProducts = async () => {
  const entries = await Promise.all(
    Object.entries(NEW_PRODUCT_CATEGORIES).map(async ([key, params]) => [
      key,
      await getNewProductsByCategory(params),
    ])
  );

  return {
    success: true,
    data: Object.fromEntries(entries),
  };
};
