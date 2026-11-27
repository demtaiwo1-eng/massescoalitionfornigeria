import NextLink from "next/link";
import type { ComponentProps } from "react";
import { siteBasePath } from "@/lib/base-path";

type SiteLinkProps = ComponentProps<typeof NextLink>;

export default function SiteLink({ href, ...props }: SiteLinkProps) {
  const basePath = siteBasePath;
  const safeHref =
    typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    basePath &&
    href !== basePath &&
    !href.startsWith(basePath + "/")
      ? basePath + href
      : href;

  return <NextLink href={safeHref} {...props} />;
}
