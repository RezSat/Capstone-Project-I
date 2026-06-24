import { z } from "zod";
import { getCurrentUser } from "@/core/auth/auth-helper";
import { addWishlistItem, getWishlistItems, removeWishlistItem } from "@/modules/wishlists/wishlist.repo";

const addSchema = z.object({
  productId: z.string().uuid(),
});

const deleteSchema = z.object({
  productId: z.string().uuid(),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getWishlistItems(user.id);
  return Response.json(items);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = addSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const item = await addWishlistItem(user.id, parsed.data.productId);
    return Response.json({ success: true, item }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    const parsed = deleteSchema.safeParse({ productId });

    if (!parsed.success || !parsed.data.productId) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const deleted = await removeWishlistItem(user.id, parsed.data.productId);
    return Response.json({ success: true, deleted });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}