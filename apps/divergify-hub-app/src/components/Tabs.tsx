import { NavLink } from "react-router-dom";

function Tab(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className="btn tablink"
      style={({ isActive }) => ({
        borderColor: isActive ? "var(--accent)" : "var(--border-strong)",
        textDecoration: "none"
      })}
    >
      {props.label}
    </NavLink>
  );
}

export function Tabs() {
  return (
    <div className="tabs" aria-label="App navigation">
      <Tab to="/" label="Today" />
      <Tab to="/tasks" label="Tasks" />
      <Tab to="/magic-tasks" label="Magic Tasks" />
      <Tab to="/lab" label="The Lab" />
      <Tab to="/habits" label="Habits" />
      <Tab to="/focus" label="Focus" />
      <Tab to="/sidekicks" label="Sidekicks" />
      <Tab to="/settings" label="Settings" />
    </div>
  );
}
