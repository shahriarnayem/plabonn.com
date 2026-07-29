import Link from "next/link";
import { Icon } from "@/components/icon";

export function BlocksRenderer({ blocks = [] }) {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className="max-w-[820px] space-y-5 text-sm text-[var(--text-soft)]">
      {blocks.map((block, index) => {
        const data = block?.data || {};
        const key = block.id || `${block.type}-${index}`;

        switch (block.type) {
          case "heading": {
            const level = Math.min(4, Math.max(2, Number(data.level) || 2));
            const Heading = `h${level}`;
            return (
              <Heading
                key={key}
                className="pt-4 text-[clamp(20px,2.5vw,32px)] font-bold leading-[1.16] tracking-[-0.03em] text-[var(--text)]"
              >
                {data.text}
              </Heading>
            );
          }
          case "paragraph":
            return (
              <p key={key} className="leading-[1.75]">
                {data.text}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="m-0 rounded-[8px] bg-[var(--card-soft)] px-5 py-[18px] leading-[1.7] text-[var(--text)]"
              >
                {data.text}
                {data.cite ? (
                  <cite className="mt-2 block text-xs text-[var(--text-faint)]">
                    {data.cite}
                  </cite>
                ) : null}
              </blockquote>
            );
          case "list": {
            const items = Array.isArray(data.items)
              ? data.items
              : String(data.items || "")
                  .split("\n")
                  .filter(Boolean);
            const List = data.ordered ? "ol" : "ul";
            return (
              <List
                key={key}
                className={`${data.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6`}
              >
                {items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`}>{item}</li>
                ))}
              </List>
            );
          }
          case "image":
            return (
              <figure key={key}>
                <img
                  className="w-full rounded-lg object-cover"
                  src={data.url}
                  alt={data.alt || ""}
                  width={data.width || 1200}
                  height={data.height || 800}
                  loading="lazy"
                />
                {data.caption ? (
                  <figcaption className="mt-2 text-xs text-[var(--text-faint)]">
                    {data.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "button":
            return (
              <p key={key}>
                <Link
                  href={data.url || "#"}
                  className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {data.text || "Learn more"}
                  <Icon name="arrow" size={15} />
                </Link>
              </p>
            );
          case "code":
            return (
              <pre
                key={key}
                className="overflow-auto rounded-lg bg-[#212529] p-5 text-xs leading-[1.7] text-[#f8f9fa]"
              >
                <code>{data.code}</code>
              </pre>
            );
          case "stats":
            return (
              <div key={key} className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {(data.items || []).map((item, itemIndex) => (
                  <div
                    className="rounded-lg bg-[var(--card-soft)] p-5"
                    key={`${item.label}-${itemIndex}`}
                  >
                    <strong className="block text-2xl text-[var(--text)]">
                      {item.value}
                    </strong>
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            );
          case "twoColumn":
            return (
              <div key={key} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-lg font-bold text-[var(--text)]">
                    {data.leftTitle}
                  </h3>
                  <p className="leading-[1.75]">{data.leftText}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-[var(--text)]">
                    {data.rightTitle}
                  </h3>
                  <p className="leading-[1.75]">{data.rightText}</p>
                </div>
              </div>
            );
          case "gallery":
            return (
              <div key={key} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {(data.images || []).map((image, imageIndex) => (
                  <img
                    className="h-[260px] w-full rounded-lg object-cover"
                    key={`${image}-${imageIndex}`}
                    src={image}
                    alt=""
                    width="800"
                    height="600"
                    loading="lazy"
                  />
                ))}
              </div>
            );
          case "cta":
            return (
              <aside
                key={key}
                className="grid grid-cols-1 items-center gap-6 rounded-[10px] bg-[var(--accent)] p-[26px] text-white sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <h2 className="text-[clamp(20px,2.5vw,32px)] font-bold leading-[1.16] tracking-[-0.03em]">
                    {data.heading}
                  </h2>
                  <p className="mt-2 text-white/80">{data.text}</p>
                </div>
                <Link
                  className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-[#9a000f] transition-colors duration-150 hover:bg-[#e9ecef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href={data.buttonUrl || "/contact"}
                >
                  {data.buttonText || "Contact me"}
                  <Icon name="arrow" size={15} />
                </Link>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
