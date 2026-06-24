"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ColorChip = { label: string; hex: string };

type ColorInputProps = {
  chips: ColorChip[];
  onChange: (chips: ColorChip[]) => void;
};

export function ColorInput({ chips, onChange }: ColorInputProps) {
  const [label, setLabel] = useState("");
  const [hex, setHex] = useState("#000000");

  function addColor() {
    if (!label.trim()) return;
    const newChip: ColorChip = { label: label.trim(), hex };
    if (chips.some((c) => c.label === newChip.label && c.hex === newChip.hex)) return;
    onChange([...chips, newChip]);
    setLabel("");
    setHex("#000000");
  }

  function removeColor(index: number) {
    onChange(chips.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium font-ui">Color Name</label>
          <Input placeholder="e.g. Smoke Mint" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium font-ui">Hex</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-9 w-9 cursor-pointer rounded border border-input bg-transparent p-0.5"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
            />
            <Button type="button" size="sm" onClick={addColor}>Add</Button>
          </div>
        </div>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded bg-surface-light px-2 py-1 text-sm font-ui">
              <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: chip.hex }} />
              {chip.label}
              <span className="text-xs text-muted-foreground">{chip.hex}</span>
              <button type="button" onClick={() => removeColor(i)} className="text-muted-foreground hover:text-foreground ml-1">x</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}