import { getProductImageUrl } from "@/api/supabaseUtils";
import { supabase } from "@/lib/supabase";

const PRODUCT_SELECT = `
  *,
  product_colors (*),
  product_variants (*),
  product_images (*)
`;

const APPAREL_SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];
const CATALOG_CACHE_TTL = 60 * 1000;

let catalogCache = null;
let catalogCacheTime = 0;
let catalogRequest = null;

function getLegacyImageType(image, index) {
  const displayOrder = Number(image?.display_order ?? index + 1);

  if (displayOrder === 1) return "thumbnail";
  if (displayOrder === 2) return "styled";
  if (displayOrder === 3) return "front";
  if (displayOrder === 4) return "side";
  if (displayOrder === 5) return "back";

  return image?.image_type ?? "detail";
}

function normalizeImages(images = []) {
  return [...images]
    .filter((image) => image?.is_active !== false)
    .sort(
      (a, b) =>
        Number(a?.display_order ?? 999) - Number(b?.display_order ?? 999),
    )
    .map((image, index) => {
      const imageUrl = getProductImageUrl(image.storage_path);
      const imageType = getLegacyImageType(image, index);

      return {
        id: image.id,
        type: imageType,
        imageType,
        image_type: imageType,
        imageUrl,
        image_url: imageUrl,
        url: imageUrl,
        path: image.storage_path,
        storagePath: image.storage_path,
        altText: image.alt_text ?? "",
        sortOrder: Number(image.display_order ?? index + 1),
        isPrimary: Boolean(image.is_primary),
      };
    });
}

function normalizeColors(colors = []) {
  return [...colors]
    .filter((color) => color?.is_active !== false)
    .sort(
      (a, b) =>
        Number(a?.display_order ?? 999) - Number(b?.display_order ?? 999),
    )
    .map((color) => {
      const filterGroup =
        color.filter_group ?? color.filter_color ?? color.color_name ?? "";
      const filterColor = color.filter_color ?? color.color_name ?? filterGroup;
      const colorName = color.color_name ?? filterColor;

      return {
        id: color.id,
        value: filterGroup,
        label: colorName,
        name: colorName,
        colorName,
        filterColor,
        filterGroup,
        hex: color.hex_code ?? null,
        hexCode: color.hex_code ?? null,
      };
    });
}

function getSizeSortValue(size) {
  const normalized = String(size ?? "").toUpperCase();
  const apparelIndex = APPAREL_SIZE_ORDER.indexOf(normalized);

  if (apparelIndex >= 0) {
    return apparelIndex;
  }

  const numericSize = Number(normalized);

  if (Number.isFinite(numericSize)) {
    return 100 + numericSize;
  }

  return 1000;
}

function normalizeSizes(variants = []) {
  return [...variants]
    .filter((variant) => variant?.is_active !== false)
    .sort((a, b) => getSizeSortValue(a?.size) - getSizeSortValue(b?.size))
    .map((variant) => ({
      id: variant.id,
      size: String(variant.size),
      stock: Number(variant.stock ?? 0),
      sku: variant.sku ?? null,
      isSoldOut: Number(variant.stock ?? 0) <= 0,
    }));
}

function normalizeProduct(row) {
  const images = normalizeImages(row.product_images);
  const colors = normalizeColors(row.product_colors);
  const sizes = normalizeSizes(row.product_variants);

  const primaryImage =
    images.find((image) => image.isPrimary) ??
    images.find((image) => image.type === "thumbnail") ??
    images[0];

  return {
    id: Number(row.id),
    productId: Number(row.id),
    productType: row.product_type ?? "product",
    categoryId: row.category_id,
    subCategoryId: row.sub_category_id,
    name: row.name,
    price: Number(row.price ?? 0),
    originalPrice:
      row.original_price === null || row.original_price === undefined
        ? null
        : Number(row.original_price),
    description: row.description ?? "",
    material: row.material ?? "",
    features: row.features ?? "",
    details: row.details ?? "",
    care: row.care ?? "",
    gender: row.gender ?? "women",
    lengthType: row.length_type ?? null,
    stock: Number(row.stock ?? 0),
    isSoldOut: Boolean(row.is_sold_out) || Number(row.stock ?? 0) <= 0,
    isActive: row.is_active !== false,
    isPopular: Boolean(row.is_popular),
    isNew: Boolean(row.is_new),

    colors,
    sizes,
    images,

    imageUrl: primaryImage?.imageUrl ?? "",
    thumbnail: primaryImage?.imageUrl ?? "",
    thumbnailUrl: primaryImage?.imageUrl ?? "",
    imageUrls: images.map((image) => image.imageUrl),

    componentProductIds: [],
  };
}

async function loadCatalog({ force = false } = {}) {
  const now = Date.now();

  if (!force && catalogCache && now - catalogCacheTime < CATALOG_CACHE_TTL) {
    return catalogCache;
  }

  if (!force && catalogRequest) {
    return catalogRequest;
  }

  catalogRequest = (async () => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    const products = (data ?? []).map(normalizeProduct);

    catalogCache = products;
    catalogCacheTime = Date.now();

    return products;
  })();

  try {
    return await catalogRequest;
  } finally {
    catalogRequest = null;
  }
}

function parseMultiValue(value) {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSearchValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function matchesProduct(product, params = {}) {
  if (
    params.gender &&
    !params.categoryId &&
    product.categoryId === "accessories"
  ) {
    return false;
  }

  if (params.gender && product.gender !== params.gender) {
    return false;
  }

  if (params.categoryId && product.categoryId !== params.categoryId) {
    return false;
  }

  if (params.subCategoryId && product.subCategoryId !== params.subCategoryId) {
    return false;
  }

  const selectedColors = parseMultiValue(params.color);

  if (
    selectedColors.length > 0 &&
    !selectedColors.some((selectedColor) =>
      product.colors.some((color) => {
        const candidates = [
          color.filterGroup,
          color.filterColor,
          color.value,
          color.label,
        ]
          .filter(Boolean)
          .map((value) => normalizeSearchValue(value));

        return candidates.includes(normalizeSearchValue(selectedColor));
      }),
    )
  ) {
    return false;
  }

  const selectedSizes = parseMultiValue(params.size);

  if (
    selectedSizes.length > 0 &&
    !selectedSizes.some((selectedSize) =>
      product.sizes.some(
        (size) =>
          normalizeSearchValue(size.size) ===
            normalizeSearchValue(selectedSize) && Number(size.stock ?? 0) > 0,
      ),
    )
  ) {
    return false;
  }

  if (params.lengthType && product.lengthType !== params.lengthType) {
    return false;
  }

  const minPrice = Number(params.minPrice);

  if (
    params.minPrice !== undefined &&
    Number.isFinite(minPrice) &&
    product.price < minPrice
  ) {
    return false;
  }

  const maxPrice = Number(params.maxPrice);

  if (
    params.maxPrice !== undefined &&
    Number.isFinite(maxPrice) &&
    product.price > maxPrice
  ) {
    return false;
  }

  const query = normalizeSearchValue(params.q);

  if (query) {
    const searchableText = [
      product.name,
      product.description,
      product.features,
      product.details,
      product.material,
      product.categoryId,
      product.subCategoryId,
      ...product.colors.flatMap((color) => [
        color.label,
        color.filterColor,
        color.filterGroup,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!searchableText.includes(query)) {
      return false;
    }
  }

  return true;
}

function sortProducts(products, sort = "recommended") {
  const nextProducts = [...products];

  switch (sort) {
    case "priceAsc":
      return nextProducts.sort(
        (a, b) => a.price - b.price || a.productId - b.productId,
      );

    case "priceDesc":
      return nextProducts.sort(
        (a, b) => b.price - a.price || a.productId - b.productId,
      );

    case "new":
      return nextProducts.sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew) || b.productId - a.productId,
      );

    case "popular":
      return nextProducts.sort(
        (a, b) =>
          Number(b.isPopular) - Number(a.isPopular) ||
          a.productId - b.productId,
      );

    default:
      return nextProducts.sort(
        (a, b) =>
          Number(b.isPopular) - Number(a.isPopular) ||
          Number(b.isNew) - Number(a.isNew) ||
          a.productId - b.productId,
      );
  }
}

function paginateProducts(products, params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 20);
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  const pagedProducts = products.slice(startIndex, startIndex + limit);

  return {
    products: pagedProducts,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

function buildFilterOptions(products) {
  const colorMap = new Map();
  const sizeSet = new Set();
  const lengthTypeSet = new Set();

  products.forEach((product) => {
    product.colors.forEach((color) => {
      const key = color.filterGroup || color.value || color.label;

      if (key && !colorMap.has(key)) {
        colorMap.set(key, color);
      }
    });

    product.sizes.forEach((size) => {
      if (size.size) {
        sizeSet.add(String(size.size));
      }
    });

    if (product.lengthType) {
      lengthTypeSet.add(product.lengthType);
    }
  });

  return {
    colors: [...colorMap.values()],

    sizes: [...sizeSet].sort(
      (a, b) => getSizeSortValue(a) - getSizeSortValue(b),
    ),

    lengthTypes: [...lengthTypeSet],
  };
}

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return {
    data: {
      categories: (data ?? []).map((category) => ({
        id: category.id,
        categoryId: category.id,
        name: category.name,
        parentId: category.parent_id,
        displayOrder: category.display_order,
      })),
    },
  };
};

export const getProducts = async (params = {}) => {
  const catalog = await loadCatalog();

  const filteredProducts = catalog.filter((product) =>
    matchesProduct(product, params),
  );

  const sortedProducts = sortProducts(filteredProducts, params.sort);

  const result = paginateProducts(sortedProducts, params);

  return {
    data: result,
  };
};

export const getProductFilters = async (params = {}) => {
  const catalog = await loadCatalog();

  const filterParams = {
    gender: params.gender,
    categoryId: params.categoryId,
    subCategoryId: params.subCategoryId,
  };

  const filteredProducts = catalog.filter((product) =>
    matchesProduct(product, filterParams),
  );

  return {
    data: buildFilterOptions(filteredProducts),
  };
};

export const getProduct = async (productId) => {
  const catalog = await loadCatalog();

  const product = catalog.find(
    (item) => Number(item.productId) === Number(productId),
  );

  if (!product) {
    throw new Error("상품 정보를 찾을 수 없습니다.");
  }

  return {
    data: product,
  };
};

export const searchProducts = async (params = {}) => {
  return getProducts(params);
};

export const getSets = async (params = {}) => {
  const catalog = await loadCatalog();

  const filteredSets = catalog.filter(
    (product) =>
      (product.productType === "set" || product.categoryId === "sets") &&
      matchesProduct(product, {
        ...params,
        categoryId: "sets",
      }),
  );

  const sortedSets = sortProducts(filteredSets, params.sort);

  const result = paginateProducts(sortedSets, params);

  return {
    data: {
      sets: result.products,
      pagination: result.pagination,
    },
  };
};

export const getSet = async (productId) => {
  const response = await getProduct(productId);
  const product = response.data;

  if (product.productType !== "set" && product.categoryId !== "sets") {
    throw new Error("세트 상품 정보를 찾을 수 없습니다.");
  }

  return response;
};

export const clearProductCache = () => {
  catalogCache = null;
  catalogCacheTime = 0;
  catalogRequest = null;
};
