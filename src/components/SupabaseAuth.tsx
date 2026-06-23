import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface SupabaseAuthProps {
  onSessionChange: (session: any) => void;
  onError: (message: string) => void;
  currentUser: any;
}

export default function SupabaseAuth({ onSessionChange, onError, currentUser }: SupabaseAuthProps) {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        handleError(error, "Unable to read Supabase session.");
      } else if (session) {
        onSessionChange(session);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        onSessionChange(session);
      } else {
        onSessionChange(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [onSessionChange]);

  const handleError = (error: any, fallback: string) => {
    const message = error?.message || error?.error_description || fallback;
    setMessage(message);
    onError(message);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return handleError(error, "Login failed. Check your credentials.");
      }
      if (!data.session) {
        setMessage("Check your email for a login link.");
      } else {
        onSessionChange(data.session);
      }
    } catch (error) {
      handleError(error, "Login failed due to a network issue.");
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        return handleError(error, "Signup failed. Please try again.");
      }
      if (!data.session) {
        setMessage("Verification email sent. Confirm your address to sign in.");
      } else {
        onSessionChange(data.session);
      }
    } catch (error) {
      handleError(error, "Signup failed due to a network issue.");
    }
    setLoading(false);
  };

  const handleOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) {
        return handleError(error, "OTP sign-in request failed.");
      }
      setMessage("Check your email for the one-time login link.");
    } catch (error) {
      handleError(error, "OTP sign-in failed due to a network issue.");
    }
    setLoading(false);
  };

  const handleProviderLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return handleError(error, `${provider} sign-in failed.`);
      }
    } catch (error) {
      handleError(error, `${provider} sign-in failed due to a network issue.`);
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return handleError(error, "Logout failed.");
      }
      onSessionChange(null);
    } catch (error) {
      handleError(error, "Logout failed due to a network issue.");
    }
    setLoading(false);
  };

  const sessionUser = currentUser?.user ?? currentUser;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-[#101116] p-6 shadow-xl shadow-black/40 max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Supabase Authentication</h2>
          <p className="text-sm text-slate-400">
            Use Google, email/password, or passwordless OTP to log in securely.
          </p>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-[0.25em]">
          {isSupabaseConfigured ? "Configured" : "Not configured"}
        </div>
      </div>

      {sessionUser ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-base font-semibold text-white">{sessionUser.email || sessionUser.user?.email}</p>
            <p className="text-xs text-slate-500">Provider: {sessionUser.provider || "email"}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 hover:bg-red-500 text-white px-4 py-3 font-semibold transition"
          >
            {loading ? "Signing out..." : "Log Out"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${authMode === "login" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${authMode === "signup" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
            >
              Email Signup
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("otp")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${authMode === "otp" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
            >
              OTP
            </button>
          </div>

          <div className="grid gap-4">
            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500"
              />
            </label>

            {authMode !== "otp" && (
              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500"
                />
              </label>
            )}

            {message && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={authMode === "login" ? handleLogin : authMode === "signup" ? handleSignup : handleOtp}
              disabled={loading || !email || (authMode !== "otp" && !password)}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Processing..." : authMode === "login" ? "Sign in" : authMode === "signup" ? "Create account" : "Send OTP link"}
            </button>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 text-sm text-slate-400">
              <p className="font-semibold text-slate-200">Social sign-in</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleProviderLogin("google")}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleProviderLogin("github")}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue with GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
