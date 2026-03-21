import { useMemo, useState } from "react";
import { useApp } from "../state/useApp";
import { sortWithAi } from "../shared/aiClient";
import { sortBrainDumpLocally, type BrainDumpBuckets } from "../shared/brainDump";

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
  const { data } = useApp();
  const [appointmentTime, setAppointmentTime] = useState("16:00");
  const [travelMinutes, setTravelMinutes] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [brainDump, setBrainDump] = useState("");
  const [sorted, setSorted] = useState<BrainDumpBuckets | null>(null);
  const [sortNotice, setSortNotice] = useState("");

  const actAt = useMemo(() => {
    const prepMinutes = 45;
    const transitionMinutes = 10;
    const appointmentMinutes = timeToMinutes(appointmentTime);
    return minutesToTime(appointmentMinutes - travelMinutes - bufferMinutes - prepMinutes - transitionMinutes);
  }, [appointmentTime, travelMinutes, bufferMinutes]);

  const runSorter = () => {
    setSortNotice("");
    setSorted(sortBrainDumpLocally(brainDump));
  };

  const runAiSorter = async () => {
    const text = brainDump.trim();
    if (!text) return;
    const result = await sortWithAi(text, { tinFoilHat: data.preferences.tinFoil });
    if (result.ok) {
      setSorted({
        now: result.data.now ?? [],
        later: result.data.later ?? [],
        notes: result.data.notes ?? []
      });
      setSortNotice("Assisted sort complete.");
      return;
    }
    setSorted(sortBrainDumpLocally(text));
    setSortNotice(`Assisted sort unavailable, local sort used. ${result.error}`);
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">The Lab</div>
        <h2 className="h2">Tools that make time and thoughts behave.</h2>
        <p className="p">Runs locally first. Extra help is optional, never required.</p>
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

          <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="btn primary" onClick={runSorter} disabled={!brainDump.trim()}>
              Sort It
            </button>
            {!data.preferences.tinFoil ? (
              <button className="btn" onClick={() => void runAiSorter()} disabled={!brainDump.trim()}>
                Extra help
              </button>
            ) : null}
          </div>

          {sortNotice ? <div className="mini">{sortNotice}</div> : null}

          <div className="panel stack" style={{ padding: "12px" }}>
            <div>
              <strong>Do now</strong>
              <div className="mini">{sorted ? (sorted.now.length ? sorted.now.join(", ") : "None") : "Sorted output appears here."}</div>
            </div>
            <div>
              <strong>Park for later</strong>
              <div className="mini">{sorted ? (sorted.later.length ? sorted.later.join(", ") : "None") : "None"}</div>
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
