import { useMemo } from "react";
import { AppStartPage } from "./pages/AppStartPage";
import { AuthorizationPage } from "./pages/AuthorizationPage";
import { CameraFallbackPage } from "./pages/CameraFallbackPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ResultPage } from "./pages/ResultPage";
import { ScanPage } from "./pages/ScanPage";
import { ScanStartPage } from "./pages/ScanStartPage";

type Route =
  | { name: "home" }
  | { name: "scan" }
  | { name: "scan-start" }
  | { name: "scan-app-start" }
  | { name: "scan-result"; scanId: string }
  | { name: "scan-history" }
  | { name: "authorize" }
  | { name: "camera" };

function parseRoute(pathname: string): Route {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  if (normalized === "/") return { name: "home" };
  if (normalized === "/scan") return { name: "scan" };
  if (normalized === "/scan/start") return { name: "scan-start" };
  if (normalized === "/scan/app/start") return { name: "scan-app-start" };
  if (normalized === "/scan/history") return { name: "scan-history" };
  if (normalized === "/scan/camera") return { name: "camera" };
  if (normalized === "/authorize") return { name: "authorize" };
  const resultMatch = normalized.match(/^\/scan\/result\/([^/]+)$/);
  if (resultMatch?.[1]) return { name: "scan-result", scanId: decodeURIComponent(resultMatch[1]) };
  return { name: "home" };
}

export function App() {
  const route = useMemo(() => parseRoute(window.location.pathname), []);

  if (route.name === "scan") return <ScanPage />;
  if (route.name === "scan-start") return <ScanStartPage />;
  if (route.name === "scan-app-start") return <AppStartPage />;
  if (route.name === "scan-result") return <ResultPage scanId={route.scanId} />;
  if (route.name === "scan-history") return <HistoryPage />;
  if (route.name === "authorize") return <AuthorizationPage />;
  if (route.name === "camera") return <CameraFallbackPage />;
  return <HomePage />;
}
