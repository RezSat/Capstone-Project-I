import { fail, ok } from "../../../../core/http/responses";
import { findProductsByIds } from "../../../../modules/products/product.repo";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
      return Response.json(fail("INVALID_INPUT", "Missing ids parameter"), { status: 400 });
    }

    const productIds = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (productIds.length === 0) {
      return Response.json(ok([]));
    }

    if (productIds.length > 50) {
      return Response.json(fail("INVALID_INPUT", "Maximum 50 product IDs allowed"), { status: 400 });
    }

    const products = await findProductsByIds(productIds);

    return Response.json(ok(products));
  } catch (error) {
    console.error("Guest wishlist fetch error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
  }
}
