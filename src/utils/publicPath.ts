const PUBLIC_PATH = "/tools/discover";

export const getRouterBasename = (
  pathname = typeof window === "undefined" ? "/" : window.location.pathname,
) =>
  pathname === PUBLIC_PATH || pathname.startsWith(`${PUBLIC_PATH}/`)
    ? PUBLIC_PATH
    : "/";

export const getCheckoutSiteUrl = () => {
  if (typeof window === "undefined") return "";

  const basename = getRouterBasename();
  return `${window.location.origin}${basename === "/" ? "" : basename}`;
};
