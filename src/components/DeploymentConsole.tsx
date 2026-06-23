import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Rocket, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Play, 
  Upload, 
  Check, 
  RefreshCw,
  Clock,
  ExternalLink as ExtLink,
  ChevronRight,
  HelpCircle,
  Monitor
} from "lucide-react";
import { ProjectDetails, Deployment } from "../types";

interface DeploymentConsoleProps {
  currentProject: ProjectDetails;
  isDeploying: boolean;
  onDeploy: (platform: string) => void;
  deployLogs: string[];
  onLaunchSimulator?: () => void;
}

export default function DeploymentConsole({
  currentProject,
  isDeploying,
  onDeploy,
  deployLogs,
  onLaunchSimulator
}: DeploymentConsoleProps) {
  const [targetPlatform, setTargetPlatform] = useState("Vercel");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Keep terminal scrolled to current logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [deployLogs]);

  const handleStartDeploy = () => {
    onDeploy(targetPlatform);
  };

  return (
    <div id="deployment-console-container" className="flex-1 flex flex-col lg:flex-row h-full gap-6">
      
      {/* Platform configuration panel */}
      <div className="w-full lg:w-80 flex flex-col gap-5 select-none">
        <div className="bg-[#0F0F11] p-5 border border-slate-800 rounded-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Hosting Target
          </h3>

          <div id="platform-selectors" className="space-y-3 mb-5">
            {["Vercel", "Netlify", "Cloudflare Pages"].map((platform) => {
              const isSelected = targetPlatform === platform;
              return (
                <button
                  key={platform}
                  id={`select-platform-${platform.toLowerCase().replace(" ", "-")}`}
                  onClick={() => !isDeploying && setTargetPlatform(platform)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-950/30 border-blue-500 text-blue-400"
                      : "bg-[#16161A]/40 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                  disabled={isDeploying}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-600"}`}></span>
                    {platform}
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>

          <button
            id="trigger-deploy-btn"
            onClick={handleStartDeploy}
            disabled={isDeploying}
            className={`w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 cursor-pointer ${
              isDeploying ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isDeploying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Compiling Node Server...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 -rotate-45 hover:scale-115 transition-all duration-300 animate-bounce" style={{ animationDuration: "3s" }} />
                Trigger Live Deployment
              </>
            )}
          </button>
        </div>

          {/* Deploy Stats Details card */}
        <div className="bg-[#0F0F11] p-5 border border-slate-800 rounded-xl text-slate-400 text-xs space-y-3">
          <span className="text-[10px] font-bold font-mono uppercase text-slate-500 block mb-2 tracking-widest">
            SYSTEM ARCHITECT SPECIFICATIONS
          </span>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Server Framework</span>
            <span className="text-slate-200 font-mono">Express.js (Node)</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Client Framework</span>
            <span className="text-slate-200 font-mono">NextTS / React 19</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Database provider</span>
            <span className="text-slate-200 font-mono">Supabase SQL Pool</span>
          </div>
          <div className="flex justify-between">
            <span>Serverless Edge Config</span>
            <span className="text-slate-200 font-mono">Vite Assets Proxy</span>
          </div>
        </div>
      </div>

      {/* Deploy console log terminal */}
      <div className="flex-1 flex flex-col bg-[#0F0F11] border border-slate-800 rounded-xl overflow-hidden min-h-[380px] shadow-2xl">
        <div className="bg-[#16161A] px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
          <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            Build Terminal Output
          </span>
          <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/60 font-mono text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
            <span className="h-1 text-emerald-400 w-1 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE CONSOLE
          </span>
        </div>

        {/* terminal lines area */}
        <div id="deployment-terminal-lines" className="flex-1 p-5 bg-[#0A0A0B] font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 leading-relaxed min-h-[220px]">
          {deployLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 font-mono py-16">
              <Terminal className="h-10 w-10 text-slate-800 mb-3" />
              <span>TERMINAL READY. TRIGGER DEPLOY TO STREAM ACTIVE RUNTIME COMPILER STATUS.</span>
            </div>
          ) : (
            deployLogs.map((log, idx) => {
              const isSuccess = typeof log === "string" && (log.includes("SUCCESSFUL") || log.includes("✅") || log.includes("live"));
              return (
                <div 
                  key={idx} 
                  className={`${isSuccess ? "text-emerald-400 font-semibold" : "text-slate-350"}`}
                >
                  <span className="text-blue-500 mr-2">&gt;</span>
                  {log}
                </div>
              );
            })
          )}
          <div ref={terminalBottomRef} />
        </div>

        {/* active deployment dashboard at the bottom */}
        {currentProject.deployments && currentProject.deployments.length > 0 && (
          <div className="bg-[#16161A] p-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-200 font-semibold block leading-none">
                  Live URL generated (Production)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Deployed successfully to {currentProject.deployments[0].platform}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                id="terminal-live-redirect-link"
                href={currentProject.deployments[0].liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/20 max-w-full truncate whitespace-nowrap"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Live Deployment
              </a>

              {onLaunchSimulator && (
                <button
                  onClick={onLaunchSimulator}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900/20 cursor-pointer whitespace-nowrap"
                  title="If the redirect link doesn't open due to popup blockers, run the in-app interactive simulation."
                >
                  <Monitor className="h-3.5 w-3.5 text-indigo-200" />
                  Simulate Live App In-App
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
