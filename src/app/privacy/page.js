import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { getPageBySlug } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata(){ const page = await getPageBySlug("privacy"); return buildMetadata(page || {}, { title: "Privacy Policy" }); }
export default async function PrivacyPage(){ const page = await getPageBySlug("privacy"); return <PublicShell><Breadcrumbs items={[{label:"Privacy Policy"}]} /><article className="card legal-page"><h1>{page?.title || "Privacy Policy"}</h1><BlocksRenderer blocks={page?.blocks || []} /></article></PublicShell>; }
