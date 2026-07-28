import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <PublicShell><section className="card not-found-card"><p className="eyebrow">404</p><h1>This page could not be found.</h1><p>The link may be outdated or the content may have moved.</p><Link className="button button-primary" href="/">Back to homepage<Icon name="arrow" size={15}/></Link></section></PublicShell>;
}
