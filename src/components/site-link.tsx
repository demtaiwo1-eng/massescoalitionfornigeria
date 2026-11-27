import NextLink from "next/link";
import type { ComponentProps } from "react";

type SiteLinkProps = ComponentProps<typeof NextLink>;

export default function SiteLink({ href, ...props }: SiteLinkProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
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
