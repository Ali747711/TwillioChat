import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import Root from "./Root.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </StrictMode>
)
