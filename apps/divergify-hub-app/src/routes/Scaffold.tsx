import { Link } from "react-router-dom";

type FeatureStatus = "Live" | "Scaffolded" | "Next";

type FeatureRow = {
  feature: string;
  status: FeatureStatus;
  route: string;
  value: string;
};

const FEATURES: FeatureRow[] = [
  {
    feature: "State Check + Overwhelm Gauge",
    status: "Live",
    route: "/",
    value: "Sets support level and daily task cap so planning stays realistic."
  },
  {
    feature: "TickTick-Style Planner Views",
    status: "Live",
    route: "/tasks",
    value: "Today/Upcoming/Overdue/Inbox views with quick scheduling actions."
  },
  {
    feature: "Priority + Project + Recurrence",
    status: "Live",
    route: "/tasks",
    value: "Tasks can be ranked, grouped, and auto-regenerated when recurring."
  },
  {
    feature: "Anchor Task Flow",
    status: "Live",
    route: "/",
    value: "Today page always highlights the next best task to start."
  },
  {
    feature: "Focus Sprint + Sidekick Nudges",
    status: "Live",
    route: "/focus",
    value: "Run timed sprints and keep momentum with adaptive nudge copy."
  },
  {
    feature: "Magic Task Breakdown",
    status: "Live",
    route: "/magic-tasks",
    value: "Break intimidating tasks into smaller executable steps."
  },
  {
    feature: "Post-Onboarding Kickoff Lane",
    status: "Live",
    route: "/kickoff",
    value: "Guided checklist so new users know exactly what to do first."
  },
  {
    feature: "Calendar (Day/Week Drag)",
    status: "Scaffolded",
    route: "/tasks",
    value: "Planned next: scheduling board connected to task due dates."
  },
  {
    feature: "Reminders + Notifications",
    status: "Scaffolded",
    route: "/settings",
    value: "Planned next: reminder timing and alert rules."
  },
  {
    feature: "Cloud Sync + Account",
    status: "Next",
    route: "/settings",
    value: "Planned next: optional login and cross-device data sync."
  }
];

export function Scaffold() {
  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Build Scaffold</div>
        <h2 className="h2">Feature map and flow</h2>
        <p className="p">
          This is the current Divergify implementation map: what exists now, what is scaffolded, and what comes next.
        </p>
      </div>

      <div className="card stack">
        <h3 className="h2">Current flow</h3>
        <ol className="guide-list">
          <li>Onboarding: sidekick, preferences, first task/habit seed.</li>
          <li>Kickoff lane: state check, starter plan, first focus sprint.</li>
          <li>Today: anchor task and next executable action.</li>
          <li>Tasks planner: prioritize, schedule, repeat, and re-balance.</li>
          <li>Focus + Sidekick: execute work with low-friction support.</li>
        </ol>
      </div>

      <div className="stack">
        {FEATURES.map((row) => (
          <div key={row.feature} className="card stack">
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <strong>{row.feature}</strong>
              <span className="badge">{row.status}</span>
            </div>
            <div className="p">{row.value}</div>
            <div className="mini">Route: {row.route}</div>
          </div>
        ))}
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <Link to="/kickoff" className="btn primary" style={{ textDecoration: "none" }}>
          Open kickoff flow
        </Link>
        <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
          Open planner
        </Link>
      </div>
    </div>
  );
}
