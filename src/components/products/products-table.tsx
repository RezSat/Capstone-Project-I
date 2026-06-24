"use client";

import Image from "next/image";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  status: string;
  basePriceMinor: number;
  thumbnailUrl: string | null;
};

type Props = {
  items: ProductRow[];
  canManage: boolean;
  onArchive: (id: string) => void;
};

function formatLKRPrice(minor: number): string {
  const rupees = minor / 100;
  return `Rs. ${rupees.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function resolveImageSrc(src: string | null): string {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  active: { label: "Active", variant: "default" as const },
  archived: { label: "Archived", variant: "outline" as const },
};

export function ProductsTable({ items, canManage, onArchive }: Props) {
  return (
    <section className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
      <table className="w-full text-left font-ui text-sm">
        <thead className="border-b border-[#e5e7eb] bg-[#f8fafc]">
          <tr>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">Product</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">Category</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">Status</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#64748b]">Price</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#64748b]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.draft;
            const resolvedSrc = resolveImageSrc(item.thumbnailUrl);
            return (
              <tr key={item.id} className="border-b border-[#eef2f7] last:border-b-0 hover:bg-[#fff7ed]/45">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {resolvedSrc ? (
                      <Image src={resolvedSrc} alt={item.name} width={44} height={44} className="h-11 w-11 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-md bg-[#f1f5f9]" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#191A1C]">{item.name}</p>
                      <p className="truncate text-xs text-[#64748b]">{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#64748b]">{item.category ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge className={badgeVariants({ variant: status.variant })}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-[#191A1C]">{formatLKRPrice(item.basePriceMinor)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/dashboard/products/${item.id}/edit`} className="rounded-md border border-[#d9d9d9] px-2.5 py-1.5 text-xs font-bold uppercase hover:border-[#f97316] hover:bg-[#fff7ed]">
                      Edit
                    </a>
                    {canManage && item.status !== "archived" && (
                      <Button size="sm" variant="ghost" onClick={() => onArchive(item.id)} type="button">
                        Archive
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
