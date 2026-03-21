import { generateSidekickTurn } from "../sidekicks/engine";
import { getSidekick } from "../sidekicks/defs";
import type { AppData, ChatTurn, SidekickId } from "../state/types";
import type { SupportLevel } from "../state/sessionState";
import { sidekickReplyWithAi } from "./aiClient";
import { nowIso, todayISO, uid } from "./utils";

type Input = {
  message: string;
  data: AppData;
  supportLevel: SupportLevel;
  sidekickId?: SidekickId;
};

type Result = {
  turn: ChatTurn;
  source: "cloud" | "local";
  error?: string;
};

function buildLocalTurn(input: Input, sidekickId: SidekickId): ChatTurn {
  return generateSidekickTurn({
    sidekickId,
    message: input.message,
    data: input.data,
    supportLevel: input.supportLevel
  });
}

export async function requestSidekickTurn(input: Input): Promise<Result> {
  const sidekickId = input.sidekickId ?? input.data.activeSidekickId;
  const sidekick = getSidekick(sidekickId);
  const today = todayISO();

  const result = await sidekickReplyWithAi(
    {
      sidekickId: sidekick.id,
      sidekickName: sidekick.name,
      role: sidekick.role,
      tagline: sidekick.tagline,
      description: sidekick.description,
      style: sidekick.style,
      boundaries: sidekick.boundaries,
      promptOverlay: sidekick.promptOverlay,
      supportLevel: input.supportLevel,
      message: input.message,
      context: {
        onboardingReason: input.data.onboardingProfile?.reason || undefined,
        primaryGoal: input.data.onboardingProfile?.primaryGoal || undefined,
        focusArea: input.data.onboardingProfile?.focusArea || undefined,
        anchorTask: input.data.onboardingProfile?.anchorTask || undefined,
        openTasks: input.data.tasks
          .filter((task) => !task.done)
          .slice(0, 8)
          .map((task) => ({
            title: task.title,
            project: task.project,
            dueDate: task.dueDate,
            estimateMinutes: task.estimateMinutes,
            location: task.location
          })),
        habitsCompletedToday: input.data.habits.filter((habit) => habit.checkins.includes(today)).length,
        focusSessionsToday: input.data.focus.filter((session) => session.startedAt.slice(0, 10) === today).length,
        preferences: {
          humor: input.data.preferences.humor,
          shades: input.data.preferences.shades,
          lowStim: input.data.preferences.lowStim
        },
        recentTurns: input.data.chat.slice(-8).map((turn) => ({
          role: turn.role,
          content: turn.content,
          sidekickId: turn.sidekickId
        }))
      }
    },
    { tinFoilHat: input.data.preferences.tinFoil }
  );

  if (result.ok && result.data.reply.trim()) {
    return {
      source: "cloud",
      turn: {
        id: uid(),
        role: "assistant",
        sidekickId,
        content: result.data.reply.trim(),
        ts: nowIso()
      }
    };
  }

  return {
    source: "local",
    error: result.ok ? undefined : result.error,
    turn: buildLocalTurn(input, sidekickId)
  };
}
