"use client";

import { useState } from "react";
import { toast } from "sonner";

export type FilterOptionRow = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
};

export type FilterRow = {
  id: string;
  label: string;
  slug: string;
  sourceKey: string | null;
  sortOrder: number;
  isActive: boolean;
  options: FilterOptionRow[];
};

type Props = {
  categoryId: string;
  filters: FilterRow[];
  onUpdate: (filters: FilterRow[]) => void;
};

export function CategoryFilterEditor({ categoryId, filters, onUpdate }: Props) {
  const [addingOptionTo, setAddingOptionTo] = useState<string | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [addingFilter, setAddingFilter] = useState(false);
  const [newFilterLabel, setNewFilterLabel] = useState("");
  const [newFilterSourceKey, setNewFilterSourceKey] = useState("");

  async function addFilter() {
    if (!newFilterLabel.trim()) return;
    const slug = newFilterLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const res = await fetch(`/api/admin/categories/${categoryId}/filters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newFilterLabel.trim(), slug, sourceKey: newFilterSourceKey.trim() || null }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data?.error?.message ?? "Failed to add filter"); return; }
    const f = data.data;
    setNewFilterLabel("");
    setNewFilterSourceKey("");
    setAddingFilter(false);
    onUpdate([...filters, { id: f.id, label: f.label, slug: f.slug, sourceKey: f.sourceKey ?? null, sortOrder: f.sortOrder ?? 0, isActive: f.isActive ?? true, options: [] }]);
  }

  async function updateFilterLabel(filterId: string, label: string) {
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) { toast.error("Failed to update filter label"); return; }
    onUpdate(filters.map((f) => (f.id === filterId ? { ...f, label } : f)));
  }

  async function updateFilterSourceKey(filterId: string, sourceKey: string) {
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceKey: sourceKey || null }),
    });
    if (!res.ok) { toast.error("Failed to update source key"); return; }
    onUpdate(filters.map((f) => (f.id === filterId ? { ...f, sourceKey: sourceKey || null } : f)));
  }

  async function toggleFilterActive(filterId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) { toast.error("Failed to toggle filter"); return; }
    onUpdate(filters.map((f) => (f.id === filterId ? { ...f, isActive } : f)));
  }

  async function deleteFilter(filterId: string) {
    if (!confirm("Delete this filter?")) return;
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete filter"); return; }
    onUpdate(filters.filter((f) => f.id !== filterId));
  }

  async function addOption(filterId: string) {
    if (!newOptionLabel.trim()) return;
    const value = newOptionLabel.trim().toLowerCase().replace(/\s+/g, "-");
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newOptionLabel.trim(), value }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data?.error?.message ?? "Failed to add option"); return; }
    setNewOptionLabel("");
    setAddingOptionTo(null);
    onUpdate(filters.map((f) => (f.id === filterId ? { ...f, options: [...f.options, data.data] } : f)));
  }

  async function updateOptionLabel(filterId: string, optionId: string, label: string) {
    const value = label.toLowerCase().replace(/\s+/g, "-");
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}/options/${optionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, value }),
    });
    if (!res.ok) { toast.error("Failed to update option"); return; }
    onUpdate(filters.map((f) => {
      if (f.id !== filterId) return f;
      return { ...f, options: f.options.map((o) => (o.id === optionId ? { ...o, label, value } : o)) };
    }));
  }

  async function toggleOptionActive(filterId: string, optionId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}/options/${optionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) { toast.error("Failed to toggle option"); return; }
    onUpdate(filters.map((f) => {
      if (f.id !== filterId) return f;
      return { ...f, options: f.options.map((o) => (o.id === optionId ? { ...o, isActive } : o)) };
    }));
  }

  async function deleteOption(filterId: string, optionId: string) {
    if (!confirm("Delete this option?")) return;
    const res = await fetch(`/api/admin/categories/${categoryId}/filters/${filterId}/options/${optionId}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete option"); return; }
    onUpdate(filters.map((f) => {
      if (f.id !== filterId) return f;
      return { ...f, options: f.options.filter((o) => o.id !== optionId) };
    }));
  }

  return (
    <div className="flex flex-col gap-3">
      {filters.map((filter) => (
        <div key={filter.id} className={`rounded border border-border bg-card p-3 ${!filter.isActive ? "opacity-60" : ""}`}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input className="rounded border px-2 py-0.5 text-sm font-medium" defaultValue={filter.label} onBlur={(e) => updateFilterLabel(filter.id, e.target.value)} />
              <span className="text-xs text-muted-foreground">{filter.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => toggleFilterActive(filter.id, !filter.isActive)}>{filter.isActive ? "Deactivate" : "Activate"}</button>
              <button type="button" className="text-xs text-destructive hover:underline" onClick={() => deleteFilter(filter.id)}>Delete</button>
            </div>
          </div>
          <div className="mb-2">
            <input
              className="w-full rounded border px-2 py-0.5 text-xs"
              placeholder="Source key (e.g., Performance) - matches accordion bullet key"
              defaultValue={filter.sourceKey ?? ""}
              onBlur={(e) => updateFilterSourceKey(filter.id, e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            {filter.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input className="flex-1 rounded border px-2 py-0.5 text-sm" defaultValue={opt.label} onBlur={(e) => updateOptionLabel(filter.id, opt.id, e.target.value)} />
                <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => toggleOptionActive(filter.id, opt.id, !opt.isActive)}>{opt.isActive ? "Deactivate" : "Activate"}</button>
                <button type="button" className="text-xs text-destructive hover:underline" onClick={() => deleteOption(filter.id, opt.id)}>x</button>
              </div>
            ))}
            {addingOptionTo === filter.id ? (
              <div className="flex items-center gap-1">
                <input className="flex-1 rounded border px-2 py-0.5 text-sm" placeholder="Option label" value={newOptionLabel} onChange={(e) => setNewOptionLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(filter.id); } }} />
                <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => addOption(filter.id)}>Add</button>
                <button type="button" className="text-xs hover:underline" onClick={() => { setAddingOptionTo(null); setNewOptionLabel(""); }}>Cancel</button>
              </div>
            ) : (
              <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => setAddingOptionTo(filter.id)}>+ Add Option</button>
            )}
          </div>
        </div>
      ))}
      {addingFilter ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <input className="flex-1 rounded border px-2 py-1 text-sm" placeholder="Filter label (e.g., FEATURE)" value={newFilterLabel} onChange={(e) => setNewFilterLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFilter(); } }} />
            <button type="button" className="text-xs text-blue-600 hover:underline" onClick={addFilter}>Add</button>
            <button type="button" className="text-xs hover:underline" onClick={() => { setAddingFilter(false); setNewFilterLabel(""); setNewFilterSourceKey(""); }}>Cancel</button>
          </div>
          <input className="rounded border px-2 py-1 text-xs" placeholder="Source key (e.g., Performance) - matches accordion bullet key" value={newFilterSourceKey} onChange={(e) => setNewFilterSourceKey(e.target.value)} />
        </div>
      ) : (
        <button type="button" className="rounded border px-3 py-1.5 text-sm hover:bg-accent" onClick={() => setAddingFilter(true)}>+ Add Filter</button>
      )}
    </div>
  );
}