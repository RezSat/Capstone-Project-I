import { ok, fail } from "@/core/http/responses";
import { db } from "@/core/db/client";

export async function GET() {
  try {
    const settings = await db.query.shippingSettingsTable.findFirst();

    return Response.json(ok({
      freeShippingThresholdMinor: settings?.freeShippingThresholdMinor ?? 650000,
      baseShippingFeeMinor: settings?.baseShippingFeeMinor ?? 35000,
    }));
  } catch (error) {
    console.error("Storefront settings fetch error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Failed to fetch storefront settings"), { status: 500 });
  }
}