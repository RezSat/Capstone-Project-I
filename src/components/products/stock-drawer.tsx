"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ColorChip } from "./color-input";

type VariantMatrixRow = {
  id: string;
  combination: string;
  sku: string;
  priceOverride: number;
  initialStock: number;
};

type StockDrawerProps = {
  productId: string;
  sizeLabel: string;
  sizes: string[];
  colors: ColorChip[];
  onClose: () => void;
  onSave: (rows: VariantMatrixRow[]) => void;
};

export function StockDrawer({ productId, sizeLabel, sizes, colors, onClose, onSave }: StockDrawerProps) {
  const [rows, setRows] = useState<VariantMatrixRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateMatrix() {
    if (sizes.length === 0 && colors.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const sizeAttrSlug = sizeLabel.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const sizeAttrRes = await fetch(`/api/admin/products/${productId}/attributes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sizeLabel, slug: sizeAttrSlug, displayType: "button", isVariantAttribute: true, isRequired: true }),
      });
      const sizeAttrData = await sizeAttrRes.json();
      const sizeAttrId = sizeAttrData?.data?.id;
      if (!sizeAttrId) { setError("Failed to create size attribute"); return; }
      for (const size of sizes) {
        await fetch(`/api/admin/products/${productId}/attributes/${sizeAttrId}/values`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: size, value: size.toLowerCase().replace(/\s+/g, "-"), colorHex: null }),
        });
      }
      const colorAttrRes = await fetch(`/api/admin/products/${productId}/attributes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Color", slug: "color", displayType: "color", isVariantAttribute: true, isRequired: true }),
      });
      const colorAttrData = await colorAttrRes.json();
      const colorAttrId = colorAttrData?.data?.id;
      if (!colorAttrId) { setError("Failed to create color attribute"); return; }
      for (const color of colors) {
        await fetch(`/api/admin/products/${productId}/attributes/${colorAttrId}/values`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: color.label, value: color.label.toLowerCase().replace(/\s+/g, "-"), colorHex: color.hex }),
        });
      }
      const generateRes = await fetch(`/api/admin/products/${productId}/variants/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributes: [] }),
      });
      const payload = await generateRes.json();
      if (!payload?.success) { setError(payload?.error?.message ?? "Failed to generate"); return; }
      const combos = payload.data?.createdVariants as Array<{ id: string; title: string }> ?? [];
      setRows(combos.map((v) => ({ id: v.id, combination: v.title, sku: "", priceOverride: 0, initialStock: 0 })));
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function updateRow(id: string, patch: Partial<VariantMatrixRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleSave() {
    onSave(rows);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-background border-l">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-oswald text-lg font-semibold uppercase">Stock Manager</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex items-center gap-3">
            <Button type="button" size="sm" onClick={generateMatrix} disabled={loading}>
              {loading ? "Generating..." : "Auto-Build Matrix"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
          {rows.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Variant</th>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                  <th className="px-3 py-2 text-left font-medium">Price (LKR)</th>
                  <th className="px-3 py-2 text-left font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="px-3 py-2">{row.combination}</td>
                    <td className="px-3 py-2">
                      <input className="w-full rounded border border-input bg-transparent px-2 py-1 text-sm" value={row.sku} onChange={(e) => updateRow(row.id, { sku: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="w-full rounded border border-input bg-transparent px-2 py-1 text-sm" value={row.priceOverride || ""} onChange={(e) => updateRow(row.id, { priceOverride: Number(e.target.value) * 100 })} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="w-full rounded border border-input bg-transparent px-2 py-1 text-sm" value={row.initialStock || ""} onChange={(e) => updateRow(row.id, { initialStock: Number(e.target.value) })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Click &quot;Auto-Build Matrix&quot; to generate variant combinations</p>
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={rows.length === 0}>Save Stock</Button>
        </div>
      </div>
    </div>
  );
}