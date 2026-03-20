import { useOutletContext } from "react-router-dom";
import { TaskWorkspace } from "../components/TaskWorkspace";
import type { ShellOutletContext } from "./shellContext";

export function Tasks() {
  const { openCheckIn } = useOutletContext<ShellOutletContext>();
  return <TaskWorkspace mode="planner" onOpenCheckIn={openCheckIn} />;
}
