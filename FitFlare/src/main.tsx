import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetWrapper } from "./admin/components/common/PageMeta";
import { ThemeWrapper } from "./helpers/ThemeWrapper";
import "./index.css"; 


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetWrapper>
      <BrowserRouter>
        <ThemeWrapper />
      </BrowserRouter>
    </HelmetWrapper>
  </StrictMode>
);
