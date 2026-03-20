import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./routes/Shell";
import { Onboarding } from "./routes/Onboarding";
import { Today } from "./routes/Today";
import { Tasks } from "./routes/Tasks";
import { Habits } from "./routes/Habits";
import { Focus } from "./routes/Focus";
import { Lab } from "./routes/Lab";
import { MagicTasks } from "./routes/MagicTasks";
import { Sidekicks } from "./routes/Sidekicks";
import { Settings } from "./routes/Settings";
import { Kickoff } from "./routes/Kickoff";
import { Done } from "./routes/Done";
import { LegalPrivacy } from "./routes/LegalPrivacy";
import { LegalTerms } from "./routes/LegalTerms";
import { NotFound } from "./routes/NotFound";
import { Calendar } from "./routes/Calendar";
import { BrainDump } from "./routes/BrainDump";
import { Feedback } from "./routes/Feedback";

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Today />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="kickoff" element={<Kickoff />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="brain-dump" element={<BrainDump />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="community" element={<Navigate to="/feedback" replace />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="magic-tasks" element={<MagicTasks />} />
          <Route path="lab" element={<Lab />} />
          <Route path="habits" element={<Habits />} />
          <Route path="focus" element={<Focus />} />
          <Route path="sidekicks" element={<Sidekicks />} />
          <Route path="scaffold" element={<Navigate to="/settings" replace />} />
          <Route path="guide" element={<Navigate to="/" replace />} />
          <Route path="settings" element={<Settings />} />
          <Route path="done" element={<Done />} />
          <Route path="legal/privacy" element={<LegalPrivacy />} />
          <Route path="legal/terms" element={<LegalTerms />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
