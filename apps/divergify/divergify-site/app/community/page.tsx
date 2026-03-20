"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type RoomId =
  | "general"
  | "brain-dump"
  | "gentle-support"
  | "high-support"
  | "shades-low-stim"
  | "tinfoil-hat";

type Post = {
  id: string;
  name: string;
  room: RoomId;
  message: string;
  createdAt: string;
};

const rooms: Array<{ id: RoomId; label: string; prompt: string }> = [
  {
    id: "general",
    label: "General",
    prompt: "Wins, snags, useful rituals, and what your day is doing to your nervous system.",
  },
  {
    id: "brain-dump",
    label: "Brain Dump",
    prompt: "Messy list? Post the pile. People can help you sort it into something survivable.",
  },
  {
    id: "gentle-support",
    label: "Gentle Support",
    prompt: "Low-pressure replies, tiny next steps, and no fake hype.",
  },
  {
    id: "high-support",
    label: "High Support",
    prompt: "For days when the list is louder than your actual capacity.",
  },
  {
    id: "shades-low-stim",
    label: "Shades / Low Stim",
    prompt: "Quiet room. Short replies. Lower visual and emotional noise.",
  },
  {
    id: "tinfoil-hat",
    label: "Tinfoil Hat",
    prompt: "Privacy-minded workarounds, local-first habits, and ways to keep fewer systems in the loop.",
  },
];

const panelStyle = {
  border: "1px solid rgba(251, 241, 218, 0.12)",
  borderRadius: "1.25rem",
  padding: "1.25rem",
  background: "rgba(23, 28, 67, 0.72)",
} as const;

export default function CommunityPage() {
  const [activeRoom, setActiveRoom] = useState<RoomId>("general");
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Loading conversation...");
  const [busy, setBusy] = useState(false);

  async function loadPosts(room: RoomId) {
    try {
      setStatus("Loading conversation...");
      const response = await fetch(`/api/community?room=${room}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load posts.");
      const data = (await response.json()) as { posts: Post[] };
      setPosts(data.posts);
      setStatus(data.posts.length ? "" : "No posts in this room yet. Start the thread.");
    } catch {
      setStatus("Community is having a moment. Try again in a minute.");
    }
  }

  useEffect(() => {
    void loadPosts(activeRoom);
  }, [activeRoom]);

  const activeRoomMeta = useMemo(
    () => rooms.find((room) => room.id === activeRoom) ?? rooms[0],
    [activeRoom]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setStatus("Give the post a name and an actual sentence.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Posting...");
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          room: activeRoom,
          message: message.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not post.");

      setMessage("");
      await loadPosts(activeRoom);
      setStatus("Posted.");
    } catch {
      setStatus("That post did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ display: "grid", gap: "1.5rem" }}>
      <section style={{ ...panelStyle, display: "grid", gap: "0.9rem" }}>
        <p
          style={{
            margin: 0,
            color: "#e2c483",
            fontSize: "0.8rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Community
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1 }}>
          Talk to each other like actual people.
        </h1>
        <p style={{ margin: 0, color: "#b9c0d5", lineHeight: 1.6 }}>
          This is for notes, workarounds, tiny wins, bad days, and the stuff most
          platforms flatten into fake positivity. Pick the room that matches the day
          you are having.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "minmax(220px, 260px) minmax(0, 1fr)",
          alignItems: "start",
        }}
      >
        <aside style={{ ...panelStyle, display: "grid", gap: "0.75rem" }}>
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoom(room.id)}
              style={{
                border: "1px solid rgba(251, 241, 218, 0.14)",
                borderRadius: "1rem",
                padding: "0.9rem 1rem",
                textAlign: "left",
                background:
                  activeRoom === room.id
                    ? "rgba(226, 196, 131, 0.16)"
                    : "rgba(255, 255, 255, 0.03)",
                color: "#fbf1da",
                cursor: "pointer",
              }}
            >
              <strong style={{ display: "block", marginBottom: "0.35rem" }}>{room.label}</strong>
              <span style={{ color: "#b9c0d5", lineHeight: 1.4 }}>{room.prompt}</span>
            </button>
          ))}
        </aside>

        <div style={{ display: "grid", gap: "1rem" }}>
          <section style={{ ...panelStyle, display: "grid", gap: "0.9rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{activeRoomMeta.label}</h2>
            <p style={{ margin: 0, color: "#b9c0d5", lineHeight: 1.6 }}>
              {activeRoomMeta.prompt}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ color: "#b9c0d5" }}>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  placeholder="Name or alias"
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid rgba(251, 241, 218, 0.16)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#fbf1da",
                    padding: "0.9rem 1rem",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ color: "#b9c0d5" }}>Post</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={600}
                  rows={5}
                  placeholder="Say the actual thing."
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid rgba(251, 241, 218, 0.16)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#fbf1da",
                    padding: "0.9rem 1rem",
                    resize: "vertical",
                  }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <span style={{ color: "#b9c0d5", fontSize: "0.9rem" }}>
                  {status || "Posts show newest first."}
                </span>
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    border: "1px solid rgba(251, 241, 218, 0.16)",
                    borderRadius: "999px",
                    padding: "0.8rem 1rem",
                    background: "rgba(226, 196, 131, 0.16)",
                    color: "#fbf1da",
                    cursor: busy ? "default" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {busy ? "Posting..." : "Post to room"}
                </button>
              </div>
            </form>
          </section>

          <section style={{ display: "grid", gap: "0.75rem" }}>
            {posts.map((post) => (
              <article key={post.id} style={panelStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>{post.name}</strong>
                  <span style={{ color: "#b9c0d5", fontSize: "0.9rem" }}>
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: "#fbf1da", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {post.message}
                </p>
              </article>
            ))}
            {!posts.length ? (
              <div style={{ ...panelStyle, color: "#b9c0d5" }}>
                Nothing in here yet.
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
