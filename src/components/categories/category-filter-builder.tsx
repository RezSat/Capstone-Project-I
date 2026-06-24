"use client";

export type CategoryFilterDraft = {
  label: string;
  slug: string;
  sourceKey: string;
  options: Array<{ label: string; value: string }>;
};

type Props = {
  filters: CategoryFilterDraft[];
  onChange: (filters: CategoryFilterDraft[]) => void;
};

export function CategoryFilterBuilder({ filters, onChange }: Props) {
  function addFilter() {
    onChange([...filters, { label: "", slug: "", sourceKey: "", options: [] }]);
  }

  function removeFilter(index: number) {
    onChange(filters.filter((_, i) => i !== index));
  }

  function updateFilter(index: number, updates: Partial<CategoryFilterDraft>) {
    onChange(filters.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }

  function addOption(filterIndex: number) {
    const filter = filters[filterIndex];
    if (!filter) return;
    updateFilter(filterIndex, { options: [...filter.options, { label: "", value: "" }] });
  }

  function removeOption(filterIndex: number, optionIndex: number) {
    const filter = filters[filterIndex];
    if (!filter) return;
    updateFilter(filterIndex, { options: filter.options.filter((_, i) => i !== optionIndex) });
  }

  function updateOption(filterIndex: number, optionIndex: number, updates: { label?: string; value?: string }) {
    const filter = filters[filterIndex];
    if (!filter) return;
    updateFilter(filterIndex, {
      options: filter.options.map((o, i) => (i === optionIndex ? { ...o, ...updates } : o)),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {filters.map((filter, filterIndex) => (
        <div key={filterIndex} className="rounded border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Filter {filterIndex + 1}</span>
            <button
              type="button"
              className="text-xs text-destructive hover:underline"
              onClick={() => removeFilter(filterIndex)}
            >
              Remove Filter
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="rounded border px-2 py-1 text-sm"
              placeholder="Filter label (e.g., FEATURE)"
              value={filter.label}
              onChange={(e) => {
                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                updateFilter(filterIndex, { label: e.target.value, slug });
              }}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              placeholder="slug"
              value={filter.slug}
              onChange={(e) => updateFilter(filterIndex, { slug: e.target.value })}
            />
          </div>
          <div className="mt-2">
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              placeholder="Source key (e.g., Performance) - matches accordion bullet key"
              value={filter.sourceKey}
              onChange={(e) => updateFilter(filterIndex, { sourceKey: e.target.value })}
            />
          </div>
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Options</span>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() => addOption(filterIndex)}
              >
                + Add Option
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {filter.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-1">
                  <input
                    className="flex-1 rounded border px-2 py-0.5 text-sm"
                    placeholder="Option label"
                    value={option.label}
                    onChange={(e) => updateOption(filterIndex, optionIndex, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  />
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => removeOption(filterIndex, optionIndex)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="rounded border px-3 py-1.5 text-sm hover:bg-accent"
        onClick={addFilter}
      >
        + Add Filter
      </button>
    </div>
  );
}