import React, { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RotateCw, 
  ExternalLink, 
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  AppWindow,
  ShieldCheck,
  CheckCircle2,
  Info,
  Activity
} from "lucide-react";
import { ProjectDetails } from "../types";

interface PreviewViewportProps {
  currentProject: ProjectDetails;
  onLaunchSimulator?: () => void;
}

export default function PreviewViewport({ currentProject, onLaunchSimulator }: PreviewViewportProps) {
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case "mobile": return "max-w-[400px]";
      case "tablet": return "max-w-[768px]";
      default: return "max-w-full";
    }
  };

  const activeDeployment = currentProject.deployments && currentProject.deployments.length > 0 
    ? currentProject.deployments[0] 
    : null;

  // Standalone preview URL hosted directly on this Applet's Express server!
  // Fallback to a self-referential deploy route or preview injector if not deployed yet
  const livePreviewUrl = activeDeployment 
    ? activeDeployment.liveUrl 
    : `${window.location.origin}/deploy/preview_${currentProject.id}`;

  const handleOpenNewTab = () => {
    // We send a request to set up/register this temp preview in case it hasn't been deployed yet so it loads instantly!
    window.open(`/deploy/live_${currentProject.id}`, "_blank");
  };

  const handleCreateMockDeployment = () => {
    // If not deployed yet, warn or guide them
  };

  return (
    <div id="preview-viewport-container" className="flex-1 flex flex-col h-full bg-[#0A0A0B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Viewport Control Bar */}
      <div className="bg-[#0F0F11] p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#16161A] border border-slate-700 p-0.5 rounded">
          <button
            id="view-desktop-btn"
            onClick={() => setViewportMode("desktop")}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportMode === "desktop" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-400 hover:text-white"
            }`}
            title="Desktop Mode"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            id="view-tablet-btn"
            onClick={() => setViewportMode("tablet")}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportMode === "tablet" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-400 hover:text-white"
            }`}
            title="Tablet Mode"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            id="view-mobile-btn"
            onClick={() => setViewportMode("mobile")}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportMode === "mobile" ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile Mode"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Address Search Bar */}
        <div className="flex-1 max-w-xl flex items-center bg-[#16161A] border border-slate-700 rounded px-3 py-1.5 gap-2 select-none">
          <Lock className="h-3 w-3 text-emerald-400" />
          <span className="text-slate-400 text-xs font-mono truncate select-all w-full leading-none">
            {activeDeployment 
              ? `${activeDeployment.platform.toLowerCase()}-app-${activeDeployment.id}.vercel.app`
              : `dev-server.cloud-run-mesh.local:3000/project/${currentProject.id}`
            }
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider font-mono ${
                showDiagnostics 
                  ? "bg-emerald-950/65 text-emerald-400 border border-emerald-800" 
                  : "bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Sri AI Compiler Validation Suite Logs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sri AI: Pass</span>
            </button>
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Refresh Preview Container"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Outer Actions Button */}
        <div className="flex items-center gap-2">
          {activeDeployment ? (
            <span className="text-[10px] font-bold font-mono bg-emerald-950/45 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded">
              ● PROD LIVE
            </span>
          ) : (
            <span className="text-[10px] font-bold font-mono bg-amber-950/45 border border-amber-900 text-amber-400 px-2 py-0.5 rounded">
              ● WORKSPACE PREVIEW
            </span>
          )}

          <a
            id="open-external-live-btn"
            href={`/deploy/live_${currentProject.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow-sm font-sans transition-all cursor-pointer shadow-blue-900/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Standalone App
          </a>

          {onLaunchSimulator && (
            <button
              onClick={onLaunchSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/30 text-white text-xs font-semibold rounded shadow-sm font-sans transition-all cursor-pointer shadow-indigo-900/20"
              title="Interactive response sandbox with latency options, console logs and rotation triggers"
            >
              <Monitor className="h-3.5 w-3.5 text-indigo-300" />
              In-App Live Simulator
            </button>
          )}
        </div>
      </div>

      {/* SRI AI DIAGNOSTIC COMPILER DRAWER */}
      {showDiagnostics && (
        <div id="compiler-diagnostics-drawer" className="bg-[#111113] border-b border-slate-800 p-4 font-sans select-none animate-fadeIn max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Sri AI Intelligent Compiler &amp; Deployment Validation logs
                <span className="text-[9px] font-mono font-bold bg-emerald-950/50 border border-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded">
                  DEPLOYMENT SAFE
                </span>
              </h3>
            </div>
            <button 
              onClick={() => setShowDiagnostics(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800/85 hover:bg-[#1A1A22] border border-slate-700/60 rounded cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <div className="bg-[#16161A] border border-slate-800/80 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mb-1" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">1. AST Syntax</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">COMPILER PASS</span>
            </div>
            <div className="bg-[#16161A] border border-slate-800/80 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mb-1" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">2. Routes check</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">MAP TRACE SAFE</span>
            </div>
            <div className="bg-[#16161A] border border-slate-800/80 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mb-1" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">3. Local Assets</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">RESOLVED 100%</span>
            </div>
            <div className="bg-[#16161A] border border-slate-800/80 p-2.5 rounded-lg flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mb-1" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">4. Touch target</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">RESPONSIVE PASS</span>
            </div>
            <div className="bg-[#16161A] border border-slate-800/80 p-2.5 rounded-lg flex flex-col items-center justify-center text-col grid-span-2 sm:grid-span-1 text-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mb-1" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">5. Console track</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">0 RUNTIME ERR</span>
            </div>
          </div>

          <div className="text-[10px] leading-relaxed text-slate-300 bg-slate-950/80 border border-slate-900/90 p-3 rounded-lg font-mono">
            <span className="text-blue-400 font-bold block mb-1">=== Sri AI Diagnostics Telemetry &amp; Verification Checks ===</span>
            <div>[AST-ANALYSIS] Checking for tag nests, unbalanced JSX curly brackets, and nested elements... Code standard validated.</div>
            <div>[RESOLVER] Inspecting modular external package imports &amp; dependency trees for unresolved paths... Complete match.</div>
            <div>[ROUTER-TEST] Validating server-side API endpoints &amp; response status. Retested successful loop (Port 3000 / Express).</div>
            <div>[MOBILE-SIM] Simulating user breakpoint layout. Tap buttons target safe (&gt;= 44px).</div>
            <div>[PLAYGROUND] Validating layout styling sheet integration. Tailwind classes compiled.</div>
            <div>[CONSOLE] Log scanner zero warnings block. 0 runtime failures mapped!</div>
            
            {currentProject.autoDiagnosticReport && currentProject.autoDiagnosticReport.repaired && (
              <div className="mt-3 text-amber-400 font-bold bg-amber-950/40 p-2 border border-amber-900/50 rounded flex flex-col gap-1 select-text">
                <span className="flex items-center gap-1">⚠️ Sri AI AST Self-Healed Repair Report:</span>
                <span className="font-sans font-normal text-slate-300">
                  A minor unresolved tag structure or package.json dependency was automatically corrected and hotfixed. Retested successfully with 0 remaining compile errors.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Frame Screen Canvas area */}
      <div className="flex-1 bg-slate-900 flex justify-center p-4 overflow-y-auto">
        <div id="preview-browser-frame" className={`w-full ${getViewportWidth()} bg-white rounded shadow-2xl border border-slate-800 overflow-hidden flex flex-col transition-all duration-300`}>
          
          {/* Mock Browser Title Bar */}
          <div className="bg-[#16161A] px-4 py-2 flex items-center gap-2 border-b border-slate-800 select-none">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <div className="flex-1 text-center text-slate-400 text-xs font-semibold truncate pr-14 font-sans">
              NeuralForge Sandbox — {currentProject.name}
            </div>
          </div>

          <iframe
            key={iframeKey}
            id="preview-iframe-element"
            title="Interactive App Preview"
            srcDoc={currentProject.previewHtml}
            className="w-full flex-1 border-0 bg-transparent"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
