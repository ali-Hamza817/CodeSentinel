import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./screens/Dashboard";
import { Repository } from "./screens/Repository";
import { StaticAnalysis } from "./screens/StaticAnalysis";
import { DynamicAnalysis } from "./screens/DynamicAnalysis";
import { Vulnerabilities } from "./screens/Vulnerabilities";
import { Complexity } from "./screens/Complexity";
import { AIReview } from "./screens/AIReview";
import { BuildCI } from "./screens/BuildCI";
import { RiskScoring } from "./screens/RiskScoring";
import { Reports } from "./screens/Reports";
import { Settings } from "./screens/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "repository", Component: Repository },
      { path: "static-analysis", Component: StaticAnalysis },
      { path: "dynamic-analysis", Component: DynamicAnalysis },
      { path: "vulnerabilities", Component: Vulnerabilities },
      { path: "complexity", Component: Complexity },
      { path: "ai-review", Component: AIReview },
      { path: "build-ci", Component: BuildCI },
      { path: "risk-scoring", Component: RiskScoring },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
