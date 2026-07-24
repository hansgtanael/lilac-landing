/**
 * Studio route layout. The embedded Studio owns its own full-viewport chrome,
 * so this segment layout is a minimal passthrough that keeps the Studio out of
 * the marketing page's concerns.
 */
export const metadata = {
  title: "Studio · Lilac Landing",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
