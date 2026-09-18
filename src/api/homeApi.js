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
      limit: 20,
    },
  });

  const products = response.data?.data?.products ?? [];

  return {
    ...response.data,
    data: products.filter((product) => product.isPopular === true).slice(0, 6),
  };
};

const NEW_TRENDING_LIMIT = 30;
const CATEGORY_PRODUCT_LIMIT = 6;

const NEW_TRENDING_CATEGORIES = {
  outer: {
    categoryId: 'outer',
  },
  tops: {
    categoryId: 'top',
  },
  bottoms: {
    categoryId: 'bottom',
  },
  shoes: {
    categoryId: 'shoes',
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

const EMPTY_NEW_TRENDING = {
  outer: [],
  tops: [],
  bottoms: [],
  shoes: [],
  sunglasses: [],
  hats: [],
};

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
};

const isNewOrPopular = (product) => product?.isNew === true || product?.isPopular === true;

const hasMainImage = (product) => {
  const mainImageUrl = normalizeImageUrl(product?.mainImageUrl);

  return Boolean(mainImageUrl);
};

const normalizeNewTrendingProduct = (product) => ({
  ...product,
  id: product.id ?? product.productId,
  productId: product.productId ?? product.id,
  imageUrl: normalizeImageUrl(product.mainImageUrl),
});

const getCategoryProducts = async ({ categoryId, subCategoryId, sort }) => {
  const response = await apiClient.get('/products', {
    params: {
      gender: 'women',
      categoryId,
      ...(subCategoryId ? { subCategoryId } : {}),
      sort,
      page: 1,
      limit: NEW_TRENDING_LIMIT,
    },
  });

  return response.data?.data?.products ?? [];
};

const mergeUniqueProducts = (...productLists) => {
  const productsById = new Map();

  productLists.flat().forEach((product) => {
    const productId = product.productId ?? product.id;

    if (productId === undefined || productId === null) {
      return;
    }

    const key = String(productId);

    if (productsById.has(key)) {
      return;
    }

    productsById.set(key, product);
  });

  return Array.from(productsById.values());
};

const getNewTrendingProductsByCategory = async (categoryParams) => {
  const [newProducts, popularProducts] = await Promise.all([
    getCategoryProducts({
      ...categoryParams,
      sort: 'new',
    }),
    getCategoryProducts({
      ...categoryParams,
      sort: 'popular',
    }),
  ]);

  return mergeUniqueProducts(newProducts, popularProducts)
    .filter(isNewOrPopular)
    .filter(hasMainImage)
    .map(normalizeNewTrendingProduct)
    .slice(0, CATEGORY_PRODUCT_LIMIT);
};

export const getNewProducts = async () => {
  const categoryEntries = await Promise.all(
    Object.entries(NEW_TRENDING_CATEGORIES).map(async ([categoryKey, categoryParams]) => {
      const products = await getNewTrendingProductsByCategory(categoryParams);

      return [categoryKey, products];
    })
  );

  return {
    success: true,
    data: {
      ...EMPTY_NEW_TRENDING,
      ...Object.fromEntries(categoryEntries),
    },
  };
};
