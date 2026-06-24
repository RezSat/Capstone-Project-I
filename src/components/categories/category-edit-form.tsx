"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ChevronRight } from "lucide-react";
import { CategoryFilterEditor, type FilterRow } from "./category-filter-editor";

type Props = {
  categoryId: string;
  initialData: {
    name: string;
    slug: string;
    groupSlug: string;
    parentId: string | null;
    description: string | null;
    title: string | null;
    heroImage: string | null;
    fallbackHeroImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    status: "active" | "inactive" | "hidden";
    sortOrder: number;
  };
  existingGroupSlugs: string[];
};

type UploadResult = {
  isSuccess: boolean;
  message: string;
  publicUrl?: string;
};

async function uploadCategoryImage(categoryId: string, file: File): Promise<UploadResult> {
  const intentRes = await fetch(`/api/admin/categories/${categoryId}/files/upload-intent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "image", fileName: file.name, mimeType: file.type, sizeBytes: file.size }),
  });
  const intentBody = await intentRes.json().catch(() => null);

  if (!intentRes.ok || !intentBody?.success) {
    return { isSuccess: false, message: intentBody?.error?.message || "Could not start upload." };
  }

  const { uploadUrl, storageKey, bucket } = intentBody.data;
  if (!uploadUrl) return { isSuccess: false, message: "Upload URL not generated." };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  }).catch(() => null);

  if (!putRes?.ok) return { isSuccess: false, message: "Storage upload failed." };

  const finalizeRes = await fetch(`/api/admin/categories/${categoryId}/files/finalize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "image", storageKey, bucket }),
  });
  const finalizeBody = await finalizeRes.json().catch(() => null);

  if (!finalizeRes.ok || !finalizeBody?.success || !finalizeBody?.data?.publicUrl) {
    return { isSuccess: false, message: "Upload succeeded but image URL could not be resolved." };
  }

  return { isSuccess: true, message: "Image uploaded.", publicUrl: finalizeBody.data.publicUrl as string };
}

export function CategoryEditForm({ categoryId, initialData, existingGroupSlugs }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(!existingGroupSlugs.includes(initialData.groupSlug));
  const [selectedGroupSlug, setSelectedGroupSlug] = useState(initialData.groupSlug);
  const [manualGroupSlug, setManualGroupSlug] = useState(initialData.groupSlug);
  const [parentId] = useState(initialData.parentId ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [title, setTitle] = useState(initialData.title ?? "");
  const [heroImage, setHeroImage] = useState(initialData.heroImage ?? "");
  const [fallbackHeroImage, setFallbackHeroImage] = useState(initialData.fallbackHeroImage ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData.seoDescription ?? "");
  const [status, setStatus] = useState(initialData.status);
  const [sortOrder, setSortOrder] = useState(initialData.sortOrder);
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingFallbackHero, setIsUploadingFallbackHero] = useState(false);

  const effectiveGroupSlug = isCreatingNewGroup ? manualGroupSlug : selectedGroupSlug;

  useEffect(() => {
    fetch(`/api/admin/categories/${categoryId}/filters-with-options`)
      .then((res) => res.ok ? res.json() : null)
      .then((payload) => {
        if (!payload?.data) return;
        setFilters(payload.data as FilterRow[]);
      });
  }, [categoryId]);

  async function saveBasicDetails() {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, groupSlug: effectiveGroupSlug, parentId: parentId || null, description: description || null, title: title || null, heroImage: heroImage || null, fallbackHeroImage: fallbackHeroImage || null, seoTitle: seoTitle || null, seoDescription: seoDescription || null, status, sortOrder }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error?.message ?? "Failed to save"); return; }
      toast.success("Saved successfully");
    } catch {
      toast.error("An unexpected error occurred");
    }
    setIsSubmitting(false);
  }

  async function archiveCategory() {
    if (!confirm("Archive this category?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error?.message ?? "Failed to archive"); return; }
      toast.success("Category archived");
      router.push("/dashboard/categories");
    } catch {
      toast.error("An unexpected error occurred");
    }
    setIsSubmitting(false);
  }

  async function handleHeroImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setIsUploadingHero(true);
    try {
      const result = await uploadCategoryImage(categoryId, file);
      if (result.isSuccess && result.publicUrl) {
        setHeroImage(result.publicUrl);
        toast.success("Hero image uploaded");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsUploadingHero(false);
      input.value = "";
    }
  }

  async function handleFallbackHeroImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setIsUploadingFallbackHero(true);
    try {
      const result = await uploadCategoryImage(categoryId, file);
      if (result.isSuccess && result.publicUrl) {
        setFallbackHeroImage(result.publicUrl);
        toast.success("Fallback hero image uploaded");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsUploadingFallbackHero(false);
      input.value = "";
    }
  }

  function handleGroupSlugSelect(value: string) {
    if (value === "__new__") {
      setIsCreatingNewGroup(true);
      setSelectedGroupSlug(initialData.groupSlug);
      setManualGroupSlug("");
    } else {
      setIsCreatingNewGroup(false);
      setSelectedGroupSlug(value);
      setManualGroupSlug("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Basic Details</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            Name *
            <input className="rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Slug
            <input className="rounded border px-2 py-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Parent Category
            {!isCreatingNewGroup ? (
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded border px-2 py-1"
                  value={selectedGroupSlug}
                  onChange={(e) => handleGroupSlugSelect(e.target.value)}
                >
                  <option value="">Select existing group...</option>
                  {existingGroupSlugs.map((slug) => (
                    <option key={slug} value={slug}>{slug}</option>
                  ))}
                  <option value="__new__">+ Create New Group</option>
                </select>
                {selectedGroupSlug && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewGroup(true)}
                    className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
                    title="Create new group"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={manualGroupSlug}
                  onChange={(e) => setManualGroupSlug(e.target.value)}
                  placeholder="Enter new group slug"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewGroup(false);
                    setManualGroupSlug("");
                  }}
                  className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
                >
                  <ChevronRight className="h-3 w-3" />
                  Select Existing
                </button>
              </div>
            )}
          </label>

          <label className="grid gap-1 text-sm font-medium md:col-span-2">
            Description
            <textarea className="rounded border px-2 py-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Title (Page Title)
            <input className="rounded border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Sort Order
            <input className="rounded border px-2 py-1" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Status
            <select className="rounded border px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            SEO Title
            <input className="rounded border px-2 py-1" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={120} />
          </label>
          <label className="grid gap-1 text-sm font-medium md:col-span-2">
            SEO Description
            <textarea className="rounded border px-2 py-1" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} maxLength={320} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Hero Image URL
            <input className="rounded border px-2 py-1" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." />
            <input
              className="rounded border px-2 py-1 text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleHeroImageUpload}
              disabled={isUploadingHero}
            />
            {isUploadingHero ? <span className="text-xs text-muted-foreground">Uploading...</span> : null}
            {heroImage ? <img src={heroImage} alt="Hero preview" className="mt-1 h-24 w-full rounded border object-cover" /> : null}
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Fallback Hero Image URL
            <input className="rounded border px-2 py-1" value={fallbackHeroImage} onChange={(e) => setFallbackHeroImage(e.target.value)} placeholder="https://..." />
            <input
              className="rounded border px-2 py-1 text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFallbackHeroImageUpload}
              disabled={isUploadingFallbackHero}
            />
            {isUploadingFallbackHero ? <span className="text-xs text-muted-foreground">Uploading...</span> : null}
            {fallbackHeroImage ? <img src={fallbackHeroImage} alt="Fallback hero preview" className="mt-1 h-24 w-full rounded border object-cover" /> : null}
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" onClick={saveBasicDetails} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Details"}
          </button>
          <button type="button" className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10" onClick={archiveCategory} disabled={isSubmitting}>
            Archive
          </button>
        </div>
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Filters</h2>
        <CategoryFilterEditor categoryId={categoryId} filters={filters} onUpdate={setFilters} />
      </div>
    </div>
  );
}
