import type { AnchorHTMLAttributes } from "react";
import { siteBasePath } from "@/lib/base-path";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function SiteLink({ href, ...props }: SiteLinkProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || siteBasePath;
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
