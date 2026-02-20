import { createRoot } from "react-dom/client";
import { onlineManager } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

onlineManager.setOnline(true);

createRoot(document.getElementById("root")!).render(<App />);
