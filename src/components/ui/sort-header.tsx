"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortOption = {
  field: string;
  label: string;
};

type SortHeaderProps = {
  field: string;
  children: React.ReactNode;
  paramName?: string;
};

export function SortHeader({ field, children, paramName = "sort" }: SortHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get(paramName) ?? "";
  const currentDir = currentSort.startsWith("-") ? currentSort.slice(1) : currentSort;
  const isCurrentField = currentDir === field;
  const direction = isCurrentField && currentSort.startsWith("-") ? "desc" : "asc";

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    if (isCurrentField && !currentSort.startsWith("-")) {
      params.set(paramName, `-${field}`);
    } else {
      params.set(paramName, field);
    }
    router.replace(`?${params.toString()}`);
  }

  return (
    <TableHead
      className={cn("cursor-pointer hover:bg-muted/50 select-none", isCurrentField && "text-foreground")}
      onClick={handleClick}
      aria-sort={isCurrentField ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className="flex items-center gap-1">
        {children}
        {isCurrentField && (
          <span className="text-xs">{direction === "asc" ? "↑" : "↓"}</span>
        )}
      </span>
    </TableHead>
  );
}