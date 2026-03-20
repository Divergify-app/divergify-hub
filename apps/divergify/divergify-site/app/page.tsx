import Link from "next/link";

const cardStyle = {
  border: "1px solid #27272a",
  borderRadius: "1rem",
  padding: "1.25rem",
  background: "rgba(24, 24, 27, 0.75)",
} as const;

const mutedTextStyle = {
  color: "#a1a1aa",
  lineHeight: 1.6,
} as const;

export default function HomePage() {
  return (
    <main style={{ display: "grid", gap: "2rem" }}>
      <section
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", lineHeight: 1, margin: 0 }}>
            Divergify
          </h1>
          <p style={{ ...mutedTextStyle, fontSize: "1.1rem", margin: 0 }}>
            For brains that zig when the world zags.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            Not another productivity app that grades you for having a human nervous
            system.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            Divergify is a home base for neurodivergent people dealing with overload,
            working-memory drag, and systems still built for factory settings.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            One live tool is up now. The rest of the site shows the build, the language
            around it, and the merch that helps fund it.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            Brain Dump is the first app mode live in the build. Around it:{" "}
            <Link href="/blog">Field Notes</Link>, <Link href="/divergipedia">Divergipedia</Link>,{" "}
            <Link href="/community">community</Link>, and{" "}
            <Link href="/store">Dopamine Depot</Link>.
          </p>
        </div>

        <aside style={{ ...cardStyle, display: "grid", gap: "0.75rem" }}>
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Start here
          </p>
          <h2 style={{ margin: 0, fontSize: "1.75rem" }}>Brain Dump</h2>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            Get the pile out of your head, split it into real tasks, and send only the
            useful pieces into the planner.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            It is the first live tool because sometimes the first problem is not
            planning. It is holding too much at once.
          </p>
          <p style={{ ...mutedTextStyle, margin: 0 }}>
            The public site is the front door. The app modes are still being wired in
            behind it, without pretending the whole machine is done already.
          </p>
        </aside>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            What lives here
          </p>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>The site, without the overexplanation.</h2>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <article style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>The Hub</h3>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              Planning tools for crowded brains. Brain Dump is live first. The rest of
              the app modes are being connected without padding the story.
            </p>
          </article>

          <article style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>
              <Link href="/blog">Field Notes</Link>
            </h3>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              Research, essays, and grounded explanations you can come back to when you
              have the bandwidth.
            </p>
          </article>

          <article style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>
              <Link href="/divergipedia">Divergipedia</Link>
            </h3>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              Clear definitions and shared language, without making you wade through
              jargon first.
            </p>
          </article>

          <article style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>
              <Link href="/store">Dopamine Depot</Link>
            </h3>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              The merch arm that funds the build. Low-stim goods, no flashing banners,
              no countdown-clock nonsense.
            </p>
          </article>
        </div>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: "0.9rem" }}>
        <div style={{ display: "grid", gap: "0.4rem" }}>
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Build status
          </p>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>Live build. No fake launch language.</h2>
        </div>
        <p style={{ margin: 0 }}>Divergify is being built in public, piece by piece, with working features first and theater later.</p>
        <p style={{ margin: 0 }}>Divergify does not diagnose, treat, or replace professional care.</p>
        <p style={{ ...mutedTextStyle, margin: 0 }}>
          Start with <Link href="/community">community</Link>, browse{" "}
          <Link href="/blog">Field Notes</Link> when you want context, and visit{" "}
          <Link href="/store">Dopamine Depot</Link> if you want to help fund the build.
        </p>
      </section>
    </main>
  );
}
