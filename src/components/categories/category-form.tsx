"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, X, Plus, ChevronRight } from "lucide-react";
import { CategoryFilterBuilder, type CategoryFilterDraft } from "./category-filter-builder";
import { uploadDashboardCategoryImage } from "@/modules/product-files/dashboard-category-image-upload.service";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Props = {
  existingGroupSlugs: string[];
};

export function CategoryForm({ existingGroupSlugs }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [filters, setFilters] = useState<CategoryFilterDraft[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [selectedGroupSlug, setSelectedGroupSlug] = useState("");
  const [manualGroupSlug, setManualGroupSlug] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveGroupSlug = isCreatingNewGroup ? manualGroupSlug : selectedGroupSlug;

  async function handleCategoryImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const categoryId = pendingCategoryId;
    if (!categoryId) {
      toast.error("Please save the category first before uploading an image.");
      return;
    }

    setIsUploading(true);
    const result = await uploadDashboardCategoryImage({ categoryId, file });

    if (result.isSuccess) {
      toast.success(result.message);
      const objectUrl = URL.createObjectURL(file);
      setCurrentPreviewUrl(objectUrl);
    } else {
      toast.error(result.message);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugInput || slugify(name);
    const groupSlug = effectiveGroupSlug || "default";
    const description = String(formData.get("description") ?? "").trim() || undefined;
    const title = String(formData.get("title") ?? "").trim() || undefined;
    const seoTitle = String(formData.get("seoTitle") ?? "").trim() || undefined;
    const seoDescription = String(formData.get("seoDescription") ?? "").trim() || undefined;
    const status = String(formData.get("status") ?? "active") as "active" | "inactive" | "hidden";
    const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0;

    if (!name) {
      setErrors({ name: "Name is required" });
      return;
    }

    const categoryPayload: Record<string, unknown> = {
      name,
      slug,
      groupSlug,
      status,
      sortOrder,
    };
    if (description) categoryPayload.description = description;
    if (title) categoryPayload.title = title;
    if (seoTitle) categoryPayload.seoTitle = seoTitle;
    if (seoDescription) categoryPayload.seoDescription = seoDescription;

    setIsSubmitting(true);
    setErrors({});

    try {
      const categoryRes = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryPayload),
      });
      const categoryData = await categoryRes.json();

      if (!categoryRes.ok || !categoryData?.data?.id) {
        toast.error(categoryData?.error?.message ?? "Failed to create category");
        setIsSubmitting(false);
        return;
      }

      const categoryId = categoryData.data.id;
      setPendingCategoryId(categoryId);

      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        if (!filter.label || !filter.slug) continue;

        const filterRes = await fetch(`/api/admin/categories/${categoryId}/filters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: filter.label, slug: filter.slug, sourceKey: filter.sourceKey || null, sortOrder: i }),
        });
        const filterData = await filterRes.json();
        if (!filterRes.ok || !filterData?.data?.id) continue;

        const filterId = filterData.data.id;

        for (let j = 0; j < filter.options.length; j++) {
          const option = filter.options[j];
          if (!option.label || !option.value) continue;
          await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: option.label, value: option.value, sortOrder: j }),
          });
        }
      }

      toast.success("Category created successfully");
      router.push(`/dashboard/categories/${categoryId}/edit`);
    } catch {
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  function handleGroupSlugSelect(value: string) {
    if (value === "__new__") {
      setIsCreatingNewGroup(true);
      setSelectedGroupSlug("");
      setManualGroupSlug("");
    } else {
      setIsCreatingNewGroup(false);
      setSelectedGroupSlug(value);
      setManualGroupSlug("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Name *
          <input
            className={`rounded border px-2 py-1 ${errors.name ? "border-destructive" : ""}`}
            name="name"
            placeholder="Category name"
            required
            onChange={() => {
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
          />
          {errors.name ? <span className="text-xs text-destructive">{errors.name}</span> : null}
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Slug
          <input className="rounded border px-2 py-1" name="slug" placeholder="auto-generated" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Parent Group Slug
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
        <input type="hidden" name="groupSlug" value={effectiveGroupSlug} />
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Description
          <textarea className="rounded border px-2 py-1" name="description" placeholder="Optional description" rows={2} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Title (Page Title)
          <input className="rounded border px-2 py-1" name="title" placeholder="Page title (optional)" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Sort Order
          <input className="rounded border px-2 py-1" name="sortOrder" type="number" defaultValue={0} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Status
          <select className="rounded border px-2 py-1" name="status" defaultValue="active">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          SEO Description
          <textarea className="rounded border px-2 py-1" name="seoDescription" placeholder="SEO description (optional)" rows={2} maxLength={320} />
        </label>
        <div className="grid gap-1 text-sm font-medium md:col-span-2">
          Category Cover Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleCategoryImageChange}
          />
          {currentPreviewUrl ? (
            <div className="relative inline-block">
              <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-border">
                <img
                  src={currentPreviewUrl}
                  alt="Category cover"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !pendingCategoryId}
              className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {isUploading
                  ? "Uploading..."
                  : "UPLOAD CATEGORY COVER IMAGE (RECOMMENDED ASPECT RATIO 1:1)"}
              </span>
            </button>
          )}
          {!pendingCategoryId && (
            <span className="text-xs text-muted-foreground">
              Save the category first to enable image upload
            </span>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Filters</h2>
        <CategoryFilterBuilder filters={filters} onChange={setFilters} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
