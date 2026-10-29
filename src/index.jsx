import React from "react";
import { createRoot } from "react-dom/client";
import CuteApologyApp, { defaultTemplateData } from "./CuteApology.jsx";

// Parse any personalization from URL query parameters if present
function getCustomConfig() {
  try {
    const params = new URLSearchParams(window.location.search);
    const custom = { ...defaultTemplateData };
    let hasCustom = false;

    // Check window global
    if (window.__TEMPLATE_CONFIG__ && typeof window.__TEMPLATE_CONFIG__ === "object") {
      Object.assign(custom, window.__TEMPLATE_CONFIG__);
      hasCustom = true;
    }

    // Check query params
    for (const [key, value] of params.entries()) {
      if (key in custom && value) {
        custom[key] = value;
        hasCustom = true;
      }
    }

    return hasCustom ? custom : defaultTemplateData;
  } catch (e) {
    return defaultTemplateData;
  }
}

const config = getCustomConfig();
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<CuteApologyApp config={config} />);
}
