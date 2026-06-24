import { eq, or, like, sql } from "drizzle-orm";
import { db } from "@/core/db/client";
import { products, productMedia, files } from "@/core/db/schema";
import { ok, fail } from "@/core/http/responses";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query || query.trim() === "") {
      return Response.json(ok([]));
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const searchResults = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.basePriceMinor,
        slug: products.slug,
        categoryDescription: products.category,
      })
      .from(products)
      .where(
        or(
          like(sql`lower(${products.name})`, searchTerm),
          like(sql`lower(${products.category})`, searchTerm),
          like(sql`lower(${products.description})`, searchTerm),
          like(sql`lower(${products.searchKeywords})`, searchTerm)
        )
      )
      .limit(5);

    const resultsWithImages = await Promise.all(
      searchResults.map(async (product) => {
        const primaryMedia = await db
          .select({
            publicUrl: files.publicUrl,
          })
          .from(productMedia)
          .innerJoin(files, eq(productMedia.fileId, files.id))
          .where(eq(productMedia.productId, product.id))
          .limit(1);

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          currentImage: primaryMedia[0]?.publicUrl ?? null,
          slug: product.slug,
          categoryDescription: product.categoryDescription,
        };
      })
    );

    return Response.json(ok(resultsWithImages));
  } catch (error) {
    console.error("Search API error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Search failed"), { status: 500 });
  }
}