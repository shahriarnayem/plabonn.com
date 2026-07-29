import Link from "next/link";
import { Icon } from "@/components/icon";

export function Breadcrumbs({ items = [] }) {
  return (
    <nav
      className="m-[2px_2px_12px] flex flex-wrap items-center gap-2 text-xs text-[var(--text-faint)]"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <span className="inline-flex items-center gap-2" key={`${item.label}-${index}`}>
          <Icon name="chevron" size={13} />
          {item.href ? (
            <Link
              href={item.href}
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
