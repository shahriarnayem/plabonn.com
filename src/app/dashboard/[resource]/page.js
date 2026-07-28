import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/dashboard/resource-manager";
import { dashboardRouteMap, getResourceConfig } from "@/lib/cms/config";

export default async function DashboardResourcePage({ params }) {
  const { resource: route } = await params;
  const resource = dashboardRouteMap[route];
  const config = getResourceConfig(resource);
  if (!resource || !config) notFound();
  return <ResourceManager resource={resource} config={config} />;
}
