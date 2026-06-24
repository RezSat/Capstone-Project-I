import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl font-semibold uppercase leading-tight text-[#191A1C]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#64748b]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function DashboardMetricCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "neutral" | "orange" | "green" | "red";
}) {
  const toneClass = {
    neutral: "border-[#e5e7eb] bg-white",
    orange: "border-[#fed7aa] bg-[#fff7ed]",
    green: "border-[#bbf7d0] bg-[#f0fdf4]",
    red: "border-[#fecaca] bg-[#fef2f2]",
  }[tone];
  return (
    <article className={cn("rounded-lg border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]", toneClass)}>
      <p className="font-ui text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold uppercase text-[#191A1C]">
        {value}
      </p>
      {helper ? <p className="mt-2 font-body text-xs text-[#64748b]">{helper}</p> : null}
    </article>
  );
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.035)]", className)}>
      {title || description ? (
        <div className="mb-5">
          {title ? (
            <h2 className="font-display text-xl font-semibold uppercase text-[#191A1C]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 font-body text-sm text-[#64748b]">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function dashboardInputClass(className?: string) {
  return cn(
    "h-10 rounded-md border border-[#d9d9d9] bg-white px-3 font-ui text-sm text-[#191A1C] outline-none transition focus:border-[#f97316] focus:ring-3 focus:ring-[#f97316]/15",
    className,
  );
}

export function dashboardButtonClass(className?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-md bg-[#f97316] px-4 font-ui text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-50",
    className,
  );
}
