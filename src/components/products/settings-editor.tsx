"use client";

type ProductFormState = {
  visibility: "public" | "private";
  isFeatured: boolean;
  promoLabel: "none" | "new_arrival" | "best_seller";
};

type SettingsEditorProps = {
  visibility: ProductFormState["visibility"];
  isFeatured: boolean;
  promoLabel: ProductFormState["promoLabel"];
  onVisibilityChange: (v: ProductFormState["visibility"]) => void;
  onFeaturedChange: (f: boolean) => void;
  onPromoChange: (p: ProductFormState["promoLabel"]) => void;
};

export function SettingsEditor({ visibility, isFeatured, promoLabel, onVisibilityChange, onFeaturedChange, onPromoChange }: SettingsEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-ui" htmlFor="product-visibility">Visibility</label>
        <select id="product-visibility" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={visibility} onChange={(e) => onVisibilityChange(e.target.value as ProductFormState["visibility"])}>
          <option value="public">Public</option><option value="private">Private</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-ui" htmlFor="product-featured">Featured Status</label>
        <select id="product-featured" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={isFeatured ? "featured" : "normal"} onChange={(e) => onFeaturedChange(e.target.value === "featured")}>
          <option value="normal">Normal</option><option value="featured">Featured</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-ui" htmlFor="product-promo">Promo Label</label>
        <select
          id="product-promo"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={promoLabel}
          onChange={(e) => onPromoChange(e.target.value as ProductFormState["promoLabel"])}
        >
          <option value="none">No Label</option>
          <option value="new_arrival">New Arrival</option>
          <option value="best_seller">Best Seller</option>
        </select>
      </div>
    </div>
  );
}