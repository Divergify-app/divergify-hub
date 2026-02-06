import { useState } from "react";
import { useApp } from "../state/useApp";
import { breakdownWithAi } from "../shared/aiClient";

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
  const [bigTask, setBigTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [assistNote, setAssistNote] = useState("");

  const runLocalBreakdown = () => {
    const task = bigTask.trim();
    if (!task) return;
    setSteps(buildSteps(task));
    setAssistNote("");
  };

  const runAiBreakdown = async () => {
    const task = bigTask.trim();
    if (!task) return;

    const result = await breakdownWithAi(task, { tinFoilHat: data.preferences.tinFoil });
    if (result.ok && Array.isArray(result.data.steps) && result.data.steps.length) {
      setSteps(result.data.steps.slice(0, 5));
      setAssistNote("AI assist complete.");
      return;
    }

    setSteps(buildSteps(task));
    setAssistNote(`AI unavailable, local breakdown used. ${result.ok ? "" : result.error}`.trim());
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Magic Tasks</div>
        <h2 className="h2">Big task. Tiny steps.</h2>
        <p className="p">Local-first breakdown with no external calls.</p>

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
                runLocalBreakdown();
              }
            }}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            className="btn primary"
            onClick={runLocalBreakdown}
            disabled={!bigTask.trim()}
          >
            De-scary-fy
          </button>
          {!data.preferences.tinFoil ? (
            <button className="btn" onClick={() => void runAiBreakdown()} disabled={!bigTask.trim()}>
              AI Assist
            </button>
          ) : null}
        </div>
        {assistNote ? <div className="mini">{assistNote}</div> : null}
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
          <p className="p">Enter a task and click De-scary-fy.</p>
        )}
      </div>
    </div>
  );
}
