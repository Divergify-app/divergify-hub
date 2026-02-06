import { useMemo, useState } from "react";

type SortBuckets = {
  tasks: string[];
  shopping: string[];
  notes: string[];
};

const SHOPPING_KEYWORDS = [
  "milk",
  "eggs",
  "bread",
  "coffee",
  "butter",
  "cheese",
  "banana",
  "apples",
  "chicken",
  "rice",
  "toilet paper",
  "paper towels"
];

const TASK_VERBS = [
  "call",
  "email",
  "schedule",
  "pay",
  "clean",
  "fix",
  "send",
  "make",
  "book",
  "cancel",
  "reply",
  "write"
];

function parseItems(text: string) {
  return text
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isShoppingItem(item: string) {
  const lower = item.toLowerCase();
  return SHOPPING_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function isTaskItem(item: string) {
  const lower = item.toLowerCase();
  return TASK_VERBS.some((verb) => {
    if (lower === verb) return true;
    if (lower.startsWith(`${verb} `)) return true;
    return lower.includes(` ${verb} `);
  });
}

function sortBrainDump(text: string): SortBuckets {
  const buckets: SortBuckets = { tasks: [], shopping: [], notes: [] };
  parseItems(text).forEach((item) => {
    if (isShoppingItem(item)) {
      buckets.shopping.push(item);
      return;
    }
    if (isTaskItem(item)) {
      buckets.tasks.push(item);
      return;
    }
    buckets.notes.push(item);
  });
  return buckets;
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function Lab() {
  const [appointmentTime, setAppointmentTime] = useState("16:00");
  const [travelMinutes, setTravelMinutes] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [brainDump, setBrainDump] = useState("");
  const [sorted, setSorted] = useState<SortBuckets | null>(null);

  const actAt = useMemo(() => {
    const prepMinutes = 45;
    const transitionMinutes = 10;
    const appointmentMinutes = timeToMinutes(appointmentTime);
    return minutesToTime(appointmentMinutes - travelMinutes - bufferMinutes - prepMinutes - transitionMinutes);
  }, [appointmentTime, travelMinutes, bufferMinutes]);

  const runSorter = () => {
    setSorted(sortBrainDump(brainDump));
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">The Lab</div>
        <h2 className="h2">Tools that make time and thoughts behave.</h2>
        <p className="p">Local-only tools. No external AI calls required.</p>
      </div>

      <div className="row" style={{ alignItems: "stretch", flexWrap: "wrap" }}>
        <div className="card stack" style={{ flex: "1 1 320px" }}>
          <h3 className="h2">Reality Check Clock</h3>

          <div className="field">
            <label className="label" htmlFor="labApptTime">
              Appointment time
            </label>
            <input
              id="labApptTime"
              className="input"
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="labTravel">
              Travel ({travelMinutes} min)
            </label>
            <input
              id="labTravel"
              type="range"
              min={5}
              max={60}
              value={travelMinutes}
              onChange={(e) => setTravelMinutes(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="labBuffer">
              Lost keys buffer ({bufferMinutes} min)
            </label>
            <input
              id="labBuffer"
              type="range"
              min={0}
              max={30}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
            />
          </div>

          <div className="panel stack" style={{ padding: "14px", textAlign: "center" }}>
            <div className="mini">You must act at</div>
            <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "0.04em" }}>{actAt}</div>
          </div>
        </div>

        <div className="card stack" style={{ flex: "1 1 320px" }}>
          <h3 className="h2">Spaghetti Sorter</h3>

          <div className="field">
            <label className="label" htmlFor="labDump">
              Brain dump
            </label>
            <textarea
              id="labDump"
              className="textarea"
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="Type comma or newline separated thoughts."
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn primary" onClick={runSorter} disabled={!brainDump.trim()}>
              Sort It
            </button>
          </div>

          <div className="panel stack" style={{ padding: "12px" }}>
            <div>
              <strong>Tasks</strong>
              <div className="mini">{sorted ? (sorted.tasks.length ? sorted.tasks.join(", ") : "None") : "Sorted output appears here."}</div>
            </div>
            <div>
              <strong>Shopping</strong>
              <div className="mini">{sorted ? (sorted.shopping.length ? sorted.shopping.join(", ") : "None") : "Sorted output appears here."}</div>
            </div>
            <div>
              <strong>Notes parked</strong>
              <div className="mini">{sorted ? (sorted.notes.length ? sorted.notes.join(", ") : "None") : "Sorted output appears here."}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
