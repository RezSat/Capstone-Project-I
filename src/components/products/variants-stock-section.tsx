"use client";

import { ChipInput } from "./chip-input";
import { ColorInput, type ColorChip } from "./color-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VariantMatrixRow = { id: string; combination: string; sku: string; priceOverride: number; initialStock: number };

type VariantsStockSectionProps = {
  sizeLabel: string;
  sizes: string[];
  colors: ColorChip[];
  variantRows: VariantMatrixRow[];
  onSizeLabelChange: (v: string) => void;
  onSizesChange: (sizes: string[]) => void;
  onColorsChange: (colors: ColorChip[]) => void;
  onStocksClick: () => void;
};

export function VariantsStockSection({ sizeLabel, sizes, colors, variantRows, onSizeLabelChange, onSizesChange, onColorsChange, onStocksClick }: VariantsStockSectionProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide mb-4">Variants & Stock</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium font-ui">Variant Type Name</label>
                <Input placeholder="e.g., Weight & Grip Size" value={sizeLabel} onChange={(e) => onSizeLabelChange(e.target.value)} />
              </div>
              <ChipInput label="Option Values" placeholder="e.g. 4UG5, 4UG6" chips={sizes} onChange={onSizesChange} />
            </div>
          </div>
          <Button type="button" size="sm" className="bg-status-success hover:bg-status-success/80 text-white" onClick={onStocksClick}>Stocks</Button>
        </div>
        <ColorInput chips={colors} onChange={onColorsChange} />
        {variantRows.length > 0 && <div className="mt-2 text-sm text-muted-foreground">{variantRows.length} variant(s) configured</div>}
      </div>
    </section>
  );
}

type DescriptionSectionProps = {
  value: string;
  onChange: (v: string) => void;
};

export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide mb-4">Description</h2>
      <textarea className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" placeholder="Enter product description" value={value} onChange={(e) => onChange(e.target.value)} />
    </section>
  );
}