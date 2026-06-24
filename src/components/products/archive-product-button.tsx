"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ArchiveProductButton({ productId, productName, currentStatus }: { productId: string; productName: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentStatus === "archived") return null;

  async function handleArchive() {
    if (!confirm(`Are you sure you want to archive "${productName}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive");
      toast.success("Product archived");
      router.refresh();
    } catch {
      toast.error("Could not archive product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleArchive} disabled={loading}>
      {loading ? "Archiving..." : "Archive"}
    </Button>
  );
}