type ErrorStateProps = {
  message?: string;
};

export function ErrorState({ message = "Data is temporarily unavailable." }: ErrorStateProps) {
  return (
    <section className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
      <p className="text-sm font-medium">Error</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </section>
  );
}