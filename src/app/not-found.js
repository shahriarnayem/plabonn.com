import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="relative flex min-h-[300px] flex-col items-start justify-center overflow-hidden rounded-[12px] bg-[var(--card)] p-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
          404
        </p>
        <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          This page could not be found.
        </h1>
        <p className="mt-3 text-sm text-[var(--text-soft)]">
          The link may be outdated or the content may have moved.
        </p>
        <Link
          className="mt-6 inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          href="/"
        >
          Back to homepage
          <Icon name="arrow" size={15} />
        </Link>
      </section>
    </PublicShell>
  );
}
