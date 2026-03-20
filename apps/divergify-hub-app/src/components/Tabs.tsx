import { NavLink } from "react-router-dom";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";

type TabsProps = {
  variant?: "sidebar" | "bottom";
};

type NavItem = {
  to: string;
  label: string;
  icon: NavIcon;
  count?: number | string;
  search?: string;
};

type NavIcon =
  | "today"
  | "planner"
  | "calendar"
  | "focus"
  | "habits"
  | "sidekicks"
  | "brain"
  | "feedback"
  | "magic"
  | "settings"
  | "folder";

function NavGlyph(props: { icon: NavIcon }) {
  const { icon } = props;

  if (icon === "today") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M5 6h14v13H5z" />
        <path d="M8 4v4M16 4v4M5 10h14" />
      </svg>
    );
  }

  if (icon === "planner") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M6 7h12M6 12h12M6 17h8" />
        <path d="M4 5h16v14H4z" />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M5 7h14v12H5z" />
        <path d="M8 4v4M16 4v4M5 10h14M9 13h2M13 13h2M9 16h6" />
      </svg>
    );
  }

  if (icon === "focus") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
      </svg>
    );
  }

  if (icon === "habits") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M7 12l3 3 7-8" />
        <path d="M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
      </svg>
    );
  }

  if (icon === "sidekicks") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M12 3l2.2 6.8H21l-5.4 4 2.1 7.2L12 16.7 6.3 21l2.1-7.2L3 9.8h6.8z" />
      </svg>
    );
  }

  if (icon === "brain") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M9 6a3 3 0 0 1 6 0a3 3 0 0 1 2.7 4.4A3.5 3.5 0 0 1 16 17H8a3.5 3.5 0 0 1-1.7-6.6A3 3 0 0 1 9 6z" />
        <path d="M10 7v10M14 7v10M9 11h6" />
      </svg>
    );
  }

  if (icon === "feedback") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M5 6h14v10H9l-4 3z" />
        <path d="M8 10h8M8 13h5" />
      </svg>
    );
  }

  if (icon === "magic") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M4 19l9-9 4 4-9 9H4z" />
        <path d="M14 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1z" />
      </svg>
    );
  }

  if (icon === "settings") {
    return (
      <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
        <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12A3.5 3.5 0 0 1 12 8.5z" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="nav-link-icon" aria-hidden="true">
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2" />
    </svg>
  );
}

function NavItemLink(props: { item: NavItem; compact?: boolean }) {
  const { item, compact } = props;

  return (
    <NavLink
      end={item.to === "/" && !item.search}
      to={item.search ? { pathname: item.to, search: item.search } : item.to}
      className={({ isActive }) => `nav-link ${compact ? "compact" : ""} ${isActive ? "active" : ""}`}
    >
      <span className="nav-link-main">
        <NavGlyph icon={item.icon} />
        <span className="nav-link-label">{item.label}</span>
      </span>
      {item.count !== undefined ? <span className="nav-link-count">{item.count}</span> : null}
    </NavLink>
  );
}

export function Tabs({ variant = "sidebar" }: TabsProps) {
  const { data } = useApp();
  const today = todayISO();

  const openTasks = data.tasks.filter((task) => !task.done);
  const dueNowCount = openTasks.filter((task) => task.dueDate && task.dueDate <= today).length;
  const scheduledCount = openTasks.filter((task) => task.dueDate).length;
  const focusTodayCount = data.focus.filter((session) => session.startedAt.slice(0, 10) === today).length;
  const habitsDoneToday = data.habits.filter((habit) => habit.checkins.includes(today)).length;
  const projectItems: NavItem[] = Array.from(
    openTasks.reduce((map, task) => {
      const key = task.project?.trim() || "Inbox";
      if (key === "Inbox") return map;
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([project, count]) => ({
      to: "/tasks",
      label: project,
      icon: "folder",
      count,
      search: `?project=${encodeURIComponent(project)}`
    }));

  const primaryItems: NavItem[] = [
    { to: "/", label: "Today", icon: "today", count: dueNowCount },
    { to: "/tasks", label: "Planner", icon: "planner", count: openTasks.length },
    { to: "/calendar", label: "Calendar", icon: "calendar", count: scheduledCount },
    { to: "/focus", label: "Focus", icon: "focus", count: focusTodayCount },
    { to: "/habits", label: "Habits", icon: "habits", count: habitsDoneToday },
    { to: "/sidekicks", label: "Sidekicks", icon: "sidekicks" }
  ];

  const secondaryItems: NavItem[] = [
    { to: "/brain-dump", label: "Brain Dump", icon: "brain" },
    { to: "/feedback", label: "Support", icon: "feedback" },
    { to: "/magic-tasks", label: "Magic Tasks", icon: "magic" },
    { to: "/settings", label: "Settings", icon: "settings" }
  ];

  if (variant === "bottom") {
    return (
      <nav className="mobile-nav" aria-label="Primary">
        {primaryItems.slice(0, 5).map((item) => (
          <NavItemLink key={item.to} item={item} compact />
        ))}
      </nav>
    );
  }

  return (
    <div className="nav-stack" aria-label="App navigation">
      <div className="nav-section">
        <div className="nav-section-title">Core</div>
        {primaryItems.map((item) => (
          <NavItemLink key={item.to} item={item} />
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Tools</div>
        {secondaryItems.map((item) => (
          <NavItemLink key={item.to} item={item} />
        ))}
      </div>

      {projectItems.length ? (
        <div className="nav-section">
          <div className="nav-section-title">Projects</div>
          {projectItems.map((item) => (
            <NavItemLink key={`${item.to}${item.search ?? ""}`} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
