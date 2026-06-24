import { db } from "../src/core/db/client";
import { categories, brands, products } from "../src/core/db/schema";
import { eq } from "drizzle-orm";

async function createProduct() {
  console.log("Fetching categories and brands...");

  // Get existing category
  const existingCategories = await db.select().from(categories).limit(1);
  const category = existingCategories[0];
  
  if (!category) {
    console.log("No categories found. Creating one...");
    const [newCategory] = await db.insert(categories).values({
      name: "Badminton Racquet",
      slug: "racquets",
      groupSlug: "badminton",
      fullSlug: "badminton/racquets",
      status: "active",
    }).returning();
    console.log("Created category:", newCategory.name);
    return createProductWithCategory(newCategory.id);
  }

  console.log("Found category:", category.name, "group:", category.groupSlug);

  // Get existing brand or create one
  const existingBrands = await db.select().from(brands).limit(1);
  let brand = existingBrands[0];

  if (!brand) {
    console.log("No brands found. Creating one...");
    const [newBrand] = await db.insert(brands).values({
      name: "YONEX",
      slug: "yonex",
      isActive: true,
    }).returning();
    brand = newBrand;
    console.log("Created brand:", brand.name);
  }

  console.log("Found brand:", brand.name);

  // Check if product already exists
  const existingProducts = await db.select().from(products).where(eq(products.slug, "yonex-astrox-88d-pro")).limit(1);
  if (existingProducts[0]) {
    console.log("Product already exists:", existingProducts[0].id);
    return;
  }

  // Create product
  console.log("Creating product: YONEX ASTROX 88D PRO...");
  
  const [product] = await db.insert(products).values({
    name: "YONEX ASTROX 88D PRO",
    slug: "yonex-astrox-88d-pro",
    primaryCategoryId: category.id,
    brandId: brand.id,
    shortDescription: "Maximize explosive power and offensive play with the ASTROX 88D PRO",
    description: "Maximize explosive power and offensive play with the ASTROX 88D PRO. Designed for a double specialist to dominate from the backcourt, it uses the Rotational Generator System to distribute weight for smooth transitions and maximum control. Enhanced with Namd™ graphite, this racquet delivers faster snapback for imposing power on every shot.",
    basePriceMinor: 4500000,
    compareAtPriceMinor: 4800000,
    currencyCode: "LKR",
    status: "active",
    isFeatured: true,
    seoTitle: "YONEX ASTROX 88D PRO - Badminton Racquet",
    seoDescription: "Premium badminton racquet for aggressive attacking play",
    group: "badminton",
    category: "Badminton Racquet",
    categorySlug: "racquets",
  }).returning();

  console.log("Created product:", product.id, product.name);
  console.log("✅ Product created successfully!");
}

async function createProductWithCategory(categoryId: string) {
  const existingBrands = await db.select().from(brands).limit(1);
  let brand = existingBrands[0];

  if (!brand) {
    const [newBrand] = await db.insert(brands).values({
      name: "YONEX",
      slug: "yonex",
      isActive: true,
    }).returning();
    brand = newBrand;
  }

  const [product] = await db.insert(products).values({
    name: "YONEX ASTROX 88D PRO",
    slug: "yonex-astrox-88d-pro",
    primaryCategoryId: categoryId,
    brandId: brand.id,
    shortDescription: "Maximize explosive power and offensive play",
    description: "Full description here",
    basePriceMinor: 4500000,
    compareAtPriceMinor: 4800000,
    currencyCode: "LKR",
    status: "active",
    isFeatured: true,
    group: "badminton",
    category: "Badminton Racquet",
    categorySlug: "racquets",
  }).returning();

  console.log("✅ Product created:", product.id, product.name);
}

createProduct().catch(console.error);