"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export type PaginationProps = {
  totalPages: number;
  currentPage: number;
  paramName?: string;
};

export function Pagination({ totalPages, currentPage, paramName = "page" }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete(paramName);
    } else {
      params.set(paramName, String(page));
    }
    router.replace(`?${params.toString()}`);
  }

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => setPage(currentPage - 1)}
      >
        Previous
      </Button>
      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPage(page)}
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}