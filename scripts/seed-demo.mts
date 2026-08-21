import { statSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "../src/core/db/client";
import { customerProfiles, users } from "../src/core/db/schema/auth";
import { files } from "../src/core/db/schema/files";
import { categories } from "../src/core/db/schema/catalog";
import { productMedia, products, productVariants } from "../src/core/db/schema/products";
import { inventoryItems, stockLocations } from "../src/core/db/schema/inventory";
import { hashPassword } from "../src/core/auth/password";

const customer = { email: "customer@demo-sports-store.test", password: "LocalCustomer-ChangeBeforeDemo-2026!" };
const catalog = [
  { group: "badminton", slug: "racquets", name: "Badminton Racquets", product: "Aero 88 Training Racquet", sku: "DEMO-BAD-001", price: 18500, stock: 12 },
  { group: "badminton", slug: "strings", name: "Badminton Strings", product: "Control 66 Badminton String", sku: "DEMO-BAD-002", price: 3200, stock: 24 },
  { group: "badminton", slug: "shuttlecocks", name: "Badminton Shuttlecocks", product: "Tournament Shuttlecock Tube", sku: "DEMO-BAD-003", price: 4800, stock: 20 },
  { group: "volleyball", slug: "balls", name: "Volleyballs", product: "Match Training Volleyball", sku: "DEMO-VOL-001", price: 9200, stock: 18 },
  { group: "cricket", slug: "bats", name: "Cricket Bats", product: "English Willow Cricket Bat", sku: "DEMO-CRI-001", price: 24500, stock: 8 },
  { group: "cricket", slug: "balls", name: "Cricket Balls", product: "Leather Training Cricket Ball", sku: "DEMO-CRI-002", price: 3600, stock: 28 },
  { group: "cricket", slug: "gloves", name: "Cricket Batting Gloves", product: "Club Batting Gloves", sku: "DEMO-CRI-003", price: 6800, stock: 14 },
  { group: "fitness", slug: "dumbbells", name: "Fitness Dumbbells", product: "Adjustable Dumbbell Set", sku: "DEMO-FIT-001", price: 16800, stock: 10 },
  { group: "fitness", slug: "resistance-bands", name: "Resistance Bands", product: "Five-Level Resistance Band Set", sku: "DEMO-FIT-002", price: 4200, stock: 22 },
  { group: "running", slug: "shoes", name: "Running Shoes", product: "Everyday Cushion Running Shoes", sku: "DEMO-RUN-001", price: 14900, stock: 16 },
  { group: "running", slug: "socks", name: "Running Socks", product: "Breathable Sports Socks", sku: "DEMO-RUN-002", price: 1800, stock: 35 },
  { group: "accessories", slug: "water-bottles", name: "Sports Water Bottles", product: "Insulated Sports Water Bottle", sku: "DEMO-ACC-002", price: 3900, stock: 25 },
  { group: "accessories", slug: "sports-bags", name: "Sports Bags", product: "Multi-Purpose Sports Bag", sku: "DEMO-ACC-003", price: 7900, stock: 15 },
  { group: "accessories", slug: "wrist-bands", name: "Sports Wrist Bands", product: "Performance Wrist Bands", sku: "DEMO-ACC-001", price: 2400, stock: 30 },
];

async function main() {
  let stockLocation = await db.query.stockLocations.findFirst({ where: eq(stockLocations.code, "DEMO-STORE-01") });
  stockLocation ??= await db.query.stockLocations.findFirst({ where: eq(stockLocations.isDefault, true) });
  if (!stockLocation) {
    [stockLocation] = await db.insert(stockLocations).values({ name: "Demo Sports Store", code: "DEMO-STORE-01", type: "store", isDefault: true }).returning();
  }
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
    const [category] = await db.insert(categories).values({ name: entry.name, slug: entry.slug, fullSlug: `${entry.group}/${entry.slug}`, groupSlug: entry.group, description: `Demo ${entry.name.toLowerCase()} for the academic catalog.`, status: "active" }).onConflictDoNothing().returning();
    const resolvedCategory = category ?? await db.query.categories.findFirst({ where: eq(categories.fullSlug, `${entry.group}/${entry.slug}`) });
    if (!resolvedCategory) throw new Error(`Could not resolve ${entry.name}`);
    const productSlug = entry.product.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const imageName = `${productSlug}.png`;
    const imageUrl = `/images/demo-products/${imageName}`;
    const imageSizeBytes = statSync(resolve(process.cwd(), "public", imageUrl.slice(1))).size;
    const [product] = await db.insert(products).values({ primaryCategoryId: resolvedCategory.id, name: entry.product, slug: productSlug, group: entry.group, category: entry.name, categorySlug: entry.slug, shortDescription: `Reliable ${entry.name.toLowerCase()} for regular training.`, description: `An original Demo Sports Store product for local preview and catalog testing.`, basePriceMinor: entry.price * 100, compareAtPriceMinor: Math.round(entry.price * 1.15) * 100, status: "active", isFeatured: true, promoLabel: "new_arrival", publishedAt: new Date(), metadata: { seeded: true } }).onConflictDoNothing().returning();
    const resolvedProduct = product ?? await db.query.products.findFirst({ where: eq(products.slug, productSlug) });
    if (!resolvedProduct) throw new Error(`Could not resolve ${entry.product}`);
    const [variant] = await db.insert(productVariants).values({ productId: resolvedProduct.id, sku: entry.sku, title: "Standard", optionSignature: "Standard", priceMinor: entry.price * 100, status: "active", isDefault: true, metadata: { seeded: true } }).onConflictDoNothing().returning();
    const resolvedVariant = variant ?? await db.query.productVariants.findFirst({ where: eq(productVariants.sku, entry.sku) });
    if (!resolvedVariant) throw new Error(`Could not resolve variant for ${entry.product}`);
    await db.insert(inventoryItems).values({ variantId: resolvedVariant.id, locationId: stockLocation.id, quantityOnHand: entry.stock, lowStockThreshold: 3, reorderPoint: 5, reorderQuantity: 10 }).onConflictDoNothing();
    const storageKey = `demo/products/${imageName}`;
    const [file] = await db.insert(files).values({ kind: "image", access: "public", originalName: imageName, mimeType: "image/png", sizeBytes: imageSizeBytes, width: 1254, height: 1254, orientation: "square", bucket: "local-public", storageKey, publicUrl: imageUrl, altText: entry.product, metadata: { seeded: true, generated: true } }).onConflictDoNothing().returning();
    const resolvedFile = file ?? await db.query.files.findFirst({ where: eq(files.storageKey, storageKey) });
    if (resolvedFile) {
      const existingPrimary = await db.query.productMedia.findFirst({ where: and(eq(productMedia.productId, resolvedProduct.id), eq(productMedia.isPrimary, true)) });
      if (existingPrimary) {
        await db.update(productMedia).set({ fileId: resolvedFile.id, altText: entry.product }).where(eq(productMedia.id, existingPrimary.id));
      } else {
        await db.insert(productMedia).values({ productId: resolvedProduct.id, fileId: resolvedFile.id, role: "gallery", altText: entry.product, isPrimary: true });
      }
    }
  }
  console.info(`Demo data ready. Customer: ${customer.email}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
