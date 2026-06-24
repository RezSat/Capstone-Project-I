import { getPublicCategoryByGroupSlug, type PublicCategoryFilters } from "./public-category.repo";
import { getPublicCategoryProducts, type FilteredProductsResult } from "./public-category.repo";

export interface CategoryPageFilterOption {
  label: string;
  value: string;
}

export interface CategoryPageFilter {
  label: string;
  slug: string;
  sourceKey: string | null;
  options: CategoryPageFilterOption[];
}

export interface StorefrontCategoryPage {
  id: string;
  groupSlug: string;
  slug: string;
  title: string;
  heroImage: string;
  fallbackHeroImage: string;
  description: string;
  filters: CategoryPageFilter[];
}

export interface StorefrontCategoryProduct {
  id: string
  name: string
  slug: string
  categoryName?: string
  priceFormatted: string
  href: string
  images?: { publicUrl: string; isPrimary: boolean }[]
  variants?: {
    id: string
    optionSignature: string
    metadata?: Record<string, unknown>
    options: { name: string; value: string; hex: string | null }[]
  }[]
}

export interface StorefrontCategoryData {
  category: StorefrontCategoryPage;
  products: StorefrontCategoryProduct[];
}

function formatPrice(minor: number): string {
  const price = minor / 100;
  return `LKR ${price.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function transformFilters(filters: PublicCategoryFilters[]): CategoryPageFilter[] {
  return filters.map((f) => ({
    label: f.label,
    slug: f.slug,
    sourceKey: f.sourceKey ?? null,
    options: f.options.map((o) => ({ label: o.label, value: o.value })),
  }));
}

export async function getStorefrontCategoryBySlug(
  groupSlug: string,
  slug: string,
  selectedFilters?: Record<string, string[]>,
): Promise<StorefrontCategoryData | null> {
  const category = await getPublicCategoryByGroupSlug(groupSlug, slug);

  if (!category) {
    return null;
  }

  const filterLabels = new Map<string, string>();
  for (const f of category.filters) {
    filterLabels.set(f.slug, f.label);
  }

  const productsResult: FilteredProductsResult = await getPublicCategoryProducts(
    category.id,
    1,
    50,
    selectedFilters,
    filterLabels,
  );

  const storefrontProducts: StorefrontCategoryProduct[] = productsResult.items.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.categoryName ?? undefined,
    priceFormatted: formatPrice(p.basePriceMinor),
    href: `/products/${p.slug}`,
    images: p.images,
    variants: p.variants,
  }));

  const storefrontCategory: StorefrontCategoryPage = {
    id: category.id,
    groupSlug: category.groupSlug,
    slug: category.slug,
    title: category.title,
    heroImage: category.heroImageUrl ?? "/images/productpage/sample_header.png",
    fallbackHeroImage: category.fallbackHeroImageUrl ?? "/images/storefront-generic/marketplace-hero.png",
    description: category.description ?? "",
    filters: transformFilters(category.filters),
  };

  return {
    category: storefrontCategory,
    products: storefrontProducts,
  };
}