import { createRoot } from "react-dom/client";
import DietPlanner from "../app/DietPlanner";
import "@fontsource-variable/vazirmatn";
import "../app/globals.css";

const root = document.getElementById("root");
if (root) createRoot(root).render(<DietPlanner />);

import "../app/ui-refinement.css";
