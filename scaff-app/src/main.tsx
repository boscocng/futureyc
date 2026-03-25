// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installStorage } from "./Storage";
import OnboardingApp from "./OnboardingApp";

// Install the storage polyfill BEFORE React renders
installStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OnboardingApp />
  </StrictMode>
);