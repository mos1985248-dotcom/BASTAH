export const PLATFORM_BRAND_NAME = "بسطة مارت";

// Presentation only, for platform-owned copy (plans and editorial articles).
// Do not apply this to merchant names, product names, identifiers or stored records.
export function formatPlatformCopy(text: string): string {
  return text.replace(/(^|[^\p{L}\p{N}_])(بسطة(?:\s+مارت)?)(?![\p{L}\p{N}_])/gu, (_match, prefix: string, word: string) =>
    prefix + (word === "بسطة" ? PLATFORM_BRAND_NAME : word)
  );
}

export function platformAuthorName(name: string | null | undefined): string {
  if (!name || name.trim() === "فريق بسطة") return `فريق ${PLATFORM_BRAND_NAME}`;
  return name;
}
