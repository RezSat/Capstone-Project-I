"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdjustStockForm } from "./adjust-stock-form";
import { toast } from "sonner";

type AdjustStockButtonProps = {
  variantId: string;
  variantSku: string;
};

export function AdjustStockButton({ variantId, variantSku }: AdjustStockButtonProps) {
  const [open, setOpen] = useState(false);
  const [currentQty, setCurrentQty] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${variantId}`);
      const data = await res.json();
      if (data.success) {
        setCurrentQty(data.data?.quantityOnHand ?? 0);
      } else {
        setCurrentQty(0);
      }
    } catch {
      setCurrentQty(0);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  function handleComplete(newQty: number) {
    setCurrentQty(newQty);
    toast.success("Stock updated");
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleOpen}>
        Adjust
      </Button>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {variantSku}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="py-4 text-center text-muted-foreground">Loading...</p>
          ) : currentQty === null ? (
            <p className="py-4 text-center text-muted-foreground">Could not load inventory.</p>
          ) : (
            <AdjustStockForm
              variantId={variantId}
              variantSku={variantSku}
              currentQuantity={currentQty}
              onAdjustComplete={handleComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}