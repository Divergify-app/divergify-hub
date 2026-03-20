const rooms = [
  {
    title: "General",
    body: "Wins, snags, rituals, or the weird workaround that saved your afternoon.",
  },
  {
    title: "Brain Dump",
    body: "Mess first. Sorting second. Good place to ask for help turning the pile into steps.",
  },
  {
    title: "Gentle Support",
    body: "Low-pressure replies, short lists, and no fake sunshine.",
  },
  {
    title: "High Support",
    body: "For days when the list is louder than your actual capacity.",
  },
  {
    title: "Shades / Low Stim",
    body: "Lower-noise room for people who need quieter pacing and fewer flourishes.",
  },
  {
    title: "Tinfoil Hat",
    body: "Privacy-minded setups, local-first tricks, and fewer systems poking around in your day.",
  },
];

export function Community() {
  return (
    <div className="stack">
      <section className="panel stack">
        <div className="badge">Community</div>
        <h1 className="workspace-title">A place for people to talk to each other, not just to the product.</h1>
        <p className="p">
          The shared conversation is on the public community board right now. The app
          keeps the rooms and tone visible so community is part of the product shape,
          not an afterthought bolted on later.
        </p>
        <p className="p">
          Open the live board here:{" "}
          <a href="https://divergify.app/community" target="_blank" rel="noreferrer">
            divergify.app/community
          </a>
        </p>
      </section>

      <section className="card stack">
        <h2 className="h2">Rooms</h2>
        {rooms.map((room) => (
          <article key={room.title} className="card stack" style={{ padding: 14 }}>
            <strong>{room.title}</strong>
            <p className="p">{room.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
