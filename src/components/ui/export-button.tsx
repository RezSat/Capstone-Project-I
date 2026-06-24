"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadCSV, convertToCSV } from "@/core/utils/csv-export";

export type ExportColumn<T> = {
  key: keyof T;
  header: string;
};

type ExportButtonProps<T> = {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  disabled?: boolean;
};

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  disabled = false,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (data.length === 0) return;

    setIsExporting(true);
    try {
      const csv = convertToCSV(data, columns);
      downloadCSV(csv, `${filename}.csv`);
      toast.success(`Exported ${data.length} rows to ${filename}.csv`);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
      type="button"
    >
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}