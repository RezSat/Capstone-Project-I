import { eq } from "drizzle-orm";
import { db } from "../src/core/db/client";
import { customerProfiles, users } from "../src/core/db/schema/auth";
import { files } from "../src/core/db/schema/files";
import { categories } from "../src/core/db/schema/catalog";
import { productMedia, products, productVariants } from "../src/core/db/schema/products";
import { inventoryItems, stockLocations } from "../src/core/db/schema/inventory";
import { hashPassword } from "../src/core/auth/password";

const customer = { email: "customer@trinitysports.test", password: "LocalCustomer-ChangeBeforeDemo-2026!" };
const imageUrl = "/images/products/trinity-sports-placeholder.svg";

const catalog = [
  { group: "badminton", slug: "racquets", name: "Badminton Racquets", product: "Trinity Aero 88 Racquet", price: 18500, stock: 12 },
  { group: "volleyball", slug: "balls", name: "Volleyballs", product: "Trinity Match Volleyball", price: 9200, stock: 18 },
  { group: "accessories", slug: "wrist-bands", name: "Sports Accessories", product: "Trinity Performance Wrist Bands", price: 2400, stock: 30 },
];

async function main() {
  const [location] = await db.insert(stockLocations).values({ name: "Trinity Colombo Store", code: "COLOMBO-01", type: "store", isDefault: true }).onConflictDoNothing().returning();
  const stockLocation = location ?? await db.query.stockLocations.findFirst({ where: eq(stockLocations.code, "COLOMBO-01") });
  if (!stockLocation) throw new Error("Could not resolve demo stock location");

  let appUser = await db.query.users.findFirst({ where: eq(users.normalizedEmail, customer.email) });
  if (!appUser) {
    [appUser] = await db.insert(users).values({
      email: customer.email, normalizedEmail: customer.email, passwordHash: hashPassword(customer.password),
      accountType: "customer", status: "active", accountStatus: "active", metadata: { seeded: true },
    }).returning();
  }
  const profile = await db.query.customerProfiles.findFirst({ where: eq(customerProfiles.userId, appUser.id) });
  if (!profile) await db.insert(customerProfiles).values({ userId: appUser.id, customerNumber: "CUST-DEMO-001", firstName: "Demo", lastName: "Customer", displayName: "Demo Customer", metadata: { seeded: true } });

  for (const entry of catalog) {
    const [category] = await db.insert(categories).values({ name: entry.name, slug: entry.slug, fullSlug: `${entry.group}/${entry.slug}`, groupSlug: entry.group, description: `Demo ${entry.name.toLowerCase()} for Trinity Sports.`, status: "active" }).onConflictDoNothing().returning();
    const resolvedCategory = category ?? await db.query.categories.findFirst({ where: eq(categories.fullSlug, `${entry.group}/${entry.slug}`) });
    if (!resolvedCategory) throw new Error(`Could not resolve ${entry.name}`);
    const productSlug = entry.product.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [product] = await db.insert(products).values({ primaryCategoryId: resolvedCategory.id, name: entry.product, slug: productSlug, group: entry.group, category: entry.name, categorySlug: entry.slug, shortDescription: `Reliable ${entry.name.toLowerCase()} for regular training.`, description: `An original Trinity Sports demo product for local preview and catalog testing.`, basePriceMinor: entry.price * 100, compareAtPriceMinor: Math.round(entry.price * 1.15) * 100, status: "active", isFeatured: true, promoLabel: "new_arrival", publishedAt: new Date(), metadata: { seeded: true } }).onConflictDoNothing().returning();
    const resolvedProduct = product ?? await db.query.products.findFirst({ where: eq(products.slug, productSlug) });
    if (!resolvedProduct) throw new Error(`Could not resolve ${entry.product}`);
    const [variant] = await db.insert(productVariants).values({ productId: resolvedProduct.id, sku: `TRI-${entry.group.slice(0, 3).toUpperCase()}-001`, title: "Standard", optionSignature: "Standard", priceMinor: entry.price * 100, status: "active", isDefault: true, metadata: { seeded: true } }).onConflictDoNothing().returning();
    const resolvedVariant = variant ?? await db.query.productVariants.findFirst({ where: eq(productVariants.sku, `TRI-${entry.group.slice(0, 3).toUpperCase()}-001`) });
    if (!resolvedVariant) throw new Error(`Could not resolve variant for ${entry.product}`);
    await db.insert(inventoryItems).values({ variantId: resolvedVariant.id, locationId: stockLocation.id, quantityOnHand: entry.stock, lowStockThreshold: 3, reorderPoint: 5, reorderQuantity: 10 }).onConflictDoNothing();
    const [file] = await db.insert(files).values({ kind: "image", access: "public", originalName: "trinity-sports-placeholder.svg", mimeType: "image/svg+xml", sizeBytes: 950, width: 800, height: 600, orientation: "landscape", bucket: "local-public", storageKey: `demo/${productSlug}.svg`, publicUrl: imageUrl, altText: `${entry.product} placeholder`, metadata: { seeded: true } }).onConflictDoNothing().returning();
    const resolvedFile = file ?? await db.query.files.findFirst({ where: eq(files.storageKey, `demo/${productSlug}.svg`) });
    if (resolvedFile) await db.insert(productMedia).values({ productId: resolvedProduct.id, fileId: resolvedFile.id, role: "gallery", altText: `${entry.product} placeholder`, isPrimary: true }).onConflictDoNothing();
  }
  console.info(`Demo data ready. Customer: ${customer.email}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
