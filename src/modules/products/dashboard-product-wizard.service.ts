export type ProductOption = { id: string; name: string };

export function slugifyProductName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function fetchProductOptions(path: "categories" | "brands") {
  const response = await fetch(`/api/admin/${path}`, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload?.success) throw new Error(`Failed loading ${path}`);
  return (payload.data as ProductOption[]) ?? [];
}

export async function quickCreateBrand(name: string): Promise<ProductOption> {
  return quickCreateOption("brands", name);
}

export async function quickCreateCategory(name: string): Promise<ProductOption> {
  return quickCreateOption("categories", name);
}

async function quickCreateOption(path: "brands" | "categories", name: string): Promise<ProductOption> {
  const slug = slugifyProductName(name);
  const response = await fetch(`/api/admin/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), slug }),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.success) throw new Error(payload?.error?.message ?? `Failed to create ${path.slice(0, -1)}`);
  return payload.data as ProductOption;
}

export async function createWizardProduct(input: Record<string, unknown>) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.success) throw new Error(payload?.error?.message ?? "Failed to create product");
  return payload.data as { id: string };
}
