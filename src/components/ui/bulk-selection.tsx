"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type BulkAction = {
  id: string;
  label: string;
  variant?: "default" | "outline" | "destructive";
  requiresConfirmation?: boolean;
  onAction: (selectedIds: string[]) => void | Promise<void>;
};

export type BulkSelectionState = {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  toggle: (id: string) => void;
  toggleAll: (allIds: string[]) => void;
  clear: () => void;
  count: number;
};

export function useBulkSelection(): BulkSelectionState {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (allIds: string[]) => {
    setSelectedIds((prev) => {
      if (prev.size === allIds.length && allIds.length > 0) {
        return new Set();
      }
      return new Set(allIds);
    });
  };

  const clear = () => setSelectedIds(new Set());

  return {
    selectedIds,
    isAllSelected: false,
    toggle,
    toggleAll,
    clear,
    count: selectedIds.size,
  };
}

type BulkActionsBarProps = {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
  allIds: string[];
  onSelectAll: (ids: string[]) => void;
  allSelected: boolean;
};

export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
  allIds,
  onSelectAll,
  allSelected,
}: BulkActionsBarProps) {
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  async function handleAction(action: BulkAction) {
    if (action.requiresConfirmation) {
      if (confirmingAction === action.id) {
        await action.onAction(Array.from(allIds.filter(() => selectedCount > 0 || allSelected)));
        setConfirmingAction(null);
        onClear();
      } else {
        setConfirmingAction(action.id);
        setTimeout(() => setConfirmingAction(null), 3000);
      }
    } else {
      await action.onAction(Array.from(allIds.filter(() => selectedCount > 0 || allSelected)));
      onClear();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (allSelected ? onClear() : onSelectAll(allIds))}
      >
        {allSelected ? "Clear selection" : `Select all (${allIds.length})`}
      </Button>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={confirmingAction === action.id ? "destructive" : action.variant ?? "outline"}
          size="sm"
          onClick={() => handleAction(action)}
        >
          {confirmingAction === action.id ? `Confirm ${action.label}` : action.label}
        </Button>
      ))}
    </div>
  );
}