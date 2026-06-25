import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, Clock, ArrowRight, Check } from "lucide-react";

interface StudentOfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyNow: () => void;
  timeLeft?: number;
}

export default function StudentOfferPopup({
  isOpen,
  onClose,
  onVerifyNow,
  timeLeft = 86400, // 24 hours in seconds
}: StudentOfferPopupProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const benefits = [
    "60% OFF on Basic Plan",
    "Pay ₹299 instead of ₹499",
    "Valid for 12 months",
    "Same great features",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 overflow-hidden"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white">🎓 Student Special Offer</h2>
                  <p className="text-sm text-indigo-400 font-semibold">Limited time student verification discount</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl border border-indigo-500/30 shrink-0"
                >
                  <Gift className="h-6 w-6 text-indigo-400" />
                </motion.div>
              </div>

              {/* Main offer message */}
              <div className="space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Verify your student status and unlock an exclusive <span className="font-bold text-amber-400">60% discount</span> on our Basic Plan!
                </p>

                {/* Price comparison */}
                <div className="flex items-center justify-center gap-3 p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-mono font-bold">Regular Price</p>
                    <p className="text-lg font-bold text-slate-400 line-through">₹499</p>
                  </div>
                  <div className="h-12 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />
                  <div className="text-left">
                    <p className="text-xs text-emerald-400 uppercase font-mono font-bold">Student Price</p>
                    <p className="text-lg font-black text-emerald-400">₹299</p>
                  </div>
                </div>
              </div>

              {/* Benefits list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benefits included:</p>
                <div className="space-y-1.5">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time remaining */}
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-400">
                  Offer expires in: <span className="font-mono font-bold text-amber-400">{formatTime(timeLeft)}</span>
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onVerifyNow}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Verify Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold rounded-xl transition-all border border-white/10"
                >
                  Maybe Later
                </button>
              </div>

              {/* Footer text */}
              <p className="text-xs text-slate-500 text-center">
                Only for verified college students. Takes less than 2 minutes to verify.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
