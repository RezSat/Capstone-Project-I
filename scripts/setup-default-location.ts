import { db } from "../src/core/db/client";
import { stockLocations } from "../src/core/db/schema";

async function setupDefaultStockLocation() {
  // Check if default location exists
  const existing = await db.query.stockLocations.findFirst({
    where: (locations, { eq }) => eq(locations.isDefault, true)
  });
  
  if (existing) {
    console.log("Default stock location already exists:", existing.name);
    return;
  }

  // Create default stock location
  const [location] = await db.insert(stockLocations).values({
    name: "Main Warehouse",
    code: "main-warehouse",
    address: "Default warehouse location",
    isDefault: true,
    isActive: true,
  }).returning();

  console.log("✅ Created default stock location:", location.name);
}

setupDefaultStockLocation().catch(console.error).finally(() => process.exit(0));