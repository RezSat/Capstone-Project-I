type EmptyStateProps = {
  message?: string;
};

export function EmptyState({ message = "No items found." }: EmptyStateProps) {
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </section>
  );
}