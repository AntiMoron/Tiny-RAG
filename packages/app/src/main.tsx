import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./layout";

function startApp() {
  const root = createRoot(
    document.getElementById("root") as HTMLElement
  ) as Root;
  root.render(<App />);
}

startApp();
