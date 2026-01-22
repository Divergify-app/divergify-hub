import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppProvider } from "./state/useApp";
import { SessionStateProvider } from "./state/sessionState";
import "./styles/tokens.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <SessionStateProvider>
        <App />
      </SessionStateProvider>
    </AppProvider>
  </React.StrictMode>
);
