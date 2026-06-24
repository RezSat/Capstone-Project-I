import Link from "next/link";
import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { getProductDetailData } from "../product-detail-data";
import { AdjustStockButton } from "@/components/inventory/adjust-stock-button";
import { ArchiveProductButton } from "@/components/products/archive-product-button";

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ productId: string }> };

const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export default async function DashboardProductDetailsPage({ params }: Props) {
  await requireAnyPermission("PRODUCTS_VIEW", "PRODUCTS_MANAGE");
  const { productId } = await params;
  const data = await getProductDetailData(productId);

  if (data.status === "error" || !data.product.id) {
    return (
      <main className="rounded-md border border-destructive bg-card p-6">
        <h1 className="text-2xl font-semibold text-destructive">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">The product could not be loaded.</p>
        <Link className="mt-4 inline-block text-sm text-primary hover:underline" href="/dashboard/products">
          Back to products
        </Link>
      </main>
    );
  }

  const { product, images, variants, attributes, contentSections, promotions, recommendations, recentAudit } = data;

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {product.name}
            {product.isFeatured && <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-normal text-yellow-800">Featured</span>}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: {statusLabels[product.status] || product.status}
            {product.categoryName && <> &bull; {product.categoryName}</>}
            {product.brandName && <> &bull; {product.brandName}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
            href={`/products/${product.slug}`}
            target="_blank"
          >
            Preview
          </Link>
          <ArchiveProductButton productId={productId} productName={product.name} currentStatus={product.status} />
          <Link
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
            href={`/dashboard/products/${productId}/edit`}
          >
            Edit Product
          </Link>
        </div>
      </header>

      {images.length > 0 && (
        <section className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Images ({images.length})</h2>
            <Link className="text-sm text-primary hover:underline" href={`/dashboard/products/${productId}/edit?tab=images`}>
              Manage images
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                {img.publicUrl ? (
                  <img src={img.publicUrl} alt={img.altText ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs">No image</div>
                )}
                {img.isPrimary && <span className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">Primary</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-medium">Basic Information</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Slug</dt>
            <dd className="font-mono">{product.slug}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Base Price</dt>
            <dd>
              {product.currencyCode} {product.basePriceMinor / 100}
              {product.compareAtPriceMinor && (
                <span className="ml-2 text-muted-foreground line-through">
                  {product.currencyCode} {product.compareAtPriceMinor / 100}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Type</dt>
            <dd>{product.productType || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Allow Backorder</dt>
            <dd>{product.allowBackorder ? "Yes" : "No"}</dd>
          </div>
          {product.seoTitle && (
            <div>
              <dt className="text-muted-foreground">SEO Title</dt>
              <dd>{product.seoTitle}</dd>
            </div>
          )}
          {product.seoDescription && (
            <div>
              <dt className="text-muted-foreground">SEO Description</dt>
              <dd className="line-clamp-2">{product.seoDescription}</dd>
            </div>
          )}
        </dl>
        {product.shortDescription && (
          <div className="mt-3">
            <dt className="text-sm text-muted-foreground">Short Description</dt>
            <dd className="mt-1 text-sm">{product.shortDescription}</dd>
          </div>
        )}
        {product.description && (
          <div className="mt-3">
            <dt className="text-sm text-muted-foreground">Description</dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">{product.description}</dd>
          </div>
        )}
      </section>

      {attributes.length > 0 && (
        <section className="rounded-md border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-medium">Attributes</h2>
          <div className="flex flex-wrap gap-4">
            {attributes.map((attr) => (
              <div key={attr.id} className="rounded border border-border bg-background p-3">
                <h3 className="font-medium">{attr.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {attr.values.map((v) => v.value).join(", ")}
                </p>
              </div>
            ))}
          </div>
          <Link
            className="mt-3 inline-block text-sm text-primary hover:underline"
            href={`/dashboard/products/${productId}/edit?tab=attributes`}
          >
            Manage attributes
          </Link>
        </section>
      )}

      {contentSections.length > 0 && (
        <section className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Content Sections</h2>
            <Link className="text-sm text-primary hover:underline" href={`/dashboard/products/${productId}/edit?tab=content`}>
              Manage content
            </Link>
          </div>
          <div className="space-y-2">
            {contentSections.map((section) => (
              <div key={section.id} className="rounded border border-border bg-background p-3">
                <h3 className="font-medium">{section.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{section.contentType}</p>
                {typeof section.contentJson?.body === 'string' && (
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{section.contentJson.body as string}</pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {promotions.length > 0 && (
        <section className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Payment Promotions</h2>
            <Link className="text-sm text-primary hover:underline" href={`/dashboard/products/${productId}/edit?tab=promos`}>
              Manage promos
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {promotions.map((promo) => (
              <span key={promo.id} className="rounded bg-muted px-2 py-1 text-sm">
                {promo.title}
              </span>
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recommended Products</h2>
            <Link className="text-sm text-primary hover:underline" href={`/dashboard/products/${productId}/edit?tab=recommendations`}>
              Manage recommendations
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                className="rounded border border-border bg-background px-2 py-1 text-sm hover:bg-accent"
                href={`/dashboard/products/${rec.recommendedProductId}`}
              >
                {rec.recommendedProductName}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-md border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Variants</h2>
          <Link
            className="text-sm text-primary hover:underline"
            href={`/dashboard/products/${productId}?step=variants`}
          >
            Manage variants
          </Link>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Stock</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-border">
                    <td className="py-2 font-mono">{variant.sku}</td>
                    <td className="py-2">{variant.title}</td>
                    <td className="py-2">
                      {product.currencyCode} {variant.priceMinor / 100}
                      {variant.compareAtPriceMinor && (
                        <span className="ml-1 text-muted-foreground line-through">
                          {product.currencyCode} {variant.compareAtPriceMinor / 100}
                        </span>
                      )}
                    </td>
                    <td className="py-2 capitalize">{variant.status}</td>
                    <td className="py-2 text-right">
                      <span
                        className={
                          variant.quantityOnHand === 0
                            ? "text-destructive"
                            : variant.quantityOnHand <= variant.lowStockThreshold
                            ? "text-warning"
                            : ""
                        }
                      >
                        {variant.quantityOnHand}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <AdjustStockButton variantId={variant.id} variantSku={variant.sku} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-medium">Recent Activity</h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentAudit.map((entry) => (
              <li key={entry.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span>
                  {entry.action} ({entry.targetType})
                </span>
                <span className="text-muted-foreground">
                  {entry.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="flex gap-2">
        <Link className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent" href="/dashboard/products">
          Back to products
        </Link>
      </footer>
    </main>
  );
}