"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { slugifyProductName } from "@/modules/products/dashboard-product-wizard.service";
import { AccordionBuilder } from "./accordion-builder";
import { ImageGalleryEditor } from "./image-gallery-editor";
import { CoreInfoEditor } from "./core-info-editor";
import { StockDrawer } from "./stock-drawer";
import { SettingsEditor } from "./settings-editor";
import { VariantsStockSection, DescriptionSection } from "./variants-stock-section";
import type { ColorChip } from "./color-input";

type ProductOption = { id: string; name: string; groupSlug?: string };

type AccordionEntry = { id: string; title: string; contentType: "bullets" | "paragraphs"; bullets: string[]; paragraphs: string[] };
type ProductImageEntry = { id: string; src: string; alt: string; orientation: "portrait" | "landscape" | "square" };
type VariantMatrixRow = { id: string; combination: string; sku: string; priceOverride: number; initialStock: number };

type ProductFormState = {
  title: string; slug: string; description: string; priceMinor: number; comparePriceMinor: number | null;
  status: "draft" | "active" | "archived"; categoryId: string | null; brandId: string | null;
  visibility: "public" | "private"; isFeatured: boolean; promoLabel: "none" | "new_arrival" | "best_seller";
  accordions: AccordionEntry[]; images: ProductImageEntry[]; sizes: string[]; colors: ColorChip[];
  sizeLabel: string;
};

type ProductEditorFormProps = { productId?: string; initialData?: Partial<ProductFormState> };

export function ProductEditorForm({ productId: _productId, initialData }: ProductEditorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>({
    title: initialData?.title ?? "", slug: initialData?.slug ?? "", description: initialData?.description ?? "",
    priceMinor: initialData?.priceMinor ?? 0, comparePriceMinor: initialData?.comparePriceMinor ?? null, status: initialData?.status ?? "draft",
    categoryId: initialData?.categoryId ?? null, brandId: initialData?.brandId ?? null,
    visibility: initialData?.visibility ?? "public", isFeatured: initialData?.isFeatured ?? false,
    promoLabel: initialData?.promoLabel ?? "none", accordions: initialData?.accordions ?? [],
    images: initialData?.images ?? [], sizes: initialData?.sizes ?? [], colors: initialData?.colors ?? [],
    sizeLabel: initialData?.sizeLabel ?? "Size",
  });
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [brands, setBrands] = useState<ProductOption[]>([]);
  const [stockDrawerOpen, setStockDrawerOpen] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantMatrixRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/brands", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([catPayload, brandPayload]) => {
      setCategories((catPayload?.data ?? []) as ProductOption[]);
      setBrands((brandPayload?.data ?? []) as ProductOption[]);
    }).catch(() => { setCategories([]); setBrands([]); });
  }, []);

  function handleTitleChange(value: string) {
    setForm((prev) => ({ ...prev, title: value, slug: slugifyProductName(value) }));
  }

  function handlePriceChange(minor: number) {
    setForm((prev) => ({ ...prev, priceMinor: minor }));
  }

  function handleComparePriceChange(value: number | null) {
    setForm((prev) => ({ ...prev, comparePriceMinor: value }));
  }

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (saving) return;
    if (form.comparePriceMinor !== null && form.comparePriceMinor <= form.priceMinor) {
      toast.error("The original old price must be greater than the selling price.");
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugifyProductName(form.title);

      const accordionsBullets: Record<string, string[]> = {};
      const accordionsParagraphs: Record<string, string[]> = {};
      const accordionsPayload = form.accordions.map((a) => {
        if (a.id || !a.id?.startsWith("pending")) {
          if (a.contentType === "bullets" && a.bullets.length > 0) accordionsBullets[a.id] = a.bullets;
          if (a.contentType === "paragraphs" && a.paragraphs.length > 0) accordionsParagraphs[a.id] = a.paragraphs;
        }
        return {
          id: a.id || undefined,
          title: a.title,
          contentType: a.contentType,
          bullets: a.contentType === "bullets" ? a.bullets : undefined,
          paragraphs: a.contentType === "paragraphs" ? a.paragraphs : undefined,
        };
      });

      const optionGroups: Array<{
        name: string;
        slug: string;
        displayType: string;
        isVariantAttribute: boolean;
        isRequired: boolean;
        values: Array<{ label: string; value: string; color?: string }>;
      }> = [];

      if (form.sizes.length > 0) {
        optionGroups.push({
          name: form.sizeLabel || "Size",
          slug: slugifyProductName(form.sizeLabel || "Size"),
          displayType: "button",
          isVariantAttribute: true,
          isRequired: true,
          values: form.sizes.map(s => ({ label: s, value: s })),
        });
      }

      if (form.colors.length > 0) {
        optionGroups.push({
          name: "Color",
          slug: "color",
          displayType: "color",
          isVariantAttribute: true,
          isRequired: true,
          values: form.colors.map(c => ({ label: c.label, value: c.label, color: c.hex })),
        });
      }

      const payload = {
        name: form.title,
        slug,
        categoryId: form.categoryId,
        brandId: form.brandId,
        shortDescription: null,
        description: form.description || null,
        basePriceMinor: form.priceMinor,
        compareAtPriceMinor: form.comparePriceMinor,
        status: form.status === "archived" ? "archived" : form.status,
        seoTitle: null,
        seoDescription: null,
        isFeatured: form.isFeatured,
        promoLabel: form.promoLabel,
        accordions: accordionsPayload,
        accordionsBullets: Object.keys(accordionsBullets).length > 0 ? accordionsBullets : undefined,
        accordionsParagraphs: Object.keys(accordionsParagraphs).length > 0 ? accordionsParagraphs : undefined,
        optionGroups: optionGroups.length > 0 ? optionGroups : undefined,
        variantRows: variantRows.length > 0 ? variantRows : undefined,
      };

      console.log("🚀 SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload, null, 2));

      let productId = _productId ?? null;

      if (!productId) {
        const createRes = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("📦 CREATE RESPONSE:", createRes.status, await createRes.clone().text());
        const createBody = await createRes.json();
        if (!createBody?.success) {
          toast.error(createBody?.error?.message ?? "Failed to create product");
          return;
        }
        productId = createBody.data?.id ?? null;
        if (!productId) {
          toast.error("Product created but ID not returned");
          return;
        }
      }

      if (pendingFiles.length > 0 && productId) {
        const uploadForm = new FormData();
        uploadForm.set("productId", productId);
        for (const file of pendingFiles) uploadForm.append("files", file);
        const uploadRes = await fetch("/api/admin/products/upload", { method: "POST", body: uploadForm });
        const uploadBody = await uploadRes.json();
        if (!uploadBody?.success) {
          toast.error(uploadBody?.error?.message ?? "Image upload failed");
          return;
        }
        const uploadedUrls: string[] = uploadBody.data;
        const pendingImages = form.images.filter((img) => !img.src && img.id.includes("pending"));
        const updatedImages = form.images.map((img) => {
          const idx = pendingImages.findIndex((p) => p.id === img.id);
          return idx >= 0 && uploadedUrls[idx] ? { ...img, src: uploadedUrls[idx] } : img;
        });
        setPendingFiles([]);
        setForm((prev) => ({ ...prev, images: updatedImages }));

        const patchPayload = { ...payload, images: updatedImages.map((img) => ({ src: img.src, alt: img.alt || null, orientation: img.orientation })) };
        console.log("📦 PATCH (with images) RESPONSE:", JSON.stringify(patchPayload, null, 2));

        const patchRes = await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
        });
        const patchBody = await patchRes.json();
        if (!patchBody?.success) {
          toast.error(patchBody?.error?.message ?? "Failed to update product with images");
          return;
        }
      } else {
        const isUpdate = Boolean(_productId);
        if (isUpdate) {
          const updateRes = await fetch(`/api/admin/products/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const updateBody = await updateRes.json();
          if (!updateBody?.success) {
            toast.error(updateBody?.error?.message ?? "Failed to update product");
            return;
          }
        }
      }

      toast.success("Product Saved Successfully!");
      router.push("/dashboard/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!_productId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${_productId}`, { method: "DELETE" });
      const body = await res.json();
      if (!body?.success) {
        toast.error(body?.error?.message ?? "Failed to delete product");
        return;
      }
      toast.success("Product and variants deleted successfully.");
      router.push("/dashboard/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
      <div className="sticky top-16 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white/95 px-6 py-4 backdrop-blur">
        <h1 className="font-oswald text-xl font-semibold uppercase tracking-wide text-[#191A1C]">Product Details & Editor</h1>
        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          <Button variant="outline" size="sm">Edit Product</Button>
          {_productId ? (
            <Button variant="outline" size="sm" className="border-danger-red text-danger-red hover:bg-danger-red/10" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 bg-[#f8fafc] p-5 lg:grid-cols-3 lg:p-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide mb-4">Core Information</h2>
            {form.comparePriceMinor !== null && form.comparePriceMinor <= form.priceMinor && (
              <div className="mb-3 rounded-md bg-amber-50 border border-amber-300 px-3 py-2 text-sm text-amber-800">
                Warning: The original old price must be greater than the selling price.
              </div>
            )}
            <CoreInfoEditor
              title={form.title} priceMinor={form.priceMinor} comparePriceMinor={form.comparePriceMinor} status={form.status}
              categoryId={form.categoryId} brandId={form.brandId} categories={categories} brands={brands}
              onTitleChange={handleTitleChange} onPriceChange={handlePriceChange} onComparePriceChange={handleComparePriceChange}
              onStatusChange={(s) => setForm((prev) => ({ ...prev, status: s }))}
              onCategoryChange={(c) => setForm((prev) => ({ ...prev, categoryId: c }))}
              onBrandChange={(b) => setForm((prev) => ({ ...prev, brandId: b }))}
            />
          </section>
          <DescriptionSection value={form.description} onChange={(d) => setForm((prev) => ({ ...prev, description: d }))} />
          <VariantsStockSection
            sizeLabel={form.sizeLabel} sizes={form.sizes} colors={form.colors} variantRows={variantRows}
            onSizeLabelChange={(s) => setForm((prev) => ({ ...prev, sizeLabel: s }))}
            onSizesChange={(s) => setForm((prev) => ({ ...prev, sizes: s }))}
            onColorsChange={(c) => setForm((prev) => ({ ...prev, colors: c }))}
            onStocksClick={() => setStockDrawerOpen(true)}
          />
          <AccordionBuilder accordions={form.accordions} onChange={(a) => setForm((prev) => ({ ...prev, accordions: a }))} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide mb-4">Settings</h2>
            <SettingsEditor
              visibility={form.visibility} isFeatured={form.isFeatured} promoLabel={form.promoLabel}
              onVisibilityChange={(v) => setForm((prev) => ({ ...prev, visibility: v }))}
              onFeaturedChange={(f) => setForm((prev) => ({ ...prev, isFeatured: f }))}
              onPromoChange={(p) => setForm((prev) => ({ ...prev, promoLabel: p }))}
            />
          </section>
          <ImageGalleryEditor images={form.images} onChange={(i) => setForm((prev) => ({ ...prev, images: i }))} onPendingFilesChange={(files) => setPendingFiles(files)} />
        </div>
      </div>
      {stockDrawerOpen && (
        <StockDrawer productId={_productId ?? ""} sizeLabel={form.sizeLabel} sizes={form.sizes} colors={form.colors}
          onClose={() => setStockDrawerOpen(false)} onSave={(r) => setVariantRows(r)} />
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to permanently delete this product? This action will completely erase all associated variant matrix inventory tracking rows.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
