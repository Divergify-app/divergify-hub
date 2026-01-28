import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Divergify",
  description: "Divergify. For brains that zig when the world zags.",
  themeColor: "#232147",
  openGraph: {
    title: "Divergify",
    description: "Neurodivergent-friendly productivity.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#232147",
          color: "#F9EED2",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <nav
          style={{
            background: "#CDA977",
            padding: "1rem",
            fontWeight: "bold",
            color: "#232147",
          }}
        >
          Divergify Nav
        </nav>
        <main style={{ minHeight: "100vh" }}>{children}</main>
      </body>
    </html>
  );
}
