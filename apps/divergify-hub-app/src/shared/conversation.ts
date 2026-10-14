import type { AppData, Task } from "../state/types";

export type Appointment = { task: Task; start: Date; minutesAway: number };

// Saved appointments are local wall-clock times. Reject rolled-over dates and date-only tasks.
export function scheduledTime(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const [year, month, day, hour, minute] = value.split(/[-T:]/).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return null;
  return date;
}

export function nextAppointment(tasks: Task[], now: Date): Appointment | null {
  const candidates = tasks.flatMap(task => {
    const start = scheduledTime(task.startAt);
    return !task.done && start && start.getTime() >= now.getTime()
      ? [{ task, start, minutesAway: Math.ceil((start.getTime() - now.getTime()) / 60_000) }]
      : [];
  });
  return candidates.sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null;
}

export function appointmentPrompt(appointment: Appointment) {
  const time = appointment.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `You have “${appointment.task.title}” at ${time}, in ${appointment.minutesAway} minutes. How much time do you need to get ready and get there?`;
}

// This is intentionally a small, truthful on-device fallback, not simulated live AI.
export function localConversationReply(message: string, data: AppData, now = new Date()): string {
  const text = message.trim().toLowerCase();
  if (/\b(calendar|appointments?|schedule)\b/.test(text)) {
    const next = nextAppointment(data.tasks, now);
    return next ? appointmentPrompt(next) : "I can see appointments saved in Divergify, but your outside calendar isn’t connected. What’s the next appointment you need to plan around?";
  }
  const next = nextAppointment(data.tasks, now);
  if (next && next.minutesAway <= 120) return appointmentPrompt(next);
  if (/\b(overwhelm\w*|panic\w*|too much|losing it|spinning)\b/.test(text)) {
    return "Let’s make this smaller. What needs your attention in the next hour?";
  }
  if (/\b(priority|priorities|important|focus|first|track|decide)\b/.test(text)) {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const task = data.tasks.filter(t => !t.done).sort((a, b) => {
      const aDue = Boolean(a.dueDate && a.dueDate <= today);
      const bDue = Boolean(b.dueDate && b.dueDate <= today);
      return Number(bDue) - Number(aDue) || a.priority - b.priority;
    })[0];
    return task ? `“${task.title}” is the next candidate from your saved tasks. Does that still need to come first?` : "What has a real deadline today?";
  }
  if (/\b(done|finished|saved|thank you|thanks)\b/.test(text)) return "What needs your attention next?";
  return "You can keep dumping. Which part needs your attention first?";
}

export type SpeechResults = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
export function finalTranscript(results: SpeechResults) {
  return Array.from(results).filter(result => result.isFinal).map(result => result[0]?.transcript.trim() ?? "").filter(Boolean).join(" ");
}
