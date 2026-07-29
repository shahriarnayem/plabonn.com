import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { getPageBySlug } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("privacy");
  return buildMetadata(page || {}, { title: "Privacy Policy" });
}

export default async function PrivacyPage() {
  const page = await getPageBySlug("privacy");
  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <article className="relative overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(28px,6vw,72px)]">
        <h1 className="mb-8 text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          {page?.title || "Privacy Policy"}
        </h1>
        <BlocksRenderer blocks={page?.blocks || []} />
      </article>
    </PublicShell>
  );
}
