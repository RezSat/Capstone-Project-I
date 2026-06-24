"use client";

import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustStock } from "@/modules/inventory/dashboard-inventory-adjust.service";
import { getErrorMessage } from "@/core/utils/error";

type AdjustStockFormProps = {
  variantId: string;
  variantSku: string;
  currentQuantity: number;
  priceMinor?: number;
  compareAtPriceMinor?: number | null;
  onAdjustComplete: (newQuantity: number, updatedPriceMinor?: number, updatedCompareAtPriceMinor?: number | null) => void;
};

export function AdjustStockForm({
  variantId,
  variantSku,
  currentQuantity,
  priceMinor = 0,
  compareAtPriceMinor = null,
  onAdjustComplete,
}: AdjustStockFormProps) {
  const submissionLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ type?: string; quantity?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const type = formData.get("type") as "in" | "out" | "adjustment";
    const quantityStr = formData.get("quantity") as string;
    const quantity = parseInt(quantityStr, 10);
    const note = formData.get("note") as string;
    const priceInput = formData.get("priceInput") as string;
    const compareAtPriceInput = formData.get("compareAtPriceInput") as string;

    let newQuantity = currentQuantity;
    if (type === "in") {
      newQuantity = currentQuantity + quantity;
    } else if (type === "out") {
      newQuantity = currentQuantity - quantity;
    } else {
      newQuantity = quantity;
    }

    const result = await adjustStock({
      variantId,
      type,
      quantity: isNaN(quantity) ? 0 : quantity,
      note: note || undefined,
    });

    if (!result.success) {
      toast.error(getErrorMessage(result.error));
      setErrors({ quantity: getErrorMessage(result.error) });
      submissionLockRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const priceMinorValue = priceInput ? Math.round(parseFloat(priceInput) * 100) : null;
    const compareAtPriceMinorValue = compareAtPriceInput ? Math.round(parseFloat(compareAtPriceInput) * 100) : null;

    if (priceMinorValue !== null || compareAtPriceMinorValue !== null) {
      try {
        const putResponse = await fetch("/api/admin/inventory/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantId,
            quantityOnHand: newQuantity,
            priceMinor: priceMinorValue,
            compareAtPriceMinor: compareAtPriceMinorValue,
          }),
        });
        const putResult = await putResponse.json();
        if (!putResponse.ok) {
          toast.error("Price update failed: " + (putResult.message || "Unknown error"));
          submissionLockRef.current = false;
          setIsSubmitting(false);
          return;
        }
      } catch {
        toast.error("Failed to update price");
        submissionLockRef.current = false;
        setIsSubmitting(false);
        return;
      }
    }

    toast.success("Stock adjusted and price updated successfully");
    onAdjustComplete(newQuantity, priceMinorValue ?? undefined, compareAtPriceMinorValue ?? undefined);
    formRef.current?.reset();
    submissionLockRef.current = false;
    setIsSubmitting(false);
  }

  return (
    <form ref={formRef} aria-busy={isSubmitting} className="grid gap-3" noValidate onSubmit={handleSubmit}>
      <p className="text-sm text-muted-foreground">
        Current quantity: {currentQuantity} — SKU: {variantSku}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium" htmlFor="type">
          Adjustment Type
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            disabled={isSubmitting}
            id="type"
            name="type"
          >
            <option value="in">Stock In (+)</option>
            <option value="out">Stock Out (-)</option>
            <option value="adjustment">Set Quantity (=)</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium" htmlFor="quantity">
          Quantity
          <Input
            aria-invalid={Boolean(errors.quantity)}
            disabled={isSubmitting}
            id="quantity"
            name="quantity"
            placeholder="0"
            type="number"
          />
          {errors.quantity ? <span className="text-xs text-destructive">{errors.quantity}</span> : null}
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium" htmlFor="priceInput">
          Price (LKR)
          <Input
            disabled={isSubmitting}
            id="priceInput"
            name="priceInput"
            placeholder={`${(priceMinor / 100).toFixed(2)}`}
            type="number"
            step="0.01"
          />
          <span className="text-xs text-muted-foreground">Leave blank to keep existing price</span>
        </label>
        <label className="grid gap-1 text-sm font-medium" htmlFor="compareAtPriceInput">
          Compare-At Price (LKR)
          <Input
            disabled={isSubmitting}
            id="compareAtPriceInput"
            name="compareAtPriceInput"
            placeholder={compareAtPriceMinor !== null ? `${(compareAtPriceMinor / 100).toFixed(2)}` : ""}
            type="number"
            step="0.01"
          />
          <span className="text-xs text-muted-foreground">Leave blank to clear compare-at price</span>
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium" htmlFor="note">
        Note (optional)
        <Input disabled={isSubmitting} id="note" name="note" placeholder="Reason for adjustment" />
      </label>
      <Button className="w-fit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Adjusting..." : "Adjust Stock"}
      </Button>
    </form>
  );
}