import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./routes/Shell";
import { Onboarding } from "./routes/Onboarding";
import { Today } from "./routes/Today";
import { Tasks } from "./routes/Tasks";
import { Habits } from "./routes/Habits";
import { Focus } from "./routes/Focus";
import { Lab } from "./routes/Lab";
import { Sidekicks } from "./routes/Sidekicks";
import { Settings } from "./routes/Settings";
import { Done } from "./routes/Done";
import { LegalPrivacy } from "./routes/LegalPrivacy";
import { LegalTerms } from "./routes/LegalTerms";
import { NotFound } from "./routes/NotFound";

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Today />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="lab" element={<Lab />} />
          <Route path="habits" element={<Habits />} />
          <Route path="focus" element={<Focus />} />
          <Route path="sidekicks" element={<Sidekicks />} />
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
