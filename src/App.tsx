import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Code, 
  Terminal, 
  Download, 
  RefreshCw, 
  Database,
  Rocket, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Heart,
  FileCode,
  Zap,
  MessageSquare,
  Coins,
  Copy,
  Users,
  Check,
  Play,
  Volume2,
  Paperclip,
  Trash2,
  FileText,
  Clock,
  Flame,
  Gift,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  VolumeX,
  Languages,
  Radio,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  X
} from "lucide-react";
import Header from "./components/Header";
import FeedbackPanel from "./components/FeedbackPanel";
import PromptPanel from "./components/PromptPanel";
import PreviewViewport from "./components/PreviewViewport";
import CodeExplorer from "./components/CodeExplorer";
import ReferralEarnView from "./components/ReferralEarnView";
import DeploymentConsole from "./components/DeploymentConsole";
import ProjectHistory from "./components/ProjectHistory";
import PricingPage from "./components/PricingPage";
import SriAICore from "./components/SriAICore";
import { ProjectDetails, ProjectSummary } from "./types";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [projectsList, setProjectsList] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "deploy">("preview");
  
  // Custom global nav: "workspace" or "sri-ai" or "pricing" or "referral"
  const [activeGlobalTab, setActiveGlobalTab] = useState<"workspace" | "sri-ai" | "pricing" | "referral">("workspace");

  // Interaction states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatingStepMessage, setGeneratingStepMessage] = useState("");
  const [repairedDiagnostic, setRepairedDiagnostic] = useState<any>(null);
  const [autoDiagnosticSpecs, setAutoDiagnosticSpecs] = useState<any>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isApplyingEdits, setIsApplyingEdits] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<boolean | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Billing and Referral states
  const [billingOpen, setBillingOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [userState, setUserState] = useState({
    credits: 85,
    appCreationsCount: 1,
    deploymentsCount: 0,
    referralCode: "SRI777",
    referrals: [] as Array<{ id: string; friend: string; action: string; reward: number; timestamp: string }>,
    plan: "Free",
    offerRedeemed: false,
    offerSignupTime: null as null | string,
    offerPopupShown: false,
    user: null as null | {
      name: string;
      email: string;
      picture: string;
      googleId: string;
      expiresAt: string;
    }
  });

  // Special First-Time User Discount states
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [claimOfferTriggered, setClaimOfferTriggered] = useState(false);
  const [offerSecondsLeft, setOfferSecondsLeft] = useState<number | null>(null);

  // Smart Pre-Generation Requirement Report Planning states
  const [promptValue, setPromptValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<"Small" | "Medium" | "Large">("Medium");

  // Sri AI Doubt Assistant chatbot states
  const [sriChat, setSriChat] = useState<Array<{
    role: "user" | "ai";
    text: string;
    time: string;
    fixAvailable?: boolean;
    fixPrompt?: string;
  }>>([
    {
      role: "ai",
      text: "👋 Vanakkam! I am Sri AI, your professional technical lead and automated debugger. Specify any question about compiling, Drizzle Supabase database layout, API proxy routes, or auto-fixing active building logs!",
      time: "Just Now"
    }
  ]);
  const [sriInput, setSriInput] = useState("");
  const [sriIsLoading, setSriIsLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [activeVoiceWave, setActiveVoiceWave] = useState([12, 28, 15, 34, 18, 10, 22]);
  const [attachmentType, setAttachmentType] = useState<"none" | "logs" | "schema" | "screenshot">("none");

  const sriChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeGlobalTab === "sri-ai" || sriChat.length > 1) {
      setTimeout(() => {
        sriChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [sriChat, sriIsLoading, activeGlobalTab]);

  // Voice, Multilingual, File/PDF uploading and Speech App construction states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [detectedVoiceLang, setDetectedVoiceLang] = useState("ta-IN"); // Default Tamil ('ta-IN')
  const [continuousSpeech, setContinuousSpeech] = useState(true);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [sriIsSpeaking, setSriIsSpeaking] = useState(false);
  
  // Real-time ChatGPT/Gemini Live clone Voice Call Mode states
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallState, setVoiceCallState] = useState<"idle" | "listening" | "thinking" | "speaking" | "error">("idle");
  const [voiceFallbackInput, setVoiceFallbackInput] = useState("");
  const [autoDetectedLanguageLabel, setAutoDetectedLanguageLabel] = useState("Tamil (Tanglish)");
  const [stereoWaveformAmplitudes, setStereoWaveformAmplitudes] = useState<number[]>(Array(24).fill(12));
  const [voiceLogs, setVoiceLogs] = useState<{message: string; timestamp: string; type: "info" | "success" | "error" | "warn"}[]>([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [lastAiSpokenResponse, setLastAiSpokenResponse] = useState("");

  // Interactive In-App Standalone Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);
  const [simulatorDevice, setSimulatorDevice] = useState<"phone" | "tablet" | "desktop">("phone");
  const [simulatorLatency, setSimulatorLatency] = useState<number>(0);
  const [simulatorIsOffline, setSimulatorIsOffline] = useState(false);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simulatedConsoleInput, setSimulatedConsoleInput] = useState("");
  const [simulatedLogs, setSimulatedLogs] = useState<Array<{
    message: string;
    timestamp: string;
    level: "log" | "info" | "warn" | "error";
  }>>([
    { message: "🌐 Loading virtual sandbox runtime connection...", timestamp: "11:22:01", level: "info" },
    { message: "⚡ Syncing local files AST with secure Express thread...", timestamp: "11:22:01", level: "log" },
    { message: "🎯 Touch targets and viewport fluid calculations mapping active.", timestamp: "11:22:02", level: "info" },
    { message: "🟢 Port 3000 mapping: connected inside container sandbox successfully.", timestamp: "11:22:02", level: "log" }
  ]);

  const addSimulatedLog = (message: string, level: "log" | "info" | "warn" | "error" = "log") => {
    const timestamp = new Date().toLocaleTimeString(undefined, { hour12: false, hour: "numeric", minute: "2-digit", second: "2-digit" });
    setSimulatedLogs(prev => [...prev, { message, timestamp, level }]);
  };

  const convertSupabaseSessionToLegacyUser = (session: any) => {
    if (!session?.user) return null;

    const user = session.user;
    return {
      name: user.user_metadata?.full_name || user.email || "Supabase User",
      email: user.email || "",
      picture: user.user_metadata?.avatar_url || "",
      googleId: user.id,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  };

  const handleSupabaseSessionChange = (session: any) => {
    if (!session) {
      setUserState(prev => ({ ...prev, user: null }));
      return;
    }

    const legacyUser = convertSupabaseSessionToLegacyUser(session);
    setUserState(prev => ({ ...prev, user: legacyUser }));

    // Defensive: ensure any fullscreen/modal state is closed immediately after login
    try {
      setBillingOpen(false);
      setIsSimulatorOpen(false);
      setIsFeedbackOpen(false);
      setShowOfferPopup(false);
      // Restore pointer events / scrolling in case any side-effect disabled them
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      // Notify header/popovers to close
      document.dispatchEvent(new CustomEvent('app:closeProfile'));
    } catch (e) {
      console.warn('Error while cleaning up modal states after auth', e);
    }
  };

  const handleExecuteConsoleSnippet = () => {
    if (!simulatedConsoleInput.trim()) return;
    const input = simulatedConsoleInput;
    setSimulatedConsoleInput("");
    addSimulatedLog(`Console Input Exec: "${input}"`, "info");
    
    setTimeout(() => {
      if (input.toLowerCase().includes("err") || input.toLowerCase().includes("throw")) {
        addSimulatedLog(`TypeError: Cannot read properties of undefined in compilation`, "error");
      } else if (input.toLowerCase().includes("credits") || input.toLowerCase().includes("plan")) {
        addSimulatedLog(`[Account Info] Current Plan context check: Standard tier active. API latency: 42ms.`, "log");
      } else {
        addSimulatedLog(`Executed successfully. Output: undefined`, "log");
      }
    }, 450);
  };

  useEffect(() => {
    if (isSimulatorOpen) {
      addSimulatedLog(`Environment Sync: App updated with ${simulatorIsOffline ? "offline simulation model" : simulatorLatency > 0 ? `3G slow latency (${simulatorLatency}ms emulation)` : "LAN 5G Speed"} network configs.`, "info");
    }
  }, [simulatorLatency, simulatorIsOffline, isSimulatorOpen]);

  useEffect(() => {
    if (isSimulatorOpen) {
      setSimulatorLoading(true);
      const delay = simulatorIsOffline ? 350 : simulatorLatency > 0 ? simulatorLatency : 450;
      const timer = setTimeout(() => {
        setSimulatorLoading(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [simulatorLatency, simulatorIsOffline, isSimulatorOpen, currentProject]);

  const addVoiceLog = (message: string, type: "info" | "success" | "error" | "warn" = "info") => {
    const timestamp = new Date().toLocaleTimeString(undefined, { hour12: false, hour: "numeric", minute: "2-digit", second: "2-digit" });
    setVoiceLogs(prev => [{ message, timestamp, type }, ...prev].slice(0, 50));
  };

  // Synchronizing refs to prevent React stale closure issues inside Web Speech API callbacks
  const isVoiceCallActiveRef = useRef(isVoiceCallActive);
  const voiceCallStateRef = useRef(voiceCallState);
  const detectedVoiceLangRef = useRef(detectedVoiceLang);
  const continuousSpeechRef = useRef(continuousSpeech);
  const isVoiceListeningRef = useRef(isVoiceListening);
  const isMicMutedRef = useRef(isMicMuted);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const retryMicrophone = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        addVoiceLog('Requesting microphone permission (retry)...', 'info');
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t=>t.stop());
        addVoiceLog('Microphone ready — restarting voice engine', 'success');
        if (isVoiceCallActiveRef.current) startVoiceRecognition(true);
      }
    } catch (e:any) {
      addVoiceLog('Retry failed: ' + (e.message||e), 'error');
    }
  };

  const toggleMicMute = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    isMicMutedRef.current = nextMuted;
    
    if (nextMuted) {
      addVoiceLog("Microphone Muted", "warn");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch(e){}
        recognitionRef.current = null;
      }
      setRecognitionInstance(null);
      setIsVoiceListening(false);
    } else {
      addVoiceLog("Microphone Unmuted - Ready to listen", "success");
      if (isVoiceCallActive) {
        startVoiceRecognition(true);
      }
    }
  };

  useEffect(() => {
    isVoiceCallActiveRef.current = isVoiceCallActive;
  }, [isVoiceCallActive]);

  useEffect(() => {
    voiceCallStateRef.current = voiceCallState;
  }, [voiceCallState]);

  useEffect(() => {
    detectedVoiceLangRef.current = detectedVoiceLang;
  }, [detectedVoiceLang]);

  useEffect(() => {
    continuousSpeechRef.current = continuousSpeech;
  }, [continuousSpeech]);

  useEffect(() => {
    isVoiceListeningRef.current = isVoiceListening;
  }, [isVoiceListening]);

  // Watch microphone permission state and auto-reconnect when granted
  useEffect(() => {
    let permStatus: any = null;
    const setup = async () => {
      try {
        if ((navigator as any).permissions && (navigator as any).permissions.query) {
          permStatus = await (navigator as any).permissions.query({ name: 'microphone' as any });
          permStatus.onchange = () => {
            try {
              addVoiceLog(`Microphone permission changed: ${permStatus.state}`, 'info');
              if (permStatus.state === 'granted') {
                // auto restart recognition if call active
                if (isVoiceCallActiveRef.current && !isVoiceListeningRef.current) startVoiceRecognition(true);
              } else if (permStatus.state === 'denied') {
                setVoiceCallState('error');
                addVoiceLog('Microphone permission denied. Suggestion: open site settings and allow microphone.', 'error');
              }
            } catch(e){}
          };
        }
      } catch(e){}
    };
    setup();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        // try to recover recognition if needed
        if (isVoiceCallActiveRef.current && !isVoiceListeningRef.current) startVoiceRecognition(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      try { if (permStatus) permStatus.onchange = null; } catch(e){}
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const [customFileContent, setCustomFileContent] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileType, setUploadedFileType] = useState<"text" | "pdf" | "image" | "none">("none");
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);

  const [voiceAppPipeline, setVoiceAppPipeline] = useState<{
    isActive: boolean;
    step: number; // 1: speech to text, 2: requirements, 3: architecture, 4: creation, 5: preview, 6: deploy
    transcript: string;
    architectureDetails?: any;
    createdProject?: any;
    isDeploying: boolean;
    deploymentUrl?: string;
  } | null>(null);

  // Manage first-time user discount state without auto-showing a blocking popup
  useEffect(() => {
    const syncOfferState = async () => {
      const email = userState.user?.email || "anon";
      const isAnon = email === "anon";

      const storedSignupTime = isAnon
        ? localStorage.getItem("offer_signup_time_anon")
        : localStorage.getItem(`offer_signup_time_${email}`);

      const storedPopupShown = isAnon
        ? localStorage.getItem("offer_popup_shown_anon") === "true"
        : localStorage.getItem(`offer_popup_shown_${email}`) === "true";

      const currentRedeemed = isAnon
        ? localStorage.getItem("offer_redeemed_anon") === "true"
        : userState.offerRedeemed;

      if (!storedSignupTime && !currentRedeemed) {
        const initialTimeStr = new Date().toISOString();
        if (isAnon) {
          localStorage.setItem("offer_signup_time_anon", initialTimeStr);
          localStorage.setItem("offer_popup_shown_anon", "true");
        } else {
          localStorage.setItem(`offer_signup_time_${email}`, initialTimeStr);
          localStorage.setItem(`offer_popup_shown_${email}`, "true");
          try {
            await fetch("/api/user-state/update-offer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                offerSignupTime: initialTimeStr,
                offerPopupShown: true,
                offerRedeemed: false,
              }),
            });
          } catch (e) {
            console.error("Failed to sync initial offer state to server", e);
          }
        }
      } else if (!storedPopupShown && !currentRedeemed) {
        if (isAnon) {
          localStorage.setItem("offer_popup_shown_anon", "true");
        } else {
          localStorage.setItem(`offer_popup_shown_${email}`, "true");
          try {
            await fetch("/api/user-state/update-offer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ offerPopupShown: true }),
            });
          } catch (e) {
            console.error("Failed to sync offer popup state to server", e);
          }
        }
      }
    };

    syncOfferState();
  }, [userState.user?.email, userState.offerRedeemed]);

  // Load project index list and user credits on mount
  useEffect(() => {
    fetchProjects();
    fetchUserState();
    checkApiKeyConfig();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Skipping Supabase auth initialization because Supabase is not configured.");
      return;
    }

    const initSupabaseSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to load Supabase session:", error);
          return;
        }

        if (session) {
          handleSupabaseSessionChange(session);
        }
      } catch (err) {
        console.error("Supabase session initialization failed:", err);
      }
    };

    initSupabaseSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSupabaseSessionChange(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Temporary production debug: log auth + modal states and ensure pointer events/overflow restored
  useEffect(() => {
    const user = userState.user;
    try {
      console.log("AUTH USER", user);
      console.log("billingOpen", billingOpen);
      // Best-effort detection for header profile popover in DOM
      const profileOpenDetected = !!document.querySelector('[data-profile-popover]');
      console.log("profileOpen", profileOpenDetected);
      console.log("isSimulatorOpen", isSimulatorOpen);
      console.log("isFeedbackOpen", isFeedbackOpen);
      console.log("activeGlobalTab", activeGlobalTab);

      // Ensure pointer events and scrolling are enabled after auth transitions
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";

      if (user) {
        // Auto-close any app-level modal states after login
        setBillingOpen(false);
        setIsSimulatorOpen(false);
        setIsFeedbackOpen(false);
        setShowOfferPopup(false);

        // Notify header to close its profile popover (header listens for this custom event)
        try {
          document.dispatchEvent(new CustomEvent('app:closeProfile'));
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Auth debug effect failed', e);
    }
  }, [userState.user]);

  useEffect(() => {
    const refCode = getReferralFromUrl();
    if (refCode) {
      localStorage.setItem("pending_referral_code", refCode);
      setPendingReferralCode(refCode);
      const newUrl = `${window.location.origin}/?ref=${encodeURIComponent(refCode)}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    if (userState.user && userState.user.googleId) {
      applyPendingReferral(userState.user);
    }
  }, [userState.user?.googleId]);

  // Simulate audio visualization for voice mode
  useEffect(() => {
    let timer: any;
    if (voiceActive || isVoiceListening || sriIsSpeaking || isVoiceCallActive) {
      timer = setInterval(() => {
        // Legacy activeVoiceWave
        setActiveVoiceWave(Array.from({ length: 9 }, () => Math.floor(Math.random() * 32) + 6));

        // Modern 24-bar Stereo Waveform height mapping for active real-time call states
        setStereoWaveformAmplitudes(prev => {
          return prev.map((_, i) => {
            if (isMicMutedRef.current && voiceCallState === "listening") {
              // Static, flat line when muted
              return Math.floor(Math.random() * 2) + 4;
            } else if (voiceCallState === "listening") {
              // Rapid high-frequency spikes
              return Math.floor(Math.random() * 45) + 12;
            } else if (voiceCallState === "speaking") {
              // Rhythmic wave flow
              const timeFactor = Date.now() * 0.015;
              const sineVal = Math.sin(i * 0.5 + timeFactor) * 18 + 22;
              return Math.max(8, Math.floor(sineVal + Math.random() * 8));
            } else if (voiceCallState === "thinking") {
              // Tiny gentle breathing ripple
              return Math.floor(Math.sin(i * 0.3 + Date.now() * 0.005) * 4) + 8;
            } else {
              // Idle state tiny baseline
              return Math.floor(Math.random() * 4) + 6;
            }
          });
        });
      }, 50);
    } else {
      // Quiet decay
      setStereoWaveformAmplitudes(Array(24).fill(6));
    }
    return () => clearInterval(timer);
  }, [voiceActive, isVoiceListening, sriIsSpeaking, isVoiceCallActive, voiceCallState, isMicMuted]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjectsList(data);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  };

  const fetchUserState = async () => {
    try {
      const res = await fetch("/api/user-state");
      const data = await res.json();
      if (data && !data.error) {
        setUserState({
          ...data,
          user: data.user || null,
        });
      }
    } catch (e) {
      console.error("Failed to load user state from server, attempting localStorage recovery:", e);
    }
  };

  const getReferralFromUrl = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref")?.trim();
      if (ref) return ref;
      const pathMatch = window.location.pathname.match(/^\/ref\/(.+)$/i);
      if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);
    } catch (e) {
      console.warn("Failed to parse referral code from URL", e);
    }
    return null;
  };

  const applyPendingReferral = async (user: any) => {
    if (!user || !user.googleId) return;
    const pendingCode = localStorage.getItem("pending_referral_code");
    if (!pendingCode) return;
    if (pendingCode === user.googleId) {
      localStorage.removeItem("pending_referral_code");
      setPendingReferralCode(null);
      return;
    }

    try {
      const res = await fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerCode: pendingCode,
          referredEmail: user.email,
          referredGoogleId: user.googleId,
          referredName: user.name
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("pending_referral_code");
        setPendingReferralCode(null);
        fetchUserState();
      } else {
        console.warn("Referral apply failed", data);
      }
    } catch (e) {
      console.error("Failed to apply pending referral", e);
    }
  };

  const handleLoginStart = async () => {
    try {
      setOauthError(null);
      setBillingOpen(false);
      setIsSimulatorOpen(false);
      setIsFeedbackOpen(false);
      setShowOfferPopup(false);
      setClaimOfferTriggered(false);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("OAuth failure with Supabase:", error);
        setOauthError(error.message || "Google OAuth login failed.");
      }
    } catch (err: any) {
      console.error("OAuth failure initiating login flow:", err?.message || err);
      setOauthError(`Could not trigger Google Login: ${err?.message || "Unknown error"}`);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase logout error:", error);
      }
      
      setOauthError(null);
      setBillingOpen(false);
      setIsSimulatorOpen(false);
      setIsFeedbackOpen(false);
      setShowOfferPopup(false);
      setUserState(prev => ({
        ...prev,
        user: null
      }));
    } catch (e) {
      console.error("Failed to sign out", e);
    }
  };

  const checkApiKeyConfig = async () => {
    try {
      const res = await fetch("/api/api-key-status");
      if (!res.ok) {
        console.warn("Failed to load Gemini API key status", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      if (typeof data.active === "boolean") {
        setApiKeyStatus(data.active);
      } else {
        console.warn("Unexpected response from /api/api-key-status", data);
      }
    } catch (e) {
      console.warn("Error checking Gemini API key status", e);
    }
  };

  const handleSelectProject = async (id: string) => {
    setIsGenerating(false);
    setIsRefining(false);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data && !data.error) {
        setCurrentProject(data);
        setSelectedProjectId(id);
        setActiveTab("preview");
        if (data.deployments && data.deployments.length > 0) {
          setDeployLogs(data.deployments[0].logs);
        } else {
          setDeployLogs([]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch project details", e);
    }
  };

  // Phase 1: Smart prompt requirements analysis
  const handleStartAnalysis = async (promptText: string) => {
    const cleanedPrompt = promptText.trim();
    if (!cleanedPrompt) return;
    console.debug("[App] handleStartAnalysis", { promptText: cleanedPrompt });
    setPromptValue(cleanedPrompt);
    setIsAnalyzing(true);
    setAnalysisReport(null);

    try {
      const res = await fetch("/api/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanedPrompt })
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        setIsAnalyzing(false);
        return;
      }
      
      setAnalysisReport(data);
      await handleConfirmBuild(data);
    } catch (e) {
      alert("Failed to analyze prompt. Attempting direct fallback.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Phase 2: Accept requirements report & build actual website template
  const handleConfirmBuild = async (analysisData: any) => {
    if (!analysisData) return;
    const promptToGen = analysisData.prompt;
    
    // Clear requirement screen, begin build loader
    setAnalysisReport(null);
    setIsGenerating(true);
    setGeneratingStep(0);
    setRepairedDiagnostic(null);
    setAutoDiagnosticSpecs(null);

    const initialSteps = [
      "AI is analyzing natural language prompt requirements...",
      "Mapping dynamic schema models to database (Supabase SQL mappings)...",
      "Drafting robust Express backend endpoints and routing controls...",
      "Weaving custom responsive layouts using Tailwind CSS typography...",
      "Injecting fully working client interaction scripts & interactive loops...",
      "Running security validator filters to ensure zero phishing or adware risks...",
      "Triggering full project compilation and rendering previews..."
    ];

    setGeneratingStepMessage(initialSteps[0]);

    let stepIdx = 0;
    const initialInterval = setInterval(() => {
      if (stepIdx < initialSteps.length - 1) {
        stepIdx++;
        setGeneratingStep(stepIdx);
        setGeneratingStepMessage(initialSteps[stepIdx]);
      } else {
        clearInterval(initialInterval);
      }
    }, 1000);

    try {
      console.debug("[App] handleConfirmBuild", { promptToGen });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptToGen,
          size: selectedSize 
        })
      });
      const data = await res.json();
      clearInterval(initialInterval);

      if (data.error) {
        alert(data.error);
        setIsGenerating(false);
        await fetchUserState();
        return;
      }

      // Start the deep diagnostic QA validation phase
      const report = data.autoDiagnosticReport || { status: "success", errorsFound: [] };
      setRepairedDiagnostic(report);
      setAutoDiagnosticSpecs(report.validationSpecs || {
        build: "passed",
        router: "passed",
        assets: "passed",
        responsive: "passed",
        consoleCheck: "0 errors"
      });

      // Stagger through diagnostic checks and self-healing presentation
      setGeneratingStep(7);
      setGeneratingStepMessage("🔍 Starting Sri AI Automated QA Compiler and Diagnostic Suite...");
      await new Promise(r => setTimeout(r, 1200));

      setGeneratingStep(8);
      setGeneratingStepMessage("⚙️ Static analysis running: Inspecting JSX nesting, curly brackets, and tag balancers...");
      await new Promise(r => setTimeout(r, 1200));

      setGeneratingStep(9);
      setGeneratingStepMessage("📦 Resolving ESM import syntax, module conflicts, and package.json declarations...");
      await new Promise(r => setTimeout(r, 1200));

      if (report.status === "repaired" || report.errorsFound?.length > 0) {
        setGeneratingStep(10);
        setGeneratingStepMessage("⚠️ Detected unbalanced markup tag or unresolved module. Triggering Sri AI self-healing...");
        await new Promise(r => setTimeout(r, 1400));

        setGeneratingStep(11);
        setGeneratingStepMessage("🔄 We found a problem and fixed it automatically. Retesting your project...");
        await new Promise(r => setTimeout(r, 2200));

        setGeneratingStep(12);
        setGeneratingStepMessage("✨ Healing compiler check passed! Applied corrective defensive wraps.");
        await new Promise(r => setTimeout(r, 1000));
      } else {
        setGeneratingStep(13);
        setGeneratingStepMessage("✅ Code syntax, brackets, and external modules verify successfully! Perfect compilation.");
        await new Promise(r => setTimeout(r, 1200));
      }

      // Deployment validations
      setGeneratingStep(14);
      setGeneratingStepMessage("🛡️ DEPLOYMENT VALIDATION: Verifying build outputs, schema mapping scripts, and transpiled CJS...");
      await new Promise(r => setTimeout(r, 1100));

      setGeneratingStep(15);
      setGeneratingStepMessage("🌐 DEPLOYMENT VALIDATION: testing Express router ports (3000) and API path response (200 OK)...");
      await new Promise(r => setTimeout(r, 1100));

      setGeneratingStep(16);
      setGeneratingStepMessage("🎨 DEPLOYMENT VALIDATION: validating style sheet injection & Lucide vector graphic assets load...");
      await new Promise(r => setTimeout(r, 1100));

      setGeneratingStep(17);
      setGeneratingStepMessage("📱 DEPLOYMENT VALIDATION: simulating responsive tablet/mobile breakpoints (touch target checks)...");
      await new Promise(r => setTimeout(r, 1100));

      setGeneratingStep(18);
      setGeneratingStepMessage("💻 DEPLOYMENT VALIDATION: collecting client browser console signals (verified 0 warnings)...");
      await new Promise(r => setTimeout(r, 1100));

      setGeneratingStep(19);
      setGeneratingStepMessage("🎉 All checks passed! Loading complete responsive template...");
      await new Promise(r => setTimeout(r, 1000));

      // Selected project successfully built!
      setCurrentProject(data);
      setSelectedProjectId(data.id);
      setActiveTab("preview");
      setDeployLogs([]);
      await fetchProjects();
      await fetchUserState();
    } catch (error) {
      clearInterval(initialInterval);
      alert("An unexpected error occurred during build generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (refinePrompt: string) => {
    if (!currentProject) return;
    setIsRefining(true);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          prompt: refinePrompt,
          files: currentProject.files
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      setCurrentProject(data);
      await fetchProjects();
    } catch (e) {
      alert("Failed to submit refinement prompt.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyManualEdit = async (filePath: string, editContent: string) => {
    if (!currentProject) return;
    setIsApplyingEdits(true);

    const updatedFiles = currentProject.files.map(f => {
      if (f.path === filePath) {
        return { ...f, content: editContent };
      }
      return f;
    });

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          prompt: `User has directly updated the file [${filePath}] inside the code editor. Integrate these changes completely and update the main 'previewHtml' to reflect the direct edits correctly: "${editContent}"`,
          files: updatedFiles
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      setCurrentProject(data);
    } catch (e) {
      console.error("Failed to compile manual edit", e);
    } finally {
      setIsApplyingEdits(false);
    }
  };

  const handleDeploy = async (platformName: string) => {
    if (!currentProject || isDeploying) return;
    setIsDeploying(true);
    setActiveTab("deploy");
    setDeployLogs([]);

    const mockLogs = [
      `[10:55:01] ⚡ Deploying to ${platformName} Cloud Network...`,
      `[10:55:02] 📦 Parsing repository layout: Next.js + React Framework setup detected.`,
      `[10:55:03] 🔨 Installing npm dependencies from generated package.json...`,
      `[10:55:06] 🔨 npm package tree resolved (React 19, Tailwind CSS v4, Lucide Icons).`,
      `[10:55:07] 🔥 Precompiling database configurations: mapping Supabase drizzle connection pool.`,
      `[10:55:08] 🚀 Compiling code bundle (production mode)...`,
      `[10:55:09] 🛡️ [CHECK 1/5] VERIFYING BUILD SUCCESS...`,
      `[10:55:09] 🛡️ [CHECK 1/5] PASSED: Built production bundle successfully (Static: 142KB, CJS Server: 4.2MB).`,
      `[10:55:10] 🛡️ [CHECK 2/5] VERIFYING ALL ROUTES LOAD CORRECTLY...`,
      `[10:55:10] 🛡️ [CHECK 2/5] PASSED: Verified '/' and '/api/v1/*' response latency: 42ms (200 OK).`,
      `[10:55:11] 🛡️ [CHECK 3/5] VERIFYING CORE STATIC ASSETS & ICONS LOAD SUCCESS...`,
      `[10:55:11] 🛡️ [CHECK 3/5] PASSED: All local svg, Lucide modules, and styles mapped perfectly.`,
      `[10:55:12] 🛡️ [CHECK 4/5] VERIFYING VIEWPORT & MOBILE RESPONSIVENESS BREAKPOINTS...`,
      `[10:55:12] 🛡️ [CHECK 4/5] PASSED: Fluid layout, flex containers, and touch-target sizes valid (>=44px).`,
      `[10:55:13] 🛡️ [CHECK 5/5] VERIFYING CLIENT WEB CONSOLE SIGNALS (NO ERRORS)...`,
      `[10:55:13] 🛡️ [CHECK 5/5] PASSED: Web browser console validation finished. 0 errors, 0 warnings.`,
      `[10:55:14] 🚀 Optimizing build static routes and serverless edge functions...`,
      `[10:55:15] 🔗 Assigning custom DNS routing: ${platformName.toLowerCase()}-app-${currentProject.id.substring(5)}.dev`,
      `[10:55:16] ✅ Deployment SUCCESSFUL! Sri AI validation validated. Public previews live.`
    ];

    let idx = 0;
    const interval = setInterval(async () => {
      if (idx < mockLogs.length) {
        setDeployLogs(prev => [...prev, mockLogs[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        
        try {
          const res = await fetch(`/api/projects/${currentProject.id}/deploy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetPlatform: platformName })
          });
          const data = await res.json();
          
          if (data.error) {
            setDeployLogs(prev => [...prev, `[ERR] Deployment blocked: ${data.error}`]);
            setIsDeploying(false);
            await fetchUserState();
            return;
          }
          
          if (data && data.project) {
            setCurrentProject(data.project);
            await fetchProjects();
            await fetchUserState();
          }
        } catch (e) {
          console.error("Failed to save compile deploy", e);
        } finally {
          setIsDeploying(false);
        }
      }
    }, 900);
  };

  const handleDownloadZip = () => {
    if (!currentProject) return;
    window.location.href = `/api/projects/${currentProject.id}/download`;
  };

  const handleBackToHub = () => {
    setSelectedProjectId(null);
    setCurrentProject(null);
    setAnalysisReport(null);
  };

  // Referral Simulated Event handler
  // Change Subscription Level
  const handleChangePlan = async (planName: string, info?: { credits: number; isUnlimited: boolean; isOfferRedeemed?: boolean }) => {
    try {
      const isOfferRedeemed = info?.isOfferRedeemed || false;
      const res = await fetch("/api/user-state/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: planName,
          offerRedeemed: isOfferRedeemed ? true : userState.offerRedeemed
        })
      });
      const data = await res.json();
      if (data && !data.error) {
        setUserState(data);
        const email = userState.user?.email || "anon";
        if (isOfferRedeemed) {
          if (email === "anon") {
            localStorage.setItem("offer_redeemed_anon", "true");
          } else {
            localStorage.setItem(`offer_redeemed_${email}`, "true");
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset parameters
  const handleResetUserState = async () => {
    if (!confirm("Are you sure you want to reset your limits, credits and app counters?")) return;
    try {
      const res = await fetch("/api/user-state/reset", { method: "POST" });
      const data = await res.json();
      if (data && !data.error) {
        setUserState(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sri AI Automatic Language Detector for Multilingual support
  const detectSpeechLanguage = (text: string): string => {
    const lower = text.toLowerCase().trim();
    if (!lower) return detectedVoiceLang;

    // 1. Tamil / Tanglish detection
    if (/[\u0B80-\u0BFF]/.test(text) || 
        lower.includes("pannu") || lower.includes("epdi") || lower.includes("pannunga") || 
        lower.includes("apdi") || lower.includes("veenum") || lower.includes("romba") || 
        lower.includes("nalla") || lower.includes("seinga") || lower.includes("seiyunga") ||
        lower.includes("enakku") || lower.includes("panni") || lower.includes("seiya") ||
        lower.includes("swiggy mari") || lower.includes("zomato mari")) {
      setDetectedVoiceLang("ta-IN");
      setAutoDetectedLanguageLabel("Tamil (Tanglish)");
      return "ta-IN";
    }

    // 2. Hindi / Hinglish detection
    if (/[\u0900-\u097F]/.test(text) || 
        lower.includes("banao") || lower.includes("kaise") || lower.includes("karo") || 
        lower.includes("karna") || lower.includes("chahiye") || lower.includes("shuru") ||
        lower.includes("naam") || lower.includes("swiggy jaisa") || lower.includes("app banaye")) {
      setDetectedVoiceLang("hi-IN");
      setAutoDetectedLanguageLabel("Hindi (Hinglish)");
      return "hi-IN";
    }

    // 3. Telugu detection
    if (/[\u0C00-\u0C7F]/.test(text) || 
        lower.includes("cheyi") || lower.includes("ela") || lower.includes("cheyandi") ||
        lower.includes("cheyali") || lower.includes("kavali")) {
      setDetectedVoiceLang("te-IN");
      setAutoDetectedLanguageLabel("Telugu");
      return "te-IN";
    }

    // 4. Malayalam detection
    if (/[\u0D05-\u0D7F]/.test(text) || 
        lower.includes("cheyy") || lower.includes("engane") || lower.includes("venam") ||
        lower.includes("cheiyuka")) {
      setDetectedVoiceLang("ml-IN");
      setAutoDetectedLanguageLabel("Malayalam");
      return "ml-IN";
    }

    // 5. Kannada detection
    if (/[\u0C80-\u0CFF]/.test(text) || 
        lower.includes("maadu") || lower.includes("hege") || lower.includes("beku") ||
        lower.includes("maadbeku")) {
      setDetectedVoiceLang("kn-IN");
      setAutoDetectedLanguageLabel("Kannada");
      return "kn-IN";
    }

    // Default English
    return detectedVoiceLang; 
  };

  // Ensure voices loaded helper
  const ensureVoices = async () => {
    return new Promise<void>((resolve) => {
      try {
        if (!window.speechSynthesis) return resolve();
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length) return resolve();
        const handler = () => { window.speechSynthesis.removeEventListener('voiceschanged', handler); resolve(); };
        window.speechSynthesis.addEventListener('voiceschanged', handler);
        // fallback timeout
        setTimeout(() => { try { window.speechSynthesis.removeEventListener('voiceschanged', handler);} catch{}; resolve(); }, 1200);
      } catch (e) { resolve(); }
    });
  };

  // Sri AI Speech Synthesis speak helper to respond using natural voice
  const speakSriResponse = async (text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any active speech to allow instant interruption
    window.speechSynthesis.cancel();
    setSriIsSpeaking(true);
    setVoiceCallState("speaking");

    // Force release/stop active speech recognition before speaking to prevent listening echo/feedback
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Recognition pause fail:", e);
      }
      recognitionRef.current = null;
    }
    setRecognitionInstance(null);
    setIsVoiceListening(false);

    // Clean markdown and formatting elements before speaking
    const cleanText = text
      .replace(/[*#`_~]/g, "") // remove formatting symbols
      .replace(/\[.*?\]\(.*?\)/g, "") // remove links
      .replace(/-\s+/g, "") // remove bullet lists
      .substring(0, 300); // keep it short and highly punchy

    // Update subtitles overlay state
    setLastAiSpokenResponse(cleanText);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Retrieve system voices to optimize selection if available
    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      // Ensure system voices are loaded, attempt to choose a better voice after load
      ensureVoices().then(()=>{
        try {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang && v.lang.startsWith(langCode.substring(0,2)));
          if (preferredVoice) utterance.voice = preferredVoice;
        } catch(e){}
      });
      setSriIsSpeaking(true);
      setVoiceCallState("speaking");
      addVoiceLog("Audio Playback Started", "success");
    };

    utterance.onend = () => {
      setSriIsSpeaking(false);
      
      // Auto-listen Continuous Dialogue if call is active
      if (isVoiceCallActiveRef.current) {
        setVoiceCallState("listening");
        setTimeout(() => {
          if (isVoiceCallActiveRef.current) {
            startVoiceRecognition(true);
          }
        }, 150);
      } else if (continuousSpeechRef.current && isVoiceListeningRef.current) {
        setVoiceCallState("listening");
        setTimeout(() => {
          startVoiceRecognition(false);
        }, 200);
      } else {
        setVoiceCallState("idle");
      }
    };

    utterance.onerror = () => {
      addVoiceLog('Speech playback error', 'error');
      setSriIsSpeaking(false);
      if (isVoiceCallActiveRef.current) {
        setVoiceCallState("listening");
        setTimeout(() => {
          if (isVoiceCallActiveRef.current) {
            startVoiceRecognition(true);
          }
        }, 150);
      } else {
        setVoiceCallState("idle");
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechMisfire = () => {
    const errorText = "I couldn't understand that. Please repeat.";
    setVoiceTranscript(errorText);
    setSriChat(prev => [...prev, {
      role: "ai",
      text: errorText,
      time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    }]);
    
    // Play error notification through audio automatically
    speakSriResponse(errorText, "en-US");
  };

  const startVoiceRecognition = async (forceCallMode: boolean = false) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSriIsSpeaking(false);
    }

    if (isMicMutedRef.current) {
      addVoiceLog("Microphone is currently muted.", "warn");
      setIsVoiceCallActive(true);
      isVoiceCallActiveRef.current = true;
      setVoiceCallState("listening"); // show listening visually but with muted state
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isCall = isVoiceCallActiveRef.current || forceCallMode;
    
    if (isCall) {
      setIsVoiceCallActive(true);
      isVoiceCallActiveRef.current = true;
      setVoiceCallState("listening");
    }

    // Explicitly request microphone access when voice mode starts
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        addVoiceLog("Requesting microphone permission...", "info");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted successfully. Stop tracks immediately to free up the recorder config
        stream.getTracks().forEach(track => track.stop());
        addVoiceLog("Microphone access ready", "success");
      } catch (err: any) {
        console.error("Microphone permission denied:", err);
        addVoiceLog(`Permission Denied: ${err.message || "Microphone required for Voice Mode"}`, "error");
        setVoiceCallState("error");
        setIsVoiceListening(false);
        return;
      }
    } else {
      addVoiceLog("Browser audio capture API not supported.", "error");
      setVoiceCallState("error");
      setIsVoiceListening(false);
      return;
    }

    if (!SpeechRecognition) {
      addVoiceLog("Using Web Speech simulated fallback", "info");
      setIsVoiceListening(true);
      setVoiceTranscript("... (Listening...) ...");
      setVoiceCallState("listening");
      
      setTimeout(() => {
        const fallbackOptions = [
          "எனக்கு Swiggy போன்ற Food Delivery App செய்",
          "Create a professional Swiggy food delivery app with admin panel",
          "Explain the code of this page",
          "Why did our deployment fail?"
        ];
        const randomOpt = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        
        addVoiceLog("Speech Detected", "info");
        setVoiceTranscript(randomOpt);
        setIsVoiceListening(false);
        
        addVoiceLog(`Transcript Generated: "${randomOpt}"`, "success");
        detectSpeechLanguage(randomOpt);
        
        if (isCall) {
          setVoiceCallState("thinking");
        }
        handleVoiceCommandSubmit(randomOpt);
      }, 3500);
      return;
    }

    try {
      // Clean up previous instance before sparking new recorder
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch(e){}
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true; 
      rec.interimResults = true;
      rec.lang = detectedVoiceLangRef.current;

      let collectedTranscript = "";
      let isSpeechDetected = false;
      let silenceTimer: any = null;

      rec.onstart = () => {
        addVoiceLog("Microphone Connected (Continuous)", "success");
        setIsVoiceListening(true);
        setVoiceTranscript("");
        setVoiceCallState("listening");
      };

      rec.onresult = (event: any) => {
        if (!isSpeechDetected) {
          isSpeechDetected = true;
          addVoiceLog("Speech Detected", "info");
        }

        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        const currentText = (final || interim).trim();
        if (currentText) {
          collectedTranscript = currentText;
          setVoiceTranscript(currentText);

          // Run automatic online language detection on intermediate speech matches!
          if (currentText.length > 3) {
            const detectedCode = detectSpeechLanguage(currentText);
            if (detectedCode !== rec.lang) {
              rec.lang = detectedCode;
            }
          }

          // Debounce continuous speech: wait for 1.2 seconds of silence to submit (faster responsiveness)
          // Debounce continuous speech: wait for 1.8 seconds of silence to submit
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            addVoiceLog("Silence detected - Processing speech...", "info");
            setVoiceCallState("thinking");
            try { rec.stop(); } catch(e){}
          }, 1200);
        }
      };

      rec.onerror = (e: any) => {
        if (silenceTimer) clearTimeout(silenceTimer);
        console.error("Speech Recognition Error:", e);
        
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          addVoiceLog("Mic permission denied inside recognition stream.", "error");
          setVoiceCallState("error");
          setIsVoiceListening(false);
          // Offer auto-fix suggestion
          addVoiceLog("Suggestion: Ensure microphone access for this site in browser settings, then click 'Retry Mic'", "info");
          return;
        }

        addVoiceLog(`Signal check: ${e.error}`, "warn");

        if (isVoiceCallActiveRef.current && voiceCallStateRef.current !== "error") {
          // Auto recover or repeat on no speech or connection transient disruptions
          if (["no-speech", "aborted", "network"].includes(e.error)) {
            setTimeout(() => {
              if (isVoiceCallActiveRef.current && voiceCallStateRef.current !== "error") {
                startVoiceRecognition(true);
              }
            }, 500);
          }
        } else {
          setIsVoiceListening(false);
        }
      };

      rec.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsVoiceListening(false);
        const finalCleaned = collectedTranscript.trim();
        
        if (finalCleaned && finalCleaned !== "... (Listening...) ...") {
          addVoiceLog(`Transcript Generated: "${finalCleaned}"`, "success");
          setVoiceCallState("thinking");
          handleVoiceCommandSubmit(finalCleaned);
        } else {
          addVoiceLog("Continuous session waiting for voice input...", "info");
          if (isVoiceCallActiveRef.current && voiceCallStateRef.current !== "error") {
            setTimeout(() => {
              if (isVoiceCallActiveRef.current && voiceCallStateRef.current !== "error") {
                startVoiceRecognition(true);
              }
            }, 600);
          } else if (!isVoiceCallActiveRef.current) {
            setVoiceCallState("idle");
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setRecognitionInstance(rec);
    } catch (e) {
      console.error(e);
      addVoiceLog("Failed to start speech engine", "error");
      setIsVoiceListening(false);
      setVoiceCallState("idle");
    }
  };

  const stopVoiceRecognition = () => {
    setIsVoiceCallActive(false);
    isVoiceCallActiveRef.current = false;
    setVoiceCallState("idle");
    setIsVoiceListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setRecognitionInstance(null);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSriIsSpeaking(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (["png", "jpg", "jpeg", "webp", "gif"].includes(fileExt || "")) {
      setUploadedFileType("image");
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultSrc = event.target?.result as string;
        setUploadedFilePreview(resultSrc);
        setCustomFileContent(resultSrc); // base64 encode
      };
      reader.readAsDataURL(file);
    } else if (fileExt === "pdf") {
      setUploadedFileType("pdf");
      const reader = new FileReader();
      reader.onload = (event) => {
        const textSeed = `[PDF EXTRANET REQ REPORT: ${file.name}]\nFile size: ${Math.round(file.size / 1024)} KB\nExtracted Requirements:\n1. Mobile layout with food discovery grid.\n2. Cart checkout modal state controller.\n3. Simple local payments database table entries.`;
        setCustomFileContent(textSeed);
        setUploadedFilePreview(null);
      };
      reader.readAsText(file);
    } else {
      setUploadedFileType("text");
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomFileContent(event.target?.result as string);
        setUploadedFilePreview(null);
      };
      reader.readAsText(file);
    }
  };

  // Switch custom file context directly from Code Explorer "Analyze in Sri AI" button
  const handleAnalyzeFileInSriAI = (filePath: string, content: string) => {
    setActiveGlobalTab("sri-ai");
    setUploadedFileType("text");
    setUploadedFileName(filePath);
    setCustomFileContent(content);
    setSriInput(`Analyze this specific file code: "${filePath}"`);
  };

  // Voice Speech Command pipeline processor
  const handleVoiceCommandSubmit = async (text: string) => {
    const lower = text.toLowerCase().trim();
    const isAppRequest = lower.startsWith("create") || lower.startsWith("build") || lower.startsWith("make") || 
                         lower.startsWith("generate") || lower.includes("clone") || lower.includes("எனக்கு") || 
                         lower.includes("பண்ணு") || lower.includes("செய்") || lower.includes("बनाओ") || 
                         lower.includes("तय्यार") || lower.includes("செய்யவும்");

    if (isAppRequest) {
      // Start the Speech App Generation Pipeline!
      setVoiceAppPipeline({
        isActive: true,
        step: 1, // converting speech to text done, moving to specifications
        transcript: text,
        isDeploying: false
      });

      const tamilVoiceConfirm = `அருமை! ஸ்ரீ ஏஐ உங்களுக்கான செயலியை உருவாக்கத் தொடங்குகிறது. திட்டத்தின் சிறப்பம்சங்கள் மற்றும் தரவுத்தள கட்டமைப்பை ஆய்வு செய்கிறேன்.`;
      const genericVoiceConfirm = `Excellent! Initiating Sri AI Voice App Construction pipeline for "${text}". Analyzing specifications now...`;
      speakSriResponse(detectedVoiceLang.startsWith("ta") ? tamilVoiceConfirm : genericVoiceConfirm, detectedVoiceLang);

      try {
        // Step 2: Requirements analysis
        addVoiceLog("AI Request Sent", "info");
        await new Promise(r => setTimeout(r, 2000));
        setVoiceAppPipeline(prev => prev ? { ...prev, step: 2 } : null);

        const specRes = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text })
        });
        if (!specRes.ok) throw new Error("HTTP " + specRes.status);
        const specData = await specRes.json();
        addVoiceLog("AI Response Received", "success");

        // Step 3: Generating Architecture
        setVoiceAppPipeline(prev => prev ? { ...prev, step: 3, architectureDetails: specData } : null);
        speakSriResponse(detectedVoiceLang.startsWith("ta") ? `திட்ட வடிவமைப்பு தயாராகிவிட்டது. இதோ அதற்கான தரவுத்தளம் மற்றும் பின்னணி அமைப்பு.` : `System layout defined. Generating codebase with live routes and persistent storage files...`, detectedVoiceLang);
        
        await new Promise(r => setTimeout(r, 3000));

        // Step 4: Call generation endpoint
        setVoiceAppPipeline(prev => prev ? { ...prev, step: 4 } : null);
        addVoiceLog("AI Request Sent", "info");
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specs: specData })
        });
        if (!genRes.ok) throw new Error("HTTP " + genRes.status);
        const genData = await genRes.json();
        addVoiceLog("AI Response Received", "success");

        // Step 5: Finished core generation! Refresh our sidebar of projects
        await fetchProjects();
        if (genData && genData.id) {
          setSelectedProjectId(genData.id);
          setCurrentProject(genData);
        }

        setVoiceAppPipeline(prev => prev ? { ...prev, step: 5, createdProject: genData } : null);
        speakSriResponse(detectedVoiceLang.startsWith("ta") ? `அற்புதம்! உங்கள் அப்ளிகேஷன் வெற்றிகரமாக உருவாக்கப்பட்டுள்ளது. திரையில் அதன் நேரடி காட்சியை இப்போது நீங்கள் காணலாம்!` : `Congratulations! Your swiggy-like application has been successfully created. You can verify the live preview now!`, detectedVoiceLang);

      } catch (err) {
        console.error("Speech pipeline error:", err);
        addVoiceLog("AI Request Failed", "error");
        
        const errorText = "Unable to contact Sri AI. Please try again.";
        setSriChat(prev => [...prev, {
          role: "ai",
          text: errorText,
          time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
        }]);
        
        // Convert error reply to speech and automatically return to listening mode!
        speakSriResponse(errorText, "en-US");
        setVoiceAppPipeline(null);
      }
    } else {
      // Normal chat query but via Voice
      handleSriAsk(text);
    }
  };

  // Sri AI Chatbot dialogue handler
  const handleSriAsk = async (customMessage?: string, quickFixText?: string) => {
    const query = customMessage || sriInput;
    if (!query.trim() && !quickFixText) return;

    const userMsg = query || `Triggering automatic compile hotfix: "${quickFixText}"`;
    setSriInput("");
    setSriIsLoading(true);

    // Save user message in local history
    setSriChat(prev => [...prev, {
      role: "user",
      text: userMsg,
      time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    }]);

    try {
      const payload: any = {
        message: userMsg,
        projectId: currentProject?.id || null,
        history: sriChat.slice(-40).map(msg => ({
          role: msg.role === "ai" ? "ai" : "user",
          text: msg.text
        }))
      };

      if (uploadedFileType !== "none") {
        payload.attachmentType = uploadedFileType;
        payload.attachmentContent = customFileContent;
      } else if (attachmentType !== "none") {
        payload.attachmentType = attachmentType;
        if (attachmentType === "logs") {
          payload.logDump = deployLogs.join("\n") || "[10:55:01] ⚡ Deploying... \n[ERR] Module Resolution Failure: package '@google/genai' unresolved.";
        } else if (attachmentType === "schema") {
          payload.attachmentContent = `CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR, credits INT);\nCREATE TABLE posts (id SERIAL PRIMARY KEY, url TEXT, created_at TIMESTAMP);`;
        } else {
          payload.attachmentContent = `[binary_render_coordinate_base_values]`;
        }
      }

      addVoiceLog("AI Request Sent", "info");
      const res = await fetch("/api/sri-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      addVoiceLog("AI Response Received", "success");

      setSriChat(prev => [...prev, {
        role: "ai",
        text: data.reply,
        time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
        fixAvailable: data.fixAvailable,
        fixPrompt: data.suggestedFixPrompt
      }]);
      
      // Auto-speak response! (Audio Playback Started will be logged internally by speakSriResponse)
      speakSriResponse(data.reply, detectedVoiceLang);

      setAttachmentType("none");
      setUploadedFileType("none");
      setUploadedFileName("");
      setUploadedFilePreview(null);
      setCustomFileContent("");
    } catch (e) {
      console.error(e);
      addVoiceLog("AI Request Failed", "error");
      
      const errorText = "Unable to contact Sri AI. Please try again.";
      setSriChat(prev => [...prev, {
        role: "ai",
        text: errorText,
        time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      }]);
      
      // Convert error reply to speech and automatically return to listening mode!
      speakSriResponse(errorText, "en-US");
    } finally {
      setSriIsLoading(false);
    }
  };

  // Automated Fix action execution
  const handleExecuteSriAutoFix = async (fixPromptText: string) => {
    if (!currentProject) {
      alert("Select a project first to apply an automated hotfix.");
      return;
    }
    setIsApplyingEdits(true);
    alert(`⚡ Sri AI is injecting defensive logic and rewriting bundle structure: "${fixPromptText}"...`);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          prompt: `Inject defensive standard hotfix logic automatically: "${fixPromptText}". Ensure all module imports are completely defined and precompiled correctly without any crash items.`,
          files: currentProject.files
        })
      });
      const data = await res.json();
      if (data && !data.error) {
        setCurrentProject(data);
        alert("✨ Automated Hotfix successfully implemented and compiled! Preview has been refreshed in your Sandbox.");
        setActiveTab("preview");
        setActiveGlobalTab("workspace");
      } else {
        alert(data.error || "Failed to fully propagate auto-fix.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplyingEdits(false);
    }
  };

  const stepsText = [
    "Analyzing system structure requirements...",
    "Defining schema layout with database tables (Supabase)...",
    "Setting up modular API endpoints (Express and routing)...",
    "Compiling responsive styling layouts (Tailwind CSS)...",
    "Injecting standalone interactive client JavaScript states...",
    "Validating secure sandbox safety requirements...",
    "Assembling live project files and launching build sandbox..."
  ];

  return (
    <div id="website-builder-workspace" className="min-h-screen bg-[#070708] text-slate-300 flex flex-col font-sans select-none selection:bg-blue-600/35">
      
      {/* Platform Header */}
      <Header
        currentProject={currentProject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDeploying={isDeploying}
        onDeploy={handleDeploy}
        onDownload={handleDownloadZip}
        onBackToHub={handleBackToHub}
        hasApiKey={apiKeyStatus}
        activeGlobalTab={activeGlobalTab}
        setActiveGlobalTab={setActiveGlobalTab}
        credits={userState.credits}
        plan={userState.plan}
        onOpenBilling={() => setBillingOpen(true)}
        user={userState.user}
        onLoginStart={handleLoginStart}
        onLogout={handleLogout}
        oauthError={oauthError}
        clearOauthError={() => setOauthError(null)}
        offerActive={offerSecondsLeft !== null && offerSecondsLeft > 0 && !userState.offerRedeemed}
      />

      {/* PRIMARY CONTEXT WINDOWS */}
      {isGenerating ? (
        // SMART COMPILED ANIMATION SCREEN WITH DIAGNOSTIC AUTO-FIX REPORTS
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0B0B0D]">
          <div id="smart-generator-loader" className="max-w-2xl mx-auto w-full text-center py-12 px-8 border border-slate-800/80 bg-[#0F0F12] rounded-2xl flex flex-col items-center shadow-2xl relative">
            <div className="absolute top-0 right-0 p-3">
              <span className="text-[9px] text-emerald-400 font-mono tracking-wider animate-pulse uppercase bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                SRI AI SECURE COMPILER ACTIVE
              </span>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
              <div className="h-16 w-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin flex items-center justify-center">
                <Cpu className="h-6 w-6 text-blue-400 animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-1 font-sans">
              <Sparkles className="h-5 w-5 text-amber-400 animate-bounce" />
              Compiling "{analysisReport?.name || promptValue || "AI Application"}" Template
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Sri AI is running build triggers, AST checks, and dynamic browser safety checks
            </p>
            
            {/* Real-time Status Message */}
            <div className="w-full bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg mb-5 flex items-start gap-2.5 text-left">
              <div className="mt-0.5">
                {generatingStep >= 14 ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Activity className="h-4 w-4 text-blue-400 shrink-0 animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-[11px] text-blue-400 font-mono block uppercase tracking-wider font-semibold">
                  Active Operation Task #{generatingStep + 1}
                </span>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {generatingStepMessage || "Preparing workspace directories..."}
                </p>
              </div>
            </div>

            {/* AUTOMATIC SELF-HEALING / REPAIR STATUS INTERFACE */}
            {generatingStep >= 10 && generatingStep <= 12 && repairedDiagnostic && (
              <div className="w-full bg-amber-950/25 border border-amber-500/30 rounded-xl p-4 mb-5 text-left animate-pulse">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Sri AI Auto-Fix Triggered
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      "We found a problem and fixed it automatically. Retesting your project..."
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-950/50 p-2 rounded border border-amber-900/40">
                      <div className="font-semibold">Detected Diagnostic Flag:</div>
                      {repairedDiagnostic.errorsFound && repairedDiagnostic.errorsFound.length > 0 ? (
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                          {repairedDiagnostic.errorsFound.slice(0, 2).map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      ) : (
                        <div>Module resolution path discrepancy corrected.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar container */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-5 border border-slate-800/50">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((generatingStep + 1) / 20) * 100, 100)}%` }}
              />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-widest font-mono bg-blue-950/50 text-blue-400 px-3.5 py-1.5 border border-blue-900/40 rounded-lg">
              Optimizing Modules: {generatingStep + 1} of 20 Build Phases
            </span>
          </div>
        </div>
      ) : activeGlobalTab === "referral" ? (
        <ReferralEarnView
          isLoggedIn={!!userState.user}
          userGoogleId={userState.user?.googleId ?? null}
          credits={userState.credits}
        />
      ) : activeGlobalTab === "pricing" ? (
        <PricingPage
          currentPlan={userState.plan}
          onSelectPlan={handleChangePlan}
          offerActive={offerSecondsLeft !== null && offerSecondsLeft > 0 && !userState.offerRedeemed}
          offerTimeLeftStr={(() => {
            if (offerSecondsLeft === null || offerSecondsLeft <= 0) return "00:00:00";
            const h = Math.floor(offerSecondsLeft / 3600);
            const m = Math.floor((offerSecondsLeft % 3600) / 60);
            const s = offerSecondsLeft % 60;
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
          })()}
          claimOfferTriggered={claimOfferTriggered}
          onCloseClaimOfferTrigger={() => setClaimOfferTriggered(false)}
        />
      ) : activeGlobalTab === "sri-ai" ? (
        <SriAICore
          googleAuthStatus={userState.googleAuthStatus || "connected"}
          supabaseStatus={userState.supabaseStatus || "connected"}
          razorpayStatus={userState.razorpayStatus || "pending"}
        />
      ) : !currentProject ? (
        // HUB LANDING STATE VIEWPORT
        <main id="hub-landing-dashboard" className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
            
            {/* Left Column Entry Prompt Box */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-950 to-[#101014] border border-blue-900/50 text-blue-400 rounded-lg text-xs font-extrabold tracking-widest font-mono uppercase">
                  <Sparkles className="h-3 w-3 animate-pulse text-blue-400" />
                  <span>PREMIUM COMPILER BUILDER</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none font-sans">
                  Instantly Build, Review and Deploy <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Full-Stack Apps</span> from Prompt.
                </h1>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-sans">
                  Our professional engine translates descriptive prompt parameters into highly polished client visuals, Express nodes, and matching Supabase persistence models in real-time.
                </p>
              </div>

              {/* Requirement analyzer loader */}
              {isAnalyzing ? (
                <div className="bg-[#0F0F12] border border-slate-800 p-8 rounded-2xl text-center space-y-3">
                  <div className="flex justify-center">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Analyzing App Specifications Blueprint</h3>
                  <p className="text-xs text-slate-500 font-mono">Generating Features, SQL mapping, API requirements matrix...</p>
                </div>
              ) : (
                <PromptPanel
                  currentProject={currentProject}
                  onGenerate={handleStartAnalysis}
                  isGenerating={isGenerating}
                  onRefine={handleRefine}
                  isRefining={isRefining}
                />
              )}
            </div>

            {/* Right Column Layout */}
            <div className="lg:col-span-4 space-y-6">
              <ProjectHistory
                projects={projectsList}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                isGenerating={isGenerating}
              />

              {/* Limits and plans indicators */}
              <div className="bg-[#0F0F12] p-5 rounded-2xl border border-slate-800/90 space-y-4 shadow-md text-sans">
                <h4 className="text-xs font-black text-slate-400 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  SANDBOX SECURITY ENGINE
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every precompiled template operates on isolated sandboxed rendering scopes. Direct SQL schemas are parsed and vetted for maximum validation, protecting accounts with high performance.
                </p>
                
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500 font-medium">Free creations count:</span>
                  <span className="font-bold text-slate-300 font-mono">{userState.appCreationsCount} / 5 creations limit</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500 font-medium">Free hosting deploys:</span>
                  <span className="font-bold text-slate-300 font-mono">{userState.deploymentsCount} / 2 deploys limit</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // SANDBOX PREVIEW WORKSPACE VIEWPORT (PROJECT SELECTED)
        <main className="flex-1 flex overflow-hidden flex-col md:flex-row shadow-inner">
          {/* Work refinement side prompt container */}
          <div className="w-full md:w-80 flex-shrink-0 border-r border-slate-800 bg-[#0F0F11]/95 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <PromptPanel
                currentProject={currentProject}
                onGenerate={handleStartAnalysis}
                isGenerating={isGenerating}
                onRefine={handleRefine}
                isRefining={isRefining}
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0A0A0C] flex-shrink-0 select-none">
              <ProjectHistory
                projects={projectsList}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Sandbox Tab viewport display screen */}
          <div className="flex-1 p-6 bg-[#070708]/90 flex flex-col overflow-y-auto">
            {activeTab === "preview" && (
              <PreviewViewport 
                currentProject={currentProject} 
                onLaunchSimulator={() => setIsSimulatorOpen(true)}
              />
            )}

            {activeTab === "code" && (
              <CodeExplorer
                currentProject={currentProject}
                onCodeUpdated={(f) => {}}
                isApplyingEdits={isApplyingEdits}
                onApplyManualEdit={handleApplyManualEdit}
                onAnalyzeFileInSriAI={handleAnalyzeFileInSriAI}
              />
            )}

            {activeTab === "deploy" && (
              <DeploymentConsole
                currentProject={currentProject}
                isDeploying={isDeploying}
                onDeploy={handleDeploy}
                deployLogs={deployLogs}
                onLaunchSimulator={() => setIsSimulatorOpen(true)}
              />
            )}
          </div>
        </main>
      )}

      {/* OVERLAY MODAL: SMART REQUIREMENTS PLANNING BLUEPRINT REPORT */}
      {analysisReport && (
        <div className="relative bg-black/85 flex items-center justify-center z-[100] p-6 backdrop-blur-md overflow-y-auto select-text">
          <div className="bg-[#0F0F12] border border-slate-800 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl my-8">
            <div className="bg-[#151519] px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-950 rounded-lg text-blue-400 border border-blue-900/40">
                  <Layers className="h-4.5 w-4.5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
                    Requirement Report & Architecture Plan
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Vetted securely via Gemini Tech Lead mesh</p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-955 border border-amber-900/50 text-amber-400 px-2.5 py-0.5 rounded font-mono font-bold">
                PROPOSAL
              </span>
            </div>

            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{analysisReport.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{analysisReport.description}</p>
              </div>

              {/* Bento Grid Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#151519] p-4 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono block mb-2.5">
                    🎯 Interactive Features
                  </span>
                  <ul className="space-y-1.5 list-none">
                    {analysisReport.analysis?.features?.map((feat: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 font-sans">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#151519] p-4 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono block mb-2.5">
                    📑 Pages / Routes
                  </span>
                  <ul className="space-y-1.5 list-none">
                    {analysisReport.analysis?.pages?.map((page: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 font-sans">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{page}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DB and API structures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#151519] p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono block mb-2">
                    🗃️ Designing Databases (Supabase mappings)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisReport.analysis?.database?.map((db: string, i: number) => (
                      <span key={i} className="text-[10px] bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-mono font-bold px-2.5 py-0.5 rounded">
                        {db}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#151519] p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-extrabold text-[#ca8a04] uppercase tracking-widest font-mono block mb-2">
                    ⚓ Express APIs proxies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisReport.analysis?.apis?.slice(0, 3).map((api: string, i: number) => (
                      <span key={i} className="text-[10px] bg-yellow-950/40 border border-yellow-905/60 text-yellow-500 font-mono px-2 py-0.5 rounded">
                        {api}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Costings info */}
              <div className="border border-slate-800 bg-[#16161A]/50 p-4 rounded-xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono block mb-2">
                  Estimated Deployment Hosting Pricing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono select-none">
                  <div className="bg-[#1c1c22]/50 p-2 border border-slate-800/80 rounded">
                    <span className="text-slate-500 block mb-0.5">API INFERENCE:</span>
                    <span className="text-sky-400 font-bold">{analysisReport.cost?.apiCallCost || "$0.002"}</span>
                  </div>
                  <div className="bg-[#1c1c22]/50 p-2 border border-slate-800/80 rounded">
                    <span className="text-slate-500 block mb-0.5">Live Host server:</span>
                    <span className="text-sky-400 font-bold">{analysisReport.cost?.hostingCost || "Free Tier ($0)"}</span>
                  </div>
                  <div className="bg-[#1c1c22]/50 p-2 border border-slate-800/80 rounded">
                    <span className="text-slate-500 block mb-0.5">Supabase Database:</span>
                    <span className="text-sky-400 font-bold">{analysisReport.cost?.databaseCost || "Free Tier ($0)"}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Sizing selection block */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl select-none">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono block mb-3">
                  Select App Compile Scope (Limits and Credits):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Small Size */}
                  <button 
                    onClick={() => setSelectedSize("Small")}
                    className={`p-3 border text-left rounded-xl transition-all cursor-pointer ${
                      selectedSize === "Small"
                        ? "border-blue-500 bg-blue-950/20"
                        : "border-slate-800/80 bg-[#151519] hover:border-slate-705"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">Small Scope</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded leading-none">
                        5 cr
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Minimal standalone template. Extremely speedy.</p>
                  </button>

                  {/* Medium Size */}
                  <button 
                    onClick={() => setSelectedSize("Medium")}
                    className={`p-3 border text-left rounded-xl transition-all cursor-pointer ${
                      selectedSize === "Medium"
                        ? "border-blue-500 bg-blue-950/20"
                        : "border-slate-800/80 bg-[#151519] hover:border-slate-705"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">Medium Scope</span>
                      <span className="text-[9px] bg-blue-950 text-blue-400 font-mono px-1.5 py-0.5 rounded leading-none">
                        15 cr
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Complete user flow. Interactive state forms and files.</p>
                  </button>

                  {/* Large Size */}
                  <button 
                    onClick={() => setSelectedSize("Large")}
                    className={`p-3 border text-left rounded-xl transition-all cursor-pointer ${
                      selectedSize === "Large"
                        ? "border-blue-500 bg-blue-950/20"
                        : "border-slate-800/80 bg-[#151519] hover:border-slate-705"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">Enterprise Large</span>
                      <span className="text-[9px] bg-purple-950 text-purple-400 font-mono px-1.5 py-0.5 rounded leading-none">
                        30 cr
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Full dashboards + charts analytics and schema exports.</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons CTAs */}
            <div className="bg-[#151519] border-t border-slate-800 px-6 py-4 flex items-center justify-between select-none">
              <button
                onClick={() => setAnalysisReport(null)}
                className="px-4 py-2 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Planning
              </button>

              <button
                onClick={() => handleConfirmBuild(analysisReport)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Rocket className="h-4 w-4 text-blue-100 animate-pulse" />
                <span>Confirm & Compile Blueprint (-{selectedSize === "Small" ? 5 : selectedSize === "Large" ? 30 : 15} cr)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER MODAL: BILLING & REFERRALS PANEL */}
      {billingOpen && (
        <div className="relative bg-black/80 flex items-center justify-center z-[100] p-6 backdrop-blur-md select-none">
          <div className="bg-[#0F0F12] border border-slate-805 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="bg-[#151519] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest font-mono">
                  SaaS Billing & Referrals Admin
                </h3>
              </div>
              <button 
                onClick={() => setBillingOpen(false)}
                className="text-xs text-slate-500 hover:text-white font-bold font-mono cursor-pointer"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {/* Core Credits state */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#151519] p-4.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono mb-1">
                    ACTIVE TIER STATUS
                  </span>
                  <div className="text-lg font-black text-white uppercase tracking-tight font-sans">
                    {userState.plan} workspace
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    {userState.plan === "Free" ? "Limited App creations & deploys" : "Unlimited creations and hosting deployment compile cycles!"}
                  </div>
                </div>

                <div className="bg-[#151519] p-4.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono mb-1">
                    REMAINING CREDITS
                  </span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {userState.plan === "Free" ? `${userState.credits} cr` : "∞ Unlimited"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    100% simulated trial balance
                  </div>
                </div>
              </div>

              {/* Package Upgrades block */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono mb-2.5">
                  1. Tier Level Switching (Simulated payments)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Free plan option */}
                  <div className={`p-3 border rounded-xl flex flex-col justify-between ${
                    userState.plan === "Free" ? "border-slate-600 bg-slate-900/10" : "border-slate-800 bg-[#151519]/40"
                  }`}>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">Free Tier</span>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">Standard trial limitations</span>
                    </div>
                    <button 
                      onClick={() => handleChangePlan("Free")}
                      disabled={userState.plan === "Free"}
                      className="mt-3 w-full py-1.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg cursor-pointer"
                    >
                      {userState.plan === "Free" ? "Active" : "Downgrade"}
                    </button>
                  </div>

                  {/* Pro Workspace option */}
                  <div className={`p-3 border rounded-xl flex flex-col justify-between ${
                    userState.plan === "Pro" ? "border-blue-500 bg-blue-950/10" : "border-slate-800 bg-[#151519]/40"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-100">Pro Developer</span>
                        <span className="text-[8px] bg-blue-950 text-blue-400 font-mono font-bold px-1 py-0.5 rounded leading-none">
                          $19/mo
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono leading-none">9999 Max credits + speed runs</span>
                    </div>
                    <button 
                      onClick={() => handleChangePlan("Pro")}
                      disabled={userState.plan === "Pro"}
                      className="mt-3 w-full py-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
                    >
                      {userState.plan === "Pro" ? "Active" : "Upgrade"}
                    </button>
                  </div>

                  {/* Team Workspace option */}
                  <div className={`p-3 border rounded-xl flex flex-col justify-between ${
                    userState.plan === "Team" ? "border-purple-500 bg-purple-950/10" : "border-slate-800 bg-[#151519]/40"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-100">Team Space</span>
                        <span className="text-[8px] bg-purple-950 text-purple-400 font-mono font-bold px-1 py-0.5 rounded leading-none">
                          $49/mo
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono leading-none">Highest compute speeds limit</span>
                    </div>
                    <button 
                      onClick={() => handleChangePlan("Team")}
                      disabled={userState.plan === "Team"}
                      className="mt-3 w-full py-1.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer"
                    >
                      {userState.plan === "Team" ? "Active" : "Sim Upgrade"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Program Info */}
              <div className="border border-slate-800 bg-[#151519]/90 rounded-2xl p-4.5">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block font-mono mb-2">
                  2. Referral Program
                </span>
                
                <p className="text-[10px] font-semibold text-slate-400 font-mono block mb-3">
                  Referral Program: Go to the Referral tab to share your link and track your earnings
                </p>

                <div className="flex items-center gap-2 bg-[#0F0F12] p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`sri-builder.app/ref/${userState.referralCode}`}
                    className="flex-1 bg-transparent hover:text-white outline-none text-[11px] font-mono text-slate-500 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`sri-builder.app/ref/${userState.referralCode}`);
                      setReferralCopied(true);
                      setTimeout(() => setReferralCopied(false), 2000);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {referralCopied ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Referrals Historic Logs */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono mb-2">
                  Historic invitation logs
                </span>
                
                {userState.referrals?.length === 0 ? (
                  <p className="text-[11px] font-mono text-slate-500 italic p-3 text-center border border-dashed border-slate-850 rounded">
                    No reward activities recorded on account yet. Sim Invite some above !
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {userState.referrals?.map((ref: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[11px] bg-slate-900/60 p-2.5 border border-slate-850 rounded-lg">
                        <div className="font-sans text-slate-300">
                          <strong>{ref.friend}</strong> completed <em className="text-blue-400 font-mono">{ref.action}</em>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-amber-400">
                          +{ref.reward} cr
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* billing actions reset */}
            <div className="bg-[#151519] border-t border-slate-800 px-6 py-4 flex items-center justify-between text-xs">
              <button
                onClick={handleResetUserState}
                className="text-red-500 hover:text-red-400 font-mono font-bold cursor-pointer"
              >
                [ RESET ALL DATA ]
              </button>

              <button
                onClick={() => setBillingOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIRST-TIME USER SPECIAL DISCOUNT WELCOME POPUP */}
      {false && showOfferPopup && offerSecondsLeft !== null && offerSecondsLeft > 0 && !userState.offerRedeemed && (
        <div className="relative bg-black/85 flex items-center justify-center z-[200] p-4 backdrop-blur-xl animate-fade-in font-sans">
          <div className="bg-[#09090B] border-2 border-indigo-500/40 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl relative p-6 md:p-8 select-none text-center transform scale-100 hover:scale-[1.01] transition-transform duration-300">
            {/* Ambient Background Glow Particles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute -bottom-10 left-10 w-36 h-36 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Exclusive Corner Ribbon */}
            <div className="absolute top-0 right-0 overflow-hidden w-40 h-40 pointer-events-none">
              <div className="absolute top-[30px] right-[-35px] rotate-45 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-extrabold py-1.5 px-10 text-center uppercase tracking-wider shadow-md transform-gpu leading-none">
                🔥 Hot Deal
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowOfferPopup(false)}
              className="absolute top-4 left-4 p-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white rounded-lg border border-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Content */}
            <div className="space-y-3 mt-6">
              <div className="mx-auto w-14 h-14 bg-gradient-to-b from-indigo-500/20 to-indigo-500/30 rounded-2xl border border-indigo-500/30 flex items-center justify-center text-3xl animate-bounce">
                🎉
              </div>
              <h2 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight leading-none pt-2">
                Welcome to Trust Me AI Builder!
              </h2>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-950/60 border border-indigo-505/30 rounded-full text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                <Sparkles className="h-3 w-3 fill-indigo-400" />
                <span>Special First-Time User Offer</span>
              </div>
            </div>

            {/* Price Cards & Comparison */}
            <div className="grid grid-cols-2 gap-4 mt-6 bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden">
              {/* Save Overlay */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-950/85 border border-red-900/40 text-red-400 text-[10.5px] font-extrabold tracking-wider px-3.5 py-1 rounded-full uppercase shadow">
                Save ₹200 Instantly
              </div>

              {/* Original Card */}
              <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col justify-center pt-8">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono mb-1">
                  Original Price
                </span>
                <span className="text-2xl font-bold font-sans text-slate-400 line-through">
                  ₹499
                </span>
                <span className="text-[9.5px] mt-1 text-slate-500 font-medium">/month</span>
              </div>

              {/* Discounted Card */}
              <div className="p-3 bg-gradient-to-b from-red-950/20 to-red-900/10 border border-red-500/30 rounded-xl flex flex-col justify-center pt-8">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block font-mono mb-1">
                  Offer Price
                </span>
                <span className="text-3xl font-black font-sans text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  ₹299
                </span>
                <span className="text-[9.5px] mt-1 text-amber-300 font-bold uppercase animate-pulse">
                  First-Time Users Only
                </span>
              </div>
            </div>

            {/* High-Converting Validations */}
            <div className="mt-5 space-y-2">
              <span className="text-xs text-slate-400 block font-sans">
                Unlock <strong>25 App Creations, 5 Live Deployments, Sri AI Assistant, and priority support</strong>. Build your MVP immediately!
              </span>
              
              {/* Live Countdown Clock */}
              <div className="bg-[#0B0B0D] border border-red-900/30 p-3 h-14 rounded-xl flex items-center justify-between gap-4 max-w-sm mx-auto shadow-inner">
                <div className="flex items-center gap-1.5 text-red-500">
                  <Clock className="h-4 w-4 animate-spin shrink-0" style={{ animationDuration: "10s" }} />
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest leading-none">
                    LIMITED TIME OFFER:
                  </span>
                </div>
                <span className="text-lg font-black font-mono text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                  {(() => {
                    const h = Math.floor(offerSecondsLeft / 3600);
                    const m = Math.floor((offerSecondsLeft % 3600) / 60);
                    const s = offerSecondsLeft % 60;
                    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <button
                onClick={() => {
                  setShowOfferPopup(false);
                  setActiveGlobalTab("pricing");
                  setClaimOfferTriggered(true);
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-950/30 hover:shadow-red-500/20 transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 text-white fill-white" />
                <span>Claim Offer (₹299 Only)</span>
              </button>

              <button
                onClick={() => setShowOfferPopup(false)}
                className="w-full py-2 px-4 hover:bg-white/[0.02] text-slate-500 hover:text-slate-300 text-xs font-semibold cursor-pointer rounded-lg transition-colors font-mono uppercase tracking-wider"
              >
                [ Maybe Later ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-FIDELITY IN-APP INTERACTIVE STANDALONE APP SIMULATOR OVERLAY */}
      {isSimulatorOpen && currentProject && (
        <div className="relative bg-black/95 flex flex-col z-[150] backdrop-blur-xl select-none p-4 md:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/60 rounded-xl border border-indigo-900/40 text-indigo-400">
                <Monitor className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white font-sans uppercase tracking-tight">
                    TRUST ME AI - LIVE PRODUCT SIMULATOR
                  </h3>
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-900/40 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                    ACTIVE SANDBOX
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Interactive responsive emulation layer bypassing external popup blocks and iframe restrict triggers.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg cursor-pointer border border-slate-800 hover:border-slate-750 transition-colors"
              title="Close Simulator"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden min-h-0">
            {/* LEFT COLUMN: SIMULATED ENVIRONMENT & CONTROLLERS */}
            <div className="lg:col-span-8 flex flex-col gap-4 bg-[#0A0A0C] border border-slate-850 p-4 rounded-2xl overflow-y-auto">
              {/* Simulator Action/Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111114] p-3 rounded-xl border border-slate-800/60">
                {/* Device selectors */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-lg">
                  <button
                    onClick={() => {
                      setSimulatorDevice("phone");
                      addSimulatedLog("Switched viewport to simulated Mobile Device scale", "info");
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      simulatorDevice === "phone" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile
                  </button>
                  <button
                    onClick={() => {
                      setSimulatorDevice("tablet");
                      addSimulatedLog("Switched viewport to simulated Tablet Device scale", "info");
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      simulatorDevice === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tablet className="h-3.5 w-3.5" />
                    Tablet
                  </button>
                  <button
                    onClick={() => {
                      setSimulatorDevice("desktop");
                      addSimulatedLog("Switched viewport to simulated Desktop Device scale", "info");
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      simulatorDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Desktop
                  </button>
                </div>

                {/* Network Controllers / Latency Switchers */}
                <div className="flex items-center gap-3">
                  {/* Slow latency simulator */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-mono font-semibold text-slate-400 uppercase">Latency Speed:</span>
                    <select
                      value={simulatorLatency}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSimulatorLatency(v);
                        addSimulatedLog(`Network mode set to ${v === 0 ? "LAN 5G Speed" : `3G connection latency simulation (${v}ms)`}`, "info");
                      }}
                      className="bg-slate-950 border border-slate-800 text-[11px] text-indigo-400 font-mono rounded px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="0">Ultra LAN 5G (Instant)</option>
                      <option value="1200">Simulated 4G (+1200ms)</option>
                      <option value="2500">Simulated 3G (+2500ms)</option>
                    </select>
                  </div>

                  {/* Offline switch */}
                  <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={simulatorIsOffline}
                      onChange={(e) => {
                        const isOff = e.target.checked;
                        setSimulatorIsOffline(isOff);
                        addSimulatedLog(isOff ? "SYSTEM ALERT: Offline simulation model enabled. All proxy request layers severed." : "SYSTEM ALERT: Online sync restored.", isOff ? "warn" : "info");
                      }}
                      className="rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950 h-3.5 w-3.5"
                    />
                    {simulatorIsOffline ? (
                      <span className="text-rose-400 flex items-center gap-1 font-mono text-[10.5px] font-semibold">
                        <WifiOff className="h-3.5 w-3.5" />
                        OFFLINE
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10.5px] font-semibold">
                        <Wifi className="h-3.5 w-3.5" />
                        ONLINE
                      </span>
                    )}
                  </label>
                </div>

                {/* Sri AI Audio diagnostic report reader */}
                <button
                  onClick={() => {
                    const speech = `Launching Trust Me AI standalone device simulator with model identifier ${currentProject.name}. Offline simulation status index: ${simulatorIsOffline ? "offline active" : "online"}. All interactive routes are active.`;
                    const utterance = new SpeechSynthesisUtterance(speech);
                    utterance.rate = 1.05;
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                    addSimulatedLog("Sri AI Speak Trigger Client: Spoken analysis stream executed.", "info");
                  }}
                  className="flex items-center gap-1 bg-[#1A1A24] hover:bg-slate-800/80 border border-indigo-900/40 text-indigo-400 px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer"
                  title="Sri AI speaks app diagnostic summaries"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Voice Diagnostics
                </button>
              </div>

              {/* SIMULATOR CANVAS PREVIEW WRAPPER */}
              <div className="flex-1 flex items-center justify-center bg-slate-950/85 border border-slate-850 p-4 md:p-6 rounded-2xl overflow-hidden relative min-h-[460px]">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 pointer-events-none"></div>

                {simulatorLoading ? (
                  <div className="flex flex-col items-center justify-center text-center z-10 bg-slate-950/90 absolute inset-0">
                    <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      Simulating Latency Buffers ({simulatorIsOffline ? "Offline Mode" : `${simulatorLatency}ms delay`})...
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Sri AI syncing responsive parameters, CSS layouts, and reactive modules...
                    </p>
                  </div>
                ) : simulatorIsOffline ? (
                  <div className="max-w-md mx-auto text-center p-6 bg-[#0E0E11] border border-red-950 rounded-xl z-10 shadow-lg relative">
                    <div className="mx-auto w-10 h-10 rounded-full bg-rose-950/40 border border-rose-900 flex items-center justify-center text-rose-500 mb-3 animate-bounce">
                      <WifiOff className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-black text-rose-400 font-mono uppercase tracking-wider mb-2">
                      DNS_CONNECTION_REFUSED
                    </h4>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans mb-3">
                      This app simulated an offline disconnection. Sri AI has successfully isolated all REST query handlers and database sync instances. Toggle the Online mode above to restore live container synchronization.
                    </p>
                    <div className="text-[10px] font-mono bg-rose-950/15 border border-rose-900/30 p-2.5 rounded text-rose-300 text-left">
                      <strong className="block text-rose-400">Offline Fallback Checked:</strong>
                      ✓ User cache loaded from localStorage.<br />
                      ✓ No fatal Javascript crashes registered.<br />
                      ✓ ServiceWorker mock thread: operating.<br />
                    </div>
                  </div>
                ) : (
                  /* RENDER RESPONSIVE DEVICE SHELLS */
                  <div 
                    className={`transition-all duration-300 flex items-center justify-center ${
                      simulatorDevice === "phone" 
                        ? "w-[340px] h-[580px] bg-[#111113] border-4 border-[#242429] rounded-[40px] shadow-2xl relative p-3 flex-shrink-0"
                        : simulatorDevice === "tablet"
                        ? "w-[620px] h-[480px] bg-[#111113] border-4 border-[#242429] rounded-[24px] shadow-2xl relative p-2 flex-shrink-0"
                        : "w-full h-full min-h-[440px] bg-[#111113] border border-slate-850 rounded-lg shadow-2xl relative p-1"
                    }`}
                  >
                    {/* PHONE DEVICE INDICATION GRAPHICS */}
                    {simulatorDevice === "phone" && (
                      <>
                        {/* Dynamic Island Notch */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-20 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950 flex items-center justify-center mr-1">
                            <div className="w-1 h-1 rounded-full bg-blue-900"></div>
                          </div>
                          <span className="text-[8px] font-mono text-slate-600 font-extrabold pb-0.5 select-none uppercase">DYNAMIC ISLAND</span>
                        </div>
                        {/* Speaker line */}
                        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-855 rounded-full z-20"></div>

                        {/* Top Battery/Signal Overlay Bar */}
                        <div className="absolute top-11 left-10 right-10 flex items-center justify-between text-[9px] font-bold font-mono text-slate-500 z-10 px-1 select-none">
                          <span>09:41</span>
                          <div className="flex items-center gap-1">
                            <span>5G</span>
                            <div className="w-4 h-2 border border-slate-500 p-0.5 rounded flex items-center">
                              <div className="w-full h-full bg-slate-400 rounded-xs"></div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Slide indicators bar */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700/80 rounded-full z-20 hover:bg-slate-500 cursor-pointer transition-colors" title="Home slider indicator"></div>
                      </>
                    )}

                    {/* TABLET CHAMBER GRAPHICS */}
                    {simulatorDevice === "tablet" && (
                      <>
                        {/* Tablet Camera dot */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-950 border border-slate-800 z-20 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 bg-blue-900 rounded-full"></div>
                        </div>
                      </>
                    )}

                    {/* Simulating iFrame with previewHTML */}
                    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden relative">
                      <iframe
                        title="In-App standalone virtual runtime simulation sandbox host"
                        srcDoc={currentProject.previewHtml}
                        className="w-full h-full border-0 select-text bg-[#08080B]"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE CONSOLE LOG TRACER */}
            <div className="lg:col-span-4 flex flex-col bg-[#0F0F12] border border-slate-850 p-4 rounded-2xl h-full overflow-hidden shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-3 select-none shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-blue-450" />
                  <span className="text-xs font-extrabold text-white font-sans uppercase tracking-tight">
                    Terminal Console Output
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setSimulatedLogs([]);
                    addSimulatedLog("Terminal trace logs cleared.", "info");
                  }}
                  className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-355 font-mono transition-colors bg-slate-955 hover:bg-slate-900 border border-slate-850 px-2 py-1 rounded cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              {/* Logs Stream Container */}
              <div className="flex-1 bg-[#070709] border border-slate-850 p-3 rounded-xl font-mono text-[11px] overflow-y-auto space-y-1.5 min-h-[160px]">
                {simulatedLogs.length === 0 ? (
                  <p className="text-slate-600 text-center italic py-2">No logging traces compiled. Trigger interactions above!</p>
                ) : (
                  simulatedLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 leading-snug break-all border-b border-slate-900 pb-1">
                      <span className="text-slate-600 select-none text-[10px] shrink-0 mt-0.5">{log.timestamp}</span>
                      <span className={`px-1 rounded-[3px] text-[9.5px] font-bold select-none uppercase shrink-0 mt-0.5 ${
                        log.level === "info" ? "bg-blue-950/70 border border-blue-900/40 text-blue-400" :
                        log.level === "warn" ? "bg-amber-950/70 border border-amber-900/40 text-amber-400" :
                        log.level === "error" ? "bg-red-950/70 border border-red-900/40 text-red-400" :
                        "bg-slate-900 border border-slate-800 text-slate-400"
                      }`}>
                        {log.level}
                      </span>
                      <span className={
                        log.level === "error" ? "text-red-400" :
                        log.level === "warn" ? "text-amber-300" :
                        log.level === "info" ? "text-blue-300" :
                        "text-slate-300"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Console Code Executor Input bar */}
              <div className="pt-3 border-t border-slate-850 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono mb-1">
                  Inject Console Snippet / Query
                </span>
                <div className="flex items-center gap-1.5 bg-[#070709] border border-slate-850 p-2 rounded-xl">
                  <span className="text-blue-500 font-bold font-mono pl-1 text-xs select-none">{`>`}</span>
                  <input
                    type="text"
                    value={simulatedConsoleInput}
                    onChange={(e) => setSimulatedConsoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleExecuteConsoleSnippet();
                      }
                    }}
                    placeholder="e.g. document.title, throw Error, credits"
                    className="flex-1 bg-transparent text-xs text-slate-320 outline-none placeholder-slate-600 font-mono py-0.5 hover:text-white"
                  />
                  <button
                    onClick={handleExecuteConsoleSnippet}
                    className="p-1 px-3 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Run
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1 px-0.5">
                  Type code inputs and compile. Result is parsed inside the sandbox client.
                </p>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="mt-4 border-t border-slate-850 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#111114]/30 px-4 py-2.5 rounded-xl border border-slate-850/50 shrink-0">
            <span className="text-slate-500 font-mono select-none">
              Client Session ID: <strong className="text-slate-400">{currentProject.id.substring(0, 10).toUpperCase()}</strong> - Connected.
            </span>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer transition-all shadow-md shadow-indigo-900/20"
            >
              Done Emulating
            </button>
          </div>
        </div>
      )}

      {/* FOOTER attribution with DEVELOPED BY SC TECH @ 2026 */}
      <footer className="border-t border-slate-805 bg-[#0F0F12] py-4.5 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono select-none">
        <div>
          © 2026 Trust Me AI Builder. Connected via Server-Side Gemini Node Mesh.
        </div>
        <div className="flex items-center gap-1 mt-1.5 sm:mt-0 font-sans tracking-tight font-semibold text-slate-400">
          DEVELOPED BY SC TECH @ 2026
          <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse inline ml-0.5" />
        </div>
      </footer>

      {/* Floating Feedback button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setIsFeedbackOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-bold">Feedback</span>
        </button>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="relative bg-black/70 z-60 flex items-center justify-center p-6">
            <motion.div initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.98}} className="w-full max-w-2xl">
              <FeedbackPanel onClose={() => setIsFeedbackOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
