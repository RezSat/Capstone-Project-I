"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
};

export function SearchInput({
  placeholder = "Search...",
  defaultValue = "",
  debounceMs = 300,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      router.replace(`?${params.toString()}`);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, router, searchParams]);

  const hasSearch = searchParams.has("search");

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="max-w-xs"
      />
      {hasSearch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("search");
            router.replace(`?${params.toString()}`);
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
}