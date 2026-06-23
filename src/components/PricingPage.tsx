import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  Star, 
  ArrowRight, 
  CreditCard, 
  Shield, 
  Volume2, 
  Code, 
  Cpu, 
  TrendingUp, 
  Flame,
  Award,
  Lock,
  ThumbsUp,
  UserCheck,
  Linkedin,
  Twitter,
  Github,
  Quote,
  Globe,
  Users,
  Rocket
} from "lucide-react";

interface PricingPageProps {
  currentPlan: string;
  onSelectPlan: (plan: string, info: { credits: number; isUnlimited: boolean; isOfferRedeemed?: boolean }) => void;
  offerActive?: boolean;
  offerTimeLeftStr?: string;
  claimOfferTriggered?: boolean;
  onCloseClaimOfferTrigger?: () => void;
}

export default function PricingPage({ 
  currentPlan, 
  onSelectPlan,
  offerActive = false,
  offerTimeLeftStr = "24:00:00",
  claimOfferTriggered = false,
  onCloseClaimOfferTrigger
}: PricingPageProps) {
  // Countdown Timer state: 23:59:59
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 59 * 60 + 59);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Simulated checkout state
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<{
    name: string;
    price: string;
    credits: number;
    isUnlimited: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [checkoutStep, setCheckoutStep] = useState<"details" | "completing" | "success">("details");

  useEffect(() => {
    if (claimOfferTriggered && offerActive) {
      handlePlanClick("Basic", "₹299", 25, false);
      if (onCloseClaimOfferTrigger) {
        onCloseClaimOfferTrigger();
      }
    }
  }, [claimOfferTriggered, offerActive, onCloseClaimOfferTrigger]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) return 23 * 3600 + 59 * 60 + 59; // reset to 24h
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlanClick = (planName: string, price: string, credits: number, isUnlimited: boolean) => {
    // Directly start payment flow via Razorpay
    const plan = { name: planName, price, credits, isUnlimited };
    createOrderAndOpen(plan);
  };

  const handleCompleteUpgrade = () => {
    if (!selectedUpgradePlan) return;
    setIsProcessing(true);
    setCheckoutStep("completing");
    
    setTimeout(() => {
      onSelectPlan(selectedUpgradePlan.name, { 
        credits: selectedUpgradePlan.credits, 
        isUnlimited: selectedUpgradePlan.isUnlimited,
        isOfferRedeemed: offerActive && selectedUpgradePlan.name === "Basic"
      });
      setCheckoutStep("success");
      setIsProcessing(false);
    }, 2000);
  };

  const plans = [
    {
      name: "Basic",
      price: offerActive ? "₹299" : "₹499",
      originalPrice: offerActive ? "₹499" : null,
      period: "month",
      desc: "Perfect for students and beginners.",
      credits: 25,
      isUnlimited: false,
      badge: offerActive ? "🔥 First-Time User Exclusive" : null,
      gradient: offerActive ? "from-red-600/20 via-blue-600/10 to-purple-600/20" : "from-blue-600/20 to-sky-500/20",
      buttonText: offerActive ? "Claim Welcome Offer" : "Start Building",
      icon: Code,
      features: [
        "25 App Creations",
        "5 Live Deployments",
        "Sri AI Assistant",
        "App Preview Links",
        "Basic Support",
        ...(offerActive ? [
          "🎉 Save ₹200 (Limited Time Offer)",
          "⚡ First-Time Users Only"
        ] : [])
      ]
    },
    {
      name: "Medium",
      price: "₹999",
      period: "month",
      desc: "Ideal for power creators and professional developers.",
      credits: 100,
      isUnlimited: false,
      badge: "⭐ MOST POPULAR",
      gradient: "from-indigo-600/30 via-purple-600/30 to-pink-500/20",
      buttonText: "Upgrade Now",
      icon: Zap,
      features: [
        "100 App Creations",
        "20 Live Deployments",
        "Voice AI Assistant",
        "Image Upload",
        "PDF Analysis",
        "Faster Build Queue",
        "Priority Support"
      ]
    },
    {
      name: "Gold",
      price: "₹1,999",
      period: "month",
      desc: "Scale your startup MVP with self-healing deployments.",
      credits: 300,
      isUnlimited: false,
      badge: "PRIME GOLD",
      gradient: "from-amber-600/25 to-yellow-500/20",
      buttonText: "Go Gold",
      icon: Award,
      features: [
        "300 App Creations",
        "75 Live Deployments",
        "Advanced Sri AI",
        "Auto Error Fixing",
        "Build Analytics",
        "Priority Build Processing",
        "Premium Voice Mode"
      ]
    },
    {
      name: "Platinum",
      price: "₹4,999",
      period: "month",
      desc: "Ultimate authority tier for teams and scaling agency workflows.",
      credits: 9999,
      isUnlimited: true,
      badge: "ULTIMATE PLATINUM",
      gradient: "from-teal-600/30 to-emerald-500/20",
      buttonText: "Become Platinum",
      icon: Cpu,
      features: [
        "Unlimited App Creations",
        "Unlimited Deployments",
        "Custom Domains",
        "Team Collaboration",
        "Dedicated Hosting",
        "VIP Support",
        "Fastest AI Infrastructure",
        "Early Access Features"
      ]
    }
  ];

  const testimonials = [
    {
      text: "Built my startup MVP in 2 hours. The speed of iteration and Sri AI context-sharing is wild.",
      author: "Charu Sri",
      role: "Founder, SC Tech",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80"
    },
    {
      text: "Better than hiring freelancers. I speak Tanglish and English, and it writes correct code and triggers automatic deployments in 1-click.",
      author: "Rohan Das",
      role: "Solo Indie Hacker",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80"
    },
    {
      text: "Deployment worked instantly. Best SaaS builder with natural Voice Assistant loop support.",
      author: "Priya Nair",
      role: "Product Designer",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80"
    }
  ];

  const faqs = [
    {
      q: "Do I need coding knowledge?",
      a: "Absolutely not! Trust Me AI Builder is designed as a zero-code-required system. You speak or type your ideas, and let Sri AI lay out full database tables, API proxies, and client-side code automatically."
    },
    {
      q: "Can I deploy apps?",
      a: "Yes! Deployments are integrated into your dashboard. Every plan includes instant sandboxed preview links and production deployments hosted on fast, edge-optimized Cloud Run containers."
    },
    {
      q: "Does Voice AI support Tamil?",
      a: "Yes, fully! Sri AI is trained to understand bilingual and single-language voice signals including Tamil, English, Tanglish, Hindi, Telugu, Malayalam, and Kannada with natural speech output."
    },
    {
      q: "Can I upgrade or downgrade later?",
      a: "Of course. You can switch plans instantly in your billing section or upgrade right here on this page to unlock wider credit pools and faster queue processing sizes."
    },
    {
      q: "Is there an offline mode support?",
      a: "Yes, our preview works 100% in-browser with automated local compilation backups, ensuring you never lose your progress during active connectivity drops."
    }
  ];

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  };

  const createOrderAndOpen = async (plan: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      await loadRazorpayScript();

      const order = data.order;
      const key = data.key;

      const options: any = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "Trust Me AI Builder",
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.name,
                amount: order.amount
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            // refresh user state and activate plan in UI
            const us = await fetch("/api/user-state");
            if (us.ok) {
              const usj = await us.json();
              onSelectPlan(usj.plan || plan.name, { credits: usj.credits || plan.credits, isUnlimited: plan.isUnlimited });
            } else {
              onSelectPlan(plan.name, { credits: plan.credits, isUnlimited: plan.isUnlimited });
            }
            alert("Payment successful — plan activated.");
          } catch (e: any) {
            console.error("Verification error:", e);
            alert("Payment succeeded but verification failed: " + (e.message || e));
          }
        },
        prefill: {},
        theme: { color: "#7c3aed" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error(e);
      alert("Payment initiation failed: " + (e.message || e));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="saas-pricing-viewport" className="flex-1 bg-[#050507] text-white overflow-y-auto px-6 py-12 relative select-none scrollbar-thin">
      {/* Decorative Blur Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-16 relative">
        
        {/* PREMIUM TOP SECTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-blue-900/30 rounded-full text-xs font-bold text-blue-400">
            <Sparkles className="h-3 w-3 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Secure Premium Access Tiers</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex flex-col items-center justify-center gap-4 text-center">
            {/* Majestic Centered Rocket Badge with Premium Particles */}
            <span className="relative inline-flex items-center justify-center shrink-0 p-1 mb-1">
              <span className="absolute -inset-3 bg-indigo-500/25 rounded-full blur-lg opacity-80 animate-pulse" />
              <Rocket className="h-11 w-11 text-white shrink-0 -rotate-45 transform hover:scale-110 transition-all duration-500 animate-bounce relative" style={{ animationDuration: "3.5s" }} />
              {/* Sparkle star particles exactly matching the premium workspace aesthetic */}
              <span className="absolute -top-2 -left-2 text-[10px] animate-pulse text-amber-300">★</span>
              <span className="absolute -bottom-1.5 -right-1.5 text-[11px] animate-pulse text-indigo-200">✦</span>
              <span className="absolute top-2.5 -right-3 text-[8px] animate-ping text-blue-200">★</span>
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
              Build Any App From a Prompt
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn your ideas into real websites and applications with AI. Generate, preview, deploy, and share in minutes.
          </p>

          {/* Core Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
            {[
              { label: "10,000+ Apps Generated", icon: ShieldCheck },
              { label: "AI-Powered Development", icon: Cpu },
              { label: "Voice Assistant Included", icon: Volume2 },
              { label: "No Coding Required", icon: Code }
            ].map((indicator, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm shadow-sm"
              >
                <indicator.icon className="h-4 w-4 text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-200">{indicator.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HIGH-CONVERTING LIMITED TIME OFFER BANNER */}
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 border border-purple-500/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-900/5 backdrop-blur-md">
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/20 blur-2xl pointer-events-none" />
            
            <div className="space-y-2 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/60 border border-red-900/40 rounded text-red-400 text-[10px] font-mono font-bold uppercase animate-pulse">
                <Flame className="h-3 w-3 fill-red-500" />
                <span>{offerActive ? "🔥 FIRST-TIME USER EXCLUSIVE" : "Launch Offer - Save 40% Today"}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {offerActive ? "🎉 Claim First-Time Builder Discount - Save ₹200!" : "Join now and lock in launch pricing forever."}
              </h3>
              <p className="text-xs text-slate-400">
                {offerActive 
                  ? "Get your Basic Plan unlocked at ₹299 instead of ₹499. Save ₹200 today! Limited Time Offer, First-Time Users Only."
                  : "Activate any premium account today and get lifetime immunity from future subscription price hikes!"}
              </p>
            </div>
 
            <div className="bg-[#0D0D11]/90 border border-purple-500/20 p-4 rounded-xl text-center shrink-0 min-w-[200px] z-10 shadow-lg">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                ⏰ Offer expires in
              </span>
              <span className="text-xl font-black font-mono tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-300 to-amber-400">
                {offerActive ? offerTimeLeftStr : formatTime(secondsLeft)}
              </span>
              <div className="h-px bg-slate-800 my-2" />
              <span className="text-[9px] text-emerald-400 font-bold block animate-pulse">
                {offerActive ? "🎁 ₹200 INSTANT DISCOUNT" : "🟢 Free Setup • Cancel Anytime"}
              </span>
            </div>
          </div>
        </div>

        {/* PRICING PLANS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch select-none">
          {plans.map((plan, idx) => {
            const isPlanActive = currentPlan === plan.name;
            const isMedium = plan.name === "Medium";
            const GraphicIcon = plan.icon;

            return (
              <div 
                key={idx}
                className={`group relative rounded-2xl bg-gradient-to-b ${plan.gradient} border ${
                  isMedium ? "border-purple-500/50" : isPlanActive ? "border-blue-500/50" : "border-slate-800/80"
                } bg-[#0A0A0C]/90 p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-slate-700 hover:shadow-2xl shadow-slate-950/50 overflow-hidden ${
                  isMedium ? "shadow-lg shadow-purple-900/10" : ""
                }`}
              >
                {/* Decorative glow inside card */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] group-hover:bg-indigo-500/5 rounded-full blur-xl pointer-events-none transition-colors" />

                {/* Popularity or Tier badges */}
                {plan.badge && (
                  <div className="absolute top-3 right-3">
                    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase font-mono ${
                      isMedium ? "bg-purple-600/90 text-white shadow" : "bg-slate-800 text-slate-300"
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-white/[0.04] border border-white/[0.05] group-hover:border-indigo-500/30 transition-colors ${
                      isMedium ? "text-purple-400" : "text-blue-400"
                    }`}>
                      <GraphicIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-slate-300 group-hover:text-white transition-colors">
                      {plan.name} Plan
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight text-white mb-0.5">{plan.price}</span>
                      {(plan as any).originalPrice && (
                        <span className="text-xs text-red-500 font-semibold line-through ml-1.5 my-auto">{(plan as any).originalPrice}</span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">/{plan.period}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-400 font-sans leading-normal h-8 mt-1 border-b border-white/[0.03] pb-2.5">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 pt-2 text-left">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 bg-blue-900/20 rounded-full border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-blue-400 font-bold" />
                        </div>
                        <span className="text-[11.5px] text-slate-300 font-medium group-hover:text-slate-100 transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="pt-6">
                  <button
                    onClick={() => handlePlanClick(plan.name, plan.price, plan.credits, plan.isUnlimited)}
                    disabled={isPlanActive}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isPlanActive
                        ? "bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 cursor-not-allowed"
                        : isMedium
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md shadow-indigo-950/50 hover:shadow-indigo-500/25"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.05] hover:border-slate-700"
                    }`}
                  >
                    {isPlanActive ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Active Subscription</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.buttonText}</span>
                        <ArrowRight className="h-3 w-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREMIUM FOUNDER SPOTLIGHT SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8 pt-12 border-t border-white/[0.02]"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Message from the Founder
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              The vision and mission behind Trust Me AI Builder
            </p>
          </div>

          <div className="bg-[#0b0c10]/70 border border-white/[0.05] rounded-3xl p-6 md:p-10 max-w-5xl mx-auto backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-indigo-950/20 group hover:border-slate-800 transition-all duration-500">
            {/* Background ambient radial glow colors */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* Left Column: Authentic Founder Portrait Card */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-5">
                
                {/* Image Container with high-fidelity glow aura */}
                <div className="relative group/avatar">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-60 blur-md group-hover/avatar:opacity-100 transition-all duration-750 group-hover/avatar:scale-105" />
                  <div className="relative rounded-full p-[2px] bg-slate-950 overflow-hidden w-44 h-44 md:w-52 md:h-52">
                    <img 
                      src="/assets/founder.png" 
                      alt="Sridharan S C" 
                      className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover/avatar:scale-102"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Verified Founder Badge pill overlay */}
                  <div className="absolute -bottom-2 -left-3 bg-[#0a0b10]/95 border border-white/[0.08] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                    <div className="h-5.5 w-5.5 bg-blue-500/15 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/30">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400 font-bold" />
                    </div>
                    <div className="text-left font-sans">
                      <p className="text-[9px] font-bold text-white leading-none">Verified Founder</p>
                      <p className="text-[7.5px] text-slate-400 leading-none mt-0.5">Identity Verified</p>
                    </div>
                  </div>
                </div>

                {/* Founder Professional Details */}
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-100 leading-tight">
                    Sridharan S C
                  </h3>
                  <p className="text-xs font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Founder & CEO
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Trust Me AI Builder
                  </p>
                </div>

                {/* Secure Social Connects */}
                <div className="flex items-center gap-2.5 pt-1">
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all duration-300"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <Github className="h-3.5 w-3.5" />
                  </a>
                </div>

              </div>
              
              {/* Right Column: Narrative Message & Blockquote */}
              <div className="lg:col-span-8 space-y-5 md:space-y-6">
                
                {/* Real-time rating status bar */}
                <div className="flex items-center gap-2 md:gap-3 bg-white/[0.02] border border-white/[0.05] py-1.5 px-3.5 rounded-full w-fit">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-200">5.0</span>
                  <span className="h-3.5 w-px bg-white/[0.08]" />
                  <span className="text-[10.5px] text-slate-450 font-mono font-medium">From 100+ Creator Reviews</span>
                </div>

                {/* Text Description */}
                <div className="space-y-4 text-[12.5px] md:text-[13.5px] leading-relaxed text-slate-300 font-sans tracking-wide">
                  <p>
                    <span className="font-extrabold text-blue-400">Trust Me AI Builder</span> was founded with a vision to make software creation accessible to everyone. We believe innovation should not be limited by technical barriers. By combining advanced AI, intelligent automation, and seamless deployment, our platform empowers creators, students, startups, and businesses to transform ideas into real-world applications faster than ever before.
                  </p>
                  <p>
                    Our mission is simple: help anyone build, launch, and scale digital products with confidence. Every feature in Trust Me AI Builder is designed to simplify development, accelerate innovation, and unlock new opportunities for the next generation of creators.
                  </p>
                </div>

                {/* Styled Quote Box */}
                <div className="p-4 md:p-5 rounded-2xl bg-indigo-950/15 border border-indigo-500/10 relative shadow-inner overflow-hidden">
                  <div className="absolute top-2 left-2 text-indigo-500/10 pointer-events-none">
                    <Quote className="h-10 w-10 transform -rotate-12" />
                  </div>
                  <p className="text-[12.5px] md:text-xs text-indigo-250 italic leading-relaxed pl-5 relative z-10">
                    "The future belongs to those who can turn ideas into reality quickly. Trust Me AI Builder is built to make that future accessible to everyone."
                  </p>
                  <div className="mt-2.5 text-right font-sans">
                    <span className="text-[11px] font-bold text-indigo-400">— Sridharan S C</span>
                    <span className="text-[9.5px] text-slate-500 font-mono block">Founder & CEO</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Highlights Row */}
            <div className="mt-8 pt-6 border-t border-white/[0.03] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl hover:bg-white/[0.01] transition-all">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-xs md:text-sm font-bold text-slate-200">Ideas to Apps</span>
                </div>
                <p className="text-[10px] text-slate-550 font-mono">In Minutes</p>
              </div>

              <div className="p-3 rounded-xl hover:bg-white/[0.01] transition-all">
                <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs md:text-sm font-bold text-slate-200">10K+</span>
                </div>
                <p className="text-[10px] text-slate-550 font-mono">Active Creators</p>
              </div>

              <div className="p-3 rounded-xl hover:bg-white/[0.01] transition-all">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs md:text-sm font-bold text-slate-200">150+</span>
                </div>
                <p className="text-[10px] text-slate-550 font-mono">Countries</p>
              </div>

              <div className="p-3 rounded-xl hover:bg-white/[0.01] transition-all">
                <div className="flex items-center justify-center gap-1 text-indigo-400 mb-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-xs md:text-sm font-bold text-slate-200">99.9%</span>
                </div>
                <p className="text-[10px] text-slate-550 font-mono">Uptime & Reliable</p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* FAQ ACCORDION SECTION */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-200">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 font-mono">Everything you need to raise compile speeds</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.01] transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                      {faq.q}
                    </span>
                    <span className="text-slate-500 font-mono font-bold text-xs">
                      {isOpen ? "[-]" : "[+]"}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="px-5 pb-4 text-[11.5px] text-slate-400 leading-relaxed font-sans mt-1">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA JUMBOTRON */}
        <div className="text-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden max-w-4xl mx-auto shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-5 z-10 relative">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
              Start Building Your Next Big Idea Today
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
              Thousands of creators are already building with Trust Me AI Builder. Experience fast compilation sandboxes and instant production hosting.
            </p>
            <div className="pt-3">
              <button 
                onClick={() => handlePlanClick("Medium", "₹999", 100, false)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>🚀 Start Free Trial</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Credit card not required to lock in trial tiers. Unlimited scaling deployments available.
            </p>
          </div>
        </div>

      </div>

      {/* Razorpay integration: clicking a plan opens official Razorpay Checkout (no simulated UI) */}
    </div>
  );
}
