"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardMetricCard, DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getErrorMessage } from "@/core/utils/error";

type AdminInventoryVariant = {
  variantId: string;
  sku: string;
  optionSignature: string;
  quantityOnHand: number;
  quantityReserved: number;
  priceMinor: number;
  compareAtPriceMinor: number | null;
};

type AdminInventoryProduct = {
  productId: string;
  title: string;
  slug: string;
  variants: AdminInventoryVariant[];
};

type AdminInventoryCatalogProps = {
  initialCatalog: AdminInventoryProduct[];
};

export function AdminInventoryCatalog({ initialCatalog }: AdminInventoryCatalogProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState(initialCatalog);
  const [search, setSearch] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<Record<string, number>>({});
  const [pendingPrices, setPendingPrices] = useState<Record<string, number | null>>({});
  const [pendingCompareAts, setPendingCompareAts] = useState<Record<string, number | null>>({});

  const filtered = catalog.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleQuantityChange = useCallback((variantId: string, value: string) => {
    setPendingValues((prev) => ({ ...prev, [variantId]: parseInt(value, 10) || 0 }));
  }, []);

  const handlePriceChange = useCallback((variantId: string, value: string) => {
    const parsed = parseFloat(value);
    setPendingPrices((prev) => ({
      ...prev,
      [variantId]: isNaN(parsed) ? null : Math.round(parsed * 100),
    }));
  }, []);

  const handleCompareAtChange = useCallback((variantId: string, value: string) => {
    const parsed = parseFloat(value);
    setPendingCompareAts((prev) => ({
      ...prev,
      [variantId]: isNaN(parsed) ? null : Math.round(parsed * 100),
    }));
  }, []);

  const handleQuantitySave = useCallback(
    async (
      variantId: string,
      productId: string,
      originalQuantity: number,
      originalPrice: number,
    ) => {
      const pendingQty = pendingValues[variantId];
      const pendingPrice = pendingPrices[variantId];
      const pendingCompareAt = pendingCompareAts[variantId];
      if (pendingQty === undefined && pendingPrice === undefined && pendingCompareAt === undefined) {
        return;
      }
      setSavingVariantId(variantId);
      try {
        const res = await fetch("/api/admin/inventory/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantId,
            quantityOnHand: pendingQty ?? originalQuantity,
            priceMinor: pendingPrice !== undefined ? pendingPrice : null,
            compareAtPriceMinor: pendingCompareAt !== undefined ? pendingCompareAt : null,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(getErrorMessage(json.error));
          return;
        }
        toast.success("Updated");
        setPendingValues((prev) => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });
        setPendingPrices((prev) => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });
        setPendingCompareAts((prev) => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });
        setCatalog((prev) =>
          prev.map((p) =>
            p.productId === productId
              ? {
                  ...p,
                  variants: p.variants.map((v) =>
                    v.variantId === variantId
                      ? {
                          ...v,
                          quantityOnHand: pendingQty ?? originalQuantity,
                          priceMinor: pendingPrice !== undefined
                            ? (pendingPrice ?? originalPrice)
                            : v.priceMinor,
                          compareAtPriceMinor: pendingCompareAt !== undefined
                            ? pendingCompareAt
                            : v.compareAtPriceMinor,
                        }
                      : v
                  ),
                }
              : p
          )
        );
        router.refresh();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSavingVariantId(null);
      }
    },
    [pendingValues, pendingPrices, pendingCompareAts, router]
  );

  function getTotalStock(product: AdminInventoryProduct) {
    return product.variants.reduce((sum, v) => sum + v.quantityOnHand, 0);
  }
  const totalVariants = catalog.reduce((sum, p) => sum + p.variants.length, 0);
  const totalStock = catalog.reduce((sum, p) => sum + getTotalStock(p), 0);

  if (initialCatalog.length === 0) {
    return (
      <EmptyState message="No inventory found. Add products to see stock here." />
    );
  }

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Stock operations"
        title="Inventory"
        description="Review variant-level stock, reserved quantities, and price adjustments without changing inventory workflows."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard label="Products tracked" value={catalog.length} tone="orange" />
        <DashboardMetricCard label="Variant rows" value={totalVariants} />
        <DashboardMetricCard label="Units on hand" value={totalStock} />
      </div>
      <Input
        placeholder="Search by product name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10 border-[#d9d9d9] bg-white focus-visible:border-[#f97316] focus-visible:ring-[#f97316]/20"
      />

      {filtered.length === 0 ? (
        <EmptyState message="No products match your search." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
          <table className="w-full text-left font-ui text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc]">
              <tr>
                <th className="w-8 px-3 py-2"></th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">Product</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">Slug</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#64748b]">Variants</th>
                <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#64748b]">Total stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const isExpanded = expandedProductId === product.productId;
                return (
                  <React.Fragment key={product.productId}>
                    <tr
                      className="cursor-pointer border-b border-[#eef2f7] transition-colors hover:bg-[#fff7ed]/45"
                      onClick={() =>
                        setExpandedProductId(isExpanded ? null : product.productId)
                      }
                    >
                      <td className="px-3 py-2">
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium text-sm">{product.title}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {product.slug}
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {product.variants.length}
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-mono">
                        {getTotalStock(product)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${product.productId}-detail`} className="border-b border-border bg-muted/20">
                        <td colSpan={5} className="px-0 py-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                                <tr>
                                  <th className="px-4 py-2 font-medium">Variation</th>
                                  <th className="px-4 py-2 font-medium">SKU</th>
                                  <th className="px-4 py-2 font-medium text-right">Price (LKR)</th>
                                  <th className="px-4 py-2 font-medium text-right">Old Price (LKR)</th>
                                  <th className="px-4 py-2 font-medium text-right">Reserved</th>
                                  <th className="px-4 py-2 font-medium text-right">On Hand</th>
                                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((variant) => {
                                  const hasPendingQty = variant.variantId in pendingValues;
                                  const hasPendingPrice = variant.variantId in pendingPrices;
                                  const hasPendingCompareAt = variant.variantId in pendingCompareAts;
                                  const displayQty = hasPendingQty
                                    ? pendingValues[variant.variantId]
                                    : variant.quantityOnHand;
                                  const displayPrice = hasPendingPrice
                                    ? (pendingPrices[variant.variantId] !== null
                                        ? (pendingPrices[variant.variantId] as number) / 100
                                        : "")
                                    : (variant.priceMinor / 100).toFixed(2);
                                  const displayCompareAt = hasPendingCompareAt
                                    ? (pendingCompareAts[variant.variantId] !== null
                                        ? (pendingCompareAts[variant.variantId] as number) / 100
                                        : "")
                                    : (variant.compareAtPriceMinor !== null
                                        ? (variant.compareAtPriceMinor / 100).toFixed(2)
                                        : "");
                                  const hasChanged =
                                    (hasPendingQty && pendingValues[variant.variantId] !== variant.quantityOnHand) ||
                                    hasPendingPrice ||
                                    hasPendingCompareAt;
                                  return (
                                    <tr
                                      key={variant.variantId}
                                      className="border-b border-border last:border-b-0"
                                    >
                                      <td className="px-4 py-2 text-xs">
                                        {variant.optionSignature}
                                      </td>
                                      <td className="px-4 py-2 font-mono text-xs">
                                        {variant.sku}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <input
                                          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right font-mono"
                                          min={0}
                                          step="0.01"
                                          type="number"
                                          value={displayPrice}
                                          onChange={(e) =>
                                            handlePriceChange(variant.variantId, e.target.value)
                                          }
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <input
                                          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right font-mono"
                                          min={0}
                                          step="0.01"
                                          type="number"
                                          value={displayCompareAt}
                                          placeholder="—"
                                          onChange={(e) =>
                                            handleCompareAtChange(variant.variantId, e.target.value)
                                          }
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-right text-xs font-mono">
                                        {variant.quantityReserved}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <input
                                          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right font-mono"
                                          min={0}
                                          type="number"
                                          value={displayQty}
                                          onChange={(e) =>
                                            handleQuantityChange(variant.variantId, e.target.value)
                                          }
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={
                                            savingVariantId === variant.variantId || !hasChanged
                                          }
                                          onClick={() =>
                                            handleQuantitySave(
                                              variant.variantId,
                                              product.productId,
                                              variant.quantityOnHand,
                                              variant.priceMinor
                                            )
                                          }
                                        >
                                          {savingVariantId === variant.variantId ? "Saving..." : "Save"}
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
