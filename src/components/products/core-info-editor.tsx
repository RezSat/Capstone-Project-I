"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type ProductOption = { id: string; name: string; groupSlug?: string };
type BrandOption = { id: string; name: string; slug: string };

type CoreInfoEditorProps = {
  title: string;
  priceMinor: number;
  comparePriceMinor: number | null;
  status: "draft" | "active" | "archived";
  categoryId: string | null;
  brandId: string | null;
  categories: ProductOption[];
  brands: ProductOption[];
  onTitleChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onComparePriceChange: (value: number | null) => void;
  onStatusChange: (status: "draft" | "active" | "archived") => void;
  onCategoryChange: (id: string | null) => void;
  onBrandChange: (id: string | null) => void;
};

function formatMinorForDisplay(minor: number | null): string {
  if (minor === null || minor === undefined) return "";
  return (minor / 100).toFixed(2);
}

export function CoreInfoEditor({
  title, priceMinor, comparePriceMinor, status, categoryId, brandId,
  categories, brands, onTitleChange, onPriceChange, onComparePriceChange,
  onStatusChange, onCategoryChange, onBrandChange,
}: CoreInfoEditorProps) {
  const [priceDisplay, setPriceDisplay] = useState(formatMinorForDisplay(priceMinor));
  const [compareDisplay, setCompareDisplay] = useState(formatMinorForDisplay(comparePriceMinor));
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  const [localBrands, setLocalBrands] = useState<BrandOption[]>(
    brands.map((b) => ({ id: b.id, name: b.name, slug: "" }))
  );

  useEffect(() => {
    setLocalBrands(brands.map((b) => ({ id: b.id, name: b.name, slug: "" })));
  }, [brands]);

  function handlePriceInputChange(value: string) {
    setPriceDisplay(value);
    const stripped = value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(stripped);
    if (!isNaN(parsed)) {
      onPriceChange(Math.round(parsed * 100));
    } else if (stripped === "") {
      onPriceChange(0);
    }
  }

  function handleCompareInputChange(value: string) {
    setCompareDisplay(value);
    const stripped = value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(stripped);
    if (!isNaN(parsed) && stripped !== "") {
      onComparePriceChange(Math.round(parsed * 100));
    } else if (stripped === "") {
      onComparePriceChange(null);
    }
  }

  async function handleSaveBrand() {
    if (!newBrandName.trim() || savingBrand) return;
    setSavingBrand(true);

    try {
      const generatedSlug = newBrandName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBrandName.trim(),
          slug: generatedSlug
        }),
      });

      const body = await res.json();
      if (body?.success && body?.data) {
        const created: BrandOption = {
          id: body.data.id,
          name: body.data.name,
          slug: body.data.slug
        };
        setLocalBrands((prev) => [...prev, created]);
        onBrandChange(created.id);
        setNewBrandName("");
        setBrandModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to quickly save brand asset:", error);
    } finally {
      setSavingBrand(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-ui" htmlFor="product-title">Product Name</label>
        <Input id="product-title" placeholder="Enter product name" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-ui" htmlFor="product-price">Selling Price (LKR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-surface-light border border-input rounded-md px-2 py-1">LKR</span>
            <Input id="product-price" type="text" inputMode="decimal" placeholder="0.00" value={priceDisplay} onChange={(e) => handlePriceInputChange(e.target.value)} className="pl-16" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-ui" htmlFor="product-compare-price">Original / Old Price (LKR) (Optional)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-surface-light border border-input rounded-md px-2 py-1">LKR</span>
            <Input id="product-compare-price" type="text" inputMode="decimal" placeholder="0.00" value={compareDisplay} onChange={(e) => handleCompareInputChange(e.target.value)} className="pl-16" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-ui" htmlFor="product-status">Status</label>
        <select id="product-status" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={status} onChange={(e) => onStatusChange(e.target.value as "draft" | "active" | "archived")}>
          <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-ui" htmlFor="product-category">Category</label>
          <select id="product-category" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={categoryId ?? ""} onChange={(e) => onCategoryChange(e.target.value || null)}>
            <option value="">Select category</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.groupSlug ? `${cat.groupSlug} / ` : ""}{cat.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium font-ui" htmlFor="product-brand">Brand</label>
            <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => setBrandModalOpen(true)}>+ Create Brand</button>
          </div>
          <select id="product-brand" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={brandId ?? ""} onChange={(e) => onBrandChange(e.target.value || null)}>
            <option value="">Select brand</option>
            {localBrands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </div>
      </div>
      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter brand name"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveBrand()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBrandModalOpen(false); setNewBrandName(""); }}>Cancel</Button>
            <Button onClick={handleSaveBrand} disabled={savingBrand || !newBrandName.trim()}>
              {savingBrand ? "Saving..." : "Save Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
