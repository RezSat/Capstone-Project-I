import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { shippingSettingsTable } from "@/core/db/schema";

export async function GET() {
  try {
    let settings = await db.query.shippingSettingsTable.findFirst();

    if (!settings) {
      const [newSettings] = await db.insert(shippingSettingsTable).values({}).returning();
      settings = newSettings;
    }

    return Response.json({
      success: true,
      data: {
        freeShippingThresholdMinor: settings.freeShippingThresholdMinor,
        baseShippingFeeMinor: settings.baseShippingFeeMinor,
      },
    });
  } catch (error) {
    console.error("Shipping settings fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { freeShippingThresholdMinor, baseShippingFeeMinor } = body;

    const existing = await db.query.shippingSettingsTable.findFirst();

    if (existing) {
      await db
        .update(shippingSettingsTable)
        .set({
          freeShippingThresholdMinor: freeShippingThresholdMinor ?? existing.freeShippingThresholdMinor,
          baseShippingFeeMinor: baseShippingFeeMinor ?? existing.baseShippingFeeMinor,
          updatedAt: new Date(),
        })
        .where(eq(shippingSettingsTable.id, existing.id));
    } else {
      await db.insert(shippingSettingsTable).values({
        freeShippingThresholdMinor: freeShippingThresholdMinor ?? 650000,
        baseShippingFeeMinor: baseShippingFeeMinor ?? 35000,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Shipping settings save error:", error);
    return Response.json(
      { success: false, error: "Failed to save configurations" },
      { status: 500 }
    );
  }
}