import type { AnchorHTMLAttributes } from "react";
import { siteBasePath } from "@/lib/base-path";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

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

  return <a href={safeHref} {...props} />;
}
