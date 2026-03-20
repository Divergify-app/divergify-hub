import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../state/useApp";
import { getPersonaCopy } from "../sidekicks/copy";
import { useSessionState } from "../state/sessionState";
import { breakdownWithAi } from "../shared/aiClient";
import { getSupportProfile } from "../shared/supportProfile";

function buildSteps(task: string) {
  const cleanTask = task.trim();
  if (!cleanTask) return [];

  return [
    `Open a note and write this exact target: "${cleanTask}".`,
    `Set a 5-minute timer and do the smallest visible action for "${cleanTask}".`,
    `Remove one blocker that slows down "${cleanTask}".`,
    `Do one more tiny pass and stop before burnout.`,
    `Write the next micro-step for "${cleanTask}" so re-entry is easy.`
  ];
}

export function MagicTasks() {
  const { data } = useApp();
  const { session } = useSessionState();
  const persona = getPersonaCopy(data.activeSidekickId);
  const [searchParams] = useSearchParams();
  const [bigTask, setBigTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const incomingTask = searchParams.get("task");
    if (!incomingTask) return;
    setBigTask(incomingTask);
  }, [searchParams]);

  const runBreakdown = async () => {
    const task = bigTask.trim();
    if (!task) return;
    setIsThinking(true);
    setStatus(null);

    const result = await breakdownWithAi(task, { tinFoilHat: data.preferences.tinFoil });
    if (result.ok && result.data.steps.length) {
      setSteps(result.data.steps);
      setStatus("Cloud breakdown complete.");
      setIsThinking(false);
      return;
    }

    setSteps(buildSteps(task));
    setStatus(
      result.ok
        ? "Local fallback used."
        : result.error === "Tinfoil Hat is enabled."
          ? "Tinfoil Hat kept this breakdown local."
          : "Cloud breakdown was unavailable, so Divergify used the local fallback."
    );
    setIsThinking(false);
  };

  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Magic Tasks</div>
        <h2 className="h2">{persona.magicTasksHeading}</h2>
        <p className="p">{persona.magicTasksSub}</p>

        <div className="field">
          <label className="label" htmlFor="magicTaskInput">
            What is the big task?
          </label>
          <input
            id="magicTaskInput"
            className="input"
            type="text"
            value={bigTask}
            onChange={(e) => setBigTask(e.target.value)}
            placeholder="Example: clean the kitchen"
            onKeyDown={(e) => {
              if (e.key === "Enter" && bigTask.trim()) {
                void runBreakdown();
              }
            }}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            className="btn primary"
            onClick={() => void runBreakdown()}
            disabled={!bigTask.trim() || isThinking}
          >
            {isThinking ? "Breaking it down..." : "Break it down"}
          </button>
        </div>
        <div className="mini">
          Cloud assist is used when available. Tinfoil Hat keeps this flow local. Current support profile: {supportProfile.label}.
        </div>
        {status ? <div className="notice">{status}</div> : null}
      </div>

      <div className="card stack">
        <h3 className="h2">Micro steps</h3>

        {steps.length ? (
          <ol className="stack" style={{ margin: 0, paddingLeft: "22px" }}>
            {steps.map((step, idx) => (
              <li key={`${idx}-${step}`} className="p" style={{ color: "var(--text)" }}>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="p">{persona.magicTasksEmpty}</p>
        )}
      </div>
    </div>
  );
}
