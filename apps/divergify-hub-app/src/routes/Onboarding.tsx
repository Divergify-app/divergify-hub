import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/useApp";
import type { Humor, OnboardingProfile, SidekickId } from "../state/types";
import { SIDEKICKS, getSidekick } from "../sidekicks/defs";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { nowIso, todayISO } from "../shared/utils";

type GoalOption = {
  id: string;
  label: string;
  description: string;
};

type AnchorTemplate = {
  id: string;
  label: string;
  anchorTask: string;
  focusArea: string;
};

const GOALS: GoalOption[] = [
  { id: "ship-work", label: "Ship work", description: "Finish and deliver meaningful tasks." },
  { id: "reduce-overwhelm", label: "Reduce overwhelm", description: "Lower stress and keep tasks manageable." },
  { id: "build-routine", label: "Build routine", description: "Create consistency without burnout." },
  { id: "life-admin", label: "Life admin", description: "Handle bills, logistics, and non-work tasks." },
  { id: "study-focus", label: "Study focus", description: "Improve follow-through on study sessions." }
];

const TEMPLATES: AnchorTemplate[] = [
  { id: "email-reset", label: "Email reset", anchorTask: "Process priority emails for 20 minutes", focusArea: "Work" },
  { id: "planning-block", label: "Daily planning", anchorTask: "Plan today's top three outcomes", focusArea: "Work" },
  { id: "house-reset", label: "Home reset", anchorTask: "Run a 20-minute room reset", focusArea: "Home" },
  { id: "study-sprint", label: "Study sprint", anchorTask: "Read and summarize one chapter section", focusArea: "School" },
  { id: "content-pass", label: "Content pass", anchorTask: "Draft one page of content", focusArea: "Creative" },
  { id: "application-push", label: "Job application", anchorTask: "Complete one application submission", focusArea: "Career" }
];

function addDays(baseIso: string, days: number): string {
  const [year, month, day] = baseIso.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildAdaptiveSteps(anchorTask: string, support: ReturnType<typeof mapOverwhelmToSupportLevel>) {
  const task = anchorTask.trim();
  if (!task) return [];

  if (support === "overloaded") {
    return [
      `Open the workspace for "${task}" and set a 2-minute timer.`,
      `Do only setup: name file, open docs, and write one sentence.`,
      `Take a 2-minute body reset (water, stretch, breathe).`,
      `Do one 5-minute micro-pass on "${task}" and stop.`
    ];
  }

  if (support === "gentle") {
    return [
      `Write a tiny definition of done for "${task}".`,
      `Run one 8-minute starter sprint.`,
      `Clear one blocker that slows "${task}".`,
      `Run one 12-minute follow-up sprint.`
    ];
  }

  if (support === "medium") {
    return [
      `Write the smallest useful definition of done for "${task}".`,
      `Run one 10-minute starter sprint.`,
      `Remove one obvious blocker before you expand scope.`,
      `Run one 15-minute follow-up sprint and stop cleanly.`
    ];
  }

  return [
    `Define the single outcome for "${task}".`,
    `Run one 15-minute sprint and capture progress.`,
    `Run a second 15-minute sprint on the highest-impact substep.`,
    `Write tomorrow's re-entry step before stopping.`
  ];
}

export function Onboarding() {
  const { data, actions } = useApp();
  const { setOverwhelm } = useSessionState();
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState(GOALS[0].id);
  const [focusArea, setFocusArea] = useState("Work");
  const [stimulationLevel, setStimulationLevel] = useState(50);
  const [anchorTask, setAnchorTask] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [firstHabit, setFirstHabit] = useState("");

  const supportLevel = mapOverwhelmToSupportLevel(stimulationLevel);
  const scaffoldSteps = useMemo(
    () => buildAdaptiveSteps(anchorTask, supportLevel),
    [anchorTask, supportLevel]
  );
  const activeSidekick = getSidekick(data.activeSidekickId);
  const totalSteps = 4;

  const next = () => setStep((value) => Math.min(totalSteps - 1, value + 1));
  const back = () => setStep((value) => Math.max(0, value - 1));

  const setHumor = (humor: Humor) => actions.setPreferences({ ...data.preferences, humor });
  const setSidekick = (id: SidekickId) => actions.setActiveSidekickId(id);

  const applyTemplate = (template: AnchorTemplate) => {
    setSelectedTemplateId(template.id);
    setAnchorTask(template.anchorTask);
    setFocusArea(template.focusArea);
  };

  const finish = () => {
    const today = todayISO();
    const normalizedAnchor = anchorTask.trim() || "Choose one anchor task";
    const goalLabel = GOALS.find((goal) => goal.id === primaryGoal)?.label ?? primaryGoal;

    setOverwhelm(stimulationLevel);

    const profile: OnboardingProfile = {
      reason: reason.trim(),
      primaryGoal: goalLabel,
      focusArea: focusArea.trim() || "General",
      anchorTask: normalizedAnchor,
      stimulationLevel,
      selectedTemplateId,
      createdAt: nowIso()
    };
    actions.setOnboardingProfile(profile);

    actions.addTask({
      title: normalizedAnchor,
      project: profile.focusArea,
      priority: 1,
      dueDate: today,
      tags: ["anchor", "onboarding"],
      recurrence: "none",
      notes: reason.trim() ? `Onboarding reason: ${reason.trim()}` : undefined
    });

    scaffoldSteps.forEach((stepTitle, index) => {
      actions.addTask({
        title: stepTitle,
        project: "Starter Plan",
        priority: index < 2 ? 2 : 3,
        dueDate: index < 2 ? today : addDays(today, 1),
        tags: ["starter-plan", "onboarding"],
        recurrence: "none"
      });
    });

    if (firstHabit.trim()) {
      actions.addHabit({
        name: firstHabit.trim(),
        frequency: "daily",
        tinyVersion: "60 seconds"
      });
    }

    actions.setHasOnboarded(true);
    actions.setHasCompletedKickoff(true);
    nav("/", { replace: true });
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="badge">Onboarding</div>
          <div className="badge">Step {step + 1}/{totalSteps}</div>
        </div>
        <h2 className="h2">{activeSidekick.name} here.</h2>
        <p className="p">
          We will learn what you need, tune your support level, create your anchor task,
          and hand you a clear next step.
        </p>
        <div className="onboarding-pill-row">
          <span className="topbar-meta-pill">Task-first planner</span>
          <span className="topbar-meta-pill">Adaptive support</span>
          <span className="topbar-meta-pill">Local-first privacy</span>
        </div>

        {step === 0 ? (
          <div className="stack">
            <h3 className="h2">Why are you here today?</h3>
            <div className="field">
              <label className="label" htmlFor="reason">What brings you to Divergify right now?</label>
              <textarea
                id="reason"
                className="textarea"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Example: I freeze when I have too many tasks and need a clear start."
              />
            </div>

            <div className="field">
              <label className="label">Primary goal</label>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    className={`btn ${primaryGoal === goal.id ? "primary" : ""}`}
                    onClick={() => setPrimaryGoal(goal.id)}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
              <div className="mini">{GOALS.find((goal) => goal.id === primaryGoal)?.description}</div>
            </div>

            <div className="field">
              <label className="label" htmlFor="focusArea">Focus area</label>
              <input
                id="focusArea"
                className="input"
                value={focusArea}
                onChange={(event) => setFocusArea(event.target.value)}
                placeholder="Work, Home, School, Health, etc."
              />
            </div>

            <div className="field">
              <label className="label">Pick a sidekick</label>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {SIDEKICKS.map((sidekick) => (
                  <button
                    key={sidekick.id}
                    className={`btn ${data.activeSidekickId === sidekick.id ? "primary" : ""}`}
                    onClick={() => setSidekick(sidekick.id)}
                  >
                    {sidekick.name}
                  </button>
                ))}
              </div>
              <div className="notice">
                <strong>{activeSidekick.name}</strong> • {activeSidekick.role}
                <div className="mini" style={{ marginTop: 6 }}>{activeSidekick.description}</div>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="humor">Tone</label>
              <select
                id="humor"
                className="select"
                value={data.preferences.humor}
                onChange={(event) => setHumor(event.target.value as Humor)}
              >
                <option value="neutral">Neutral</option>
                <option value="light">Light</option>
                <option value="sarcastic_supportive">Sarcastic-supportive</option>
              </select>
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn primary" onClick={next}>Next</button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="stack">
            <h3 className="h2">Set your stimulation level</h3>
            <p className="p">
              This directly changes how aggressively the app plans your day and breaks down tasks.
            </p>

            <div className="field">
              <label className="label" htmlFor="onboardStim">Current stimulation level: {stimulationLevel}</label>
              <input
                id="onboardStim"
                className="checkin-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={stimulationLevel}
                onChange={(event) => setStimulationLevel(Number(event.target.value))}
              />
            </div>

            <div className="notice">
              Support mode:{" "}
              <strong>
                {supportLevel === "overloaded"
                  ? "High support"
                  : supportLevel === "gentle"
                    ? "Gentle support"
                    : supportLevel === "medium"
                      ? "Medium support"
                      : "Baseline"}
              </strong>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn" onClick={back}>Back</button>
              <button className="btn primary" onClick={next}>Next</button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="stack">
            <h3 className="h2">Choose your anchor task</h3>
            <p className="p">You can pick a common starter or write your own. We will turn it into a small starter plan.</p>

            <div className="field">
              <label className="label">Common starters</label>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className={`btn ${selectedTemplateId === template.id ? "primary" : ""}`}
                    onClick={() => applyTemplate(template)}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="anchorTask">Main task today</label>
              <input
                id="anchorTask"
                className="input"
                value={anchorTask}
                onChange={(event) => setAnchorTask(event.target.value)}
                placeholder="Example: Submit proposal draft"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="firstHabit">Optional tiny habit</label>
              <input
                id="firstHabit"
                className="input"
                value={firstHabit}
                onChange={(event) => setFirstHabit(event.target.value)}
                placeholder="Example: 1 minute desk reset"
              />
            </div>

            <div className="card stack" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                <strong>Starter plan preview</strong>
                <span className="badge">{supportLevel}</span>
              </div>
              {scaffoldSteps.length > 0 ? (
                <ol className="guide-list">
                  {scaffoldSteps.map((stepTitle) => (
                    <li key={stepTitle}>{stepTitle}</li>
                  ))}
                </ol>
              ) : (
                <p className="p">Enter a main task to generate your first starter plan.</p>
              )}
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn" onClick={back}>Back</button>
              <button className="btn primary" onClick={next} disabled={!anchorTask.trim()}>
                Next
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="stack">
            <h3 className="h2">Final setup and handoff</h3>
            <label className="row">
              <input type="checkbox" checked={data.preferences.shades} onChange={actions.toggleShades} />
              <div className="stack" style={{ gap: 2 }}>
                <div>Shades (low-stim)</div>
                <div className="p">Lower visual intensity and reduced motion.</div>
              </div>
            </label>

            <label className="row">
              <input type="checkbox" checked={data.preferences.tinFoil} onChange={actions.toggleTinFoil} />
              <div className="stack" style={{ gap: 2 }}>
                <div>Tinfoil Hat</div>
                <div className="p">Blocks cloud assist features and keeps the session local-only.</div>
              </div>
            </label>

            <div className="card stack" style={{ padding: 14 }}>
              <strong>How the app works next</strong>
              <ol className="guide-list">
                <li>The dashboard opens straight into your real task system.</li>
                <li>The daily check-in tunes support after the shell loads.</li>
                <li>The planner keeps smart views and project lanes visible.</li>
                <li>Focus, habits, sidekicks, and Magic Tasks stay one tap away.</li>
              </ol>
            </div>

            <div className="notice">
              Productivity support tool only. Not medical advice, diagnosis, or treatment.
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn" onClick={back}>Back</button>
              <button className="btn primary" onClick={finish}>
                Finish onboarding
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
