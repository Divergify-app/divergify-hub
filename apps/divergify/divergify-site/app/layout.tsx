import Link from "next/link";

export const metadata = {
  title: "Divergify | For brains that zig when the world zags.",
  description:
    "A home base for neurodivergent people: Field Notes, Divergipedia, community, and the build in progress."
};

const navLinkStyle = {
  color: "#f5f5f4",
  textDecoration: "none",
  fontSize: "0.95rem",
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background:
            "radial-gradient(circle at top left, rgba(226, 196, 131, 0.14), transparent 28%), linear-gradient(180deg, #090d1f 0%, #050712 100%)",
          color: "#fbf1da",
          fontFamily: '"Avenir Next", "Avenir", "Trebuchet MS", "Gill Sans", "Tahoma", sans-serif',
        }}
      >
        <header style={{ borderBottom: "1px solid rgba(251, 241, 218, 0.12)" }}>
          <nav
            style={{
              maxWidth: 1040,
              margin: "0 auto",
              padding: "1rem",
              display: "grid",
              gap: "0.8rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "#fbf1da",
                  textDecoration: "none",
                }}
              >
                <img
                  src="/favicon.png"
                  alt="Divergify logo"
                  width={36}
                  height={36}
                  style={{ borderRadius: 10 }}
                />
                <span
                  style={{
                    fontFamily: '"Trebuchet MS", "Avenir Next", "Gill Sans", "Tahoma", sans-serif',
                    fontWeight: 900,
                    fontSize: "1.8rem",
                    letterSpacing: "-0.08em",
                    lineHeight: 0.9,
                  }}
                >
                  Divergify
                </span>
              </Link>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/blog" style={navLinkStyle}>
                  Field Notes
                </Link>
                <Link href="/community" style={navLinkStyle}>
                  Community
                </Link>
                <Link href="/divergipedia" style={navLinkStyle}>
                  Divergipedia
                </Link>
                <Link href="/store" style={navLinkStyle}>
                  Dopamine Depot
                </Link>
                <Link href="/support" style={navLinkStyle}>
                  Tip Jar
                </Link>
                <Link href="/newsletter" style={navLinkStyle}>
                  What&apos;s Next
                </Link>
              </div>
            </div>

            <p style={{ color: "#b9c0d5", fontSize: "0.92rem", margin: 0 }}>
              For brains that zig when the world zags.
            </p>
          </nav>
        </header>

        <main style={{ maxWidth: 1040, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
          {children}
        </main>

        <footer style={{ borderTop: "1px solid rgba(251, 241, 218, 0.12)" }}>
          <div
            style={{
              maxWidth: 1040,
              margin: "0 auto",
              padding: "1rem",
              color: "#b9c0d5",
              fontSize: "0.85rem",
            }}
          >
            © {new Date().getFullYear()} Divergify
          </div>
        </footer>
      </body>
    </html>
  );
}
