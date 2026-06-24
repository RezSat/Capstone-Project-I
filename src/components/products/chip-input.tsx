"use client";

import { useState, KeyboardEvent } from "react";

type ChipInputProps = {
  label: string;
  placeholder: string;
  chips: string[];
  onChange: (chips: string[]) => void;
};

export function ChipInput({ label, placeholder, chips, onChange }: ChipInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!chips.includes(input.trim())) {
        onChange([...chips, input.trim()]);
      }
      setInput("");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium font-ui">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-9 items-center rounded-md border border-input bg-transparent px-3 py-2">
        {chips.map((chip) => (
          <span key={chip} className="inline-flex items-center gap-1 rounded bg-surface-light px-2 py-0.5 text-sm font-ui">
            {chip}
            <button type="button" onClick={() => onChange(chips.filter((c) => c !== chip))} className="text-muted-foreground hover:text-foreground">x</button>
          </span>
        ))}
        <input
          className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={chips.length === 0 ? placeholder : ""}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  );
}