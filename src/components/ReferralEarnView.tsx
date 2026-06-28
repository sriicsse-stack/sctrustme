import React, { useEffect, useState, useMemo } from "react";
import { Copy, Check, Users } from "lucide-react";

interface ReferralRecord {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
  creditsEarned: number;
}

interface ReferralSummary {
  referrals: ReferralRecord[];
  count: number;
  successfulCount: number;
  pendingCount: number;
  creditsEarned: number;
}

interface ReferralEarnViewProps {
  isLoggedIn: boolean;
  userGoogleId: string | null;
  credits: number;
  onRefresh?: () => void;
}

export default function ReferralEarnView({ isLoggedIn, userGoogleId, credits, onRefresh }: ReferralEarnViewProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<ReferralSummary>({
    referrals: [],
    count: 0,
    successfulCount: 0,
    pendingCount: 0,
    creditsEarned: 0
  });

  const referralLink = useMemo(() => {
    if (!isLoggedIn || !userGoogleId) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://trustmeai.com";
    return `${origin}/?ref=${encodeURIComponent(userGoogleId)}`;
  }, [isLoggedIn, userGoogleId]);

  const shareText = useMemo(
    () => `Join Trust Me AI Builder and get 10 welcome credits on sign up! ${referralLink}`,
    [referralLink]
  );

  // Fetch referral dashboard data
  useEffect(() => {
    if (!isLoggedIn || !userGoogleId) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/referral/dashboard?code=${encodeURIComponent(userGoogleId)}`);
        const data = await res.json();
        if (res.ok && data) {
          setDashboard(data);
        }
      } catch (e) {
        console.error("Failed to load referral dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isLoggedIn, userGoogleId]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openShareUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Trust Me AI Builder",
          text: "Join and earn credits when you sign up.",
          url: referralLink
        });
      } catch (error) {
        console.warn("Share canceled", error);
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Referral Program</h1>
          <p className="text-slate-400">Sign in to access your referral dashboard and start earning credits by inviting friends.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8 select-text">
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
        {/* Left Section */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-950/95 to-blue-950/80 p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_36%)] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-400">Referral Dashboard</span>
                  <h1 className="mt-3 text-3xl md:text-4xl font-black text-white leading-tight">Refer friends. Earn credits. Grow faster.</h1>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-4 text-right">
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-400">Current Credits</span>
                  <span className="mt-2 block text-3xl font-extrabold text-emerald-300">{credits}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Successful Referrals</span>
                  <p className="mt-2 text-2xl font-bold text-white">{dashboard.successfulCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Pending Referrals</span>
                  <p className="mt-2 text-2xl font-bold text-white">{dashboard.pendingCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Credits Earned</span>
                  <p className="mt-2 text-2xl font-bold text-amber-300">{dashboard.creditsEarned}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Your Invite Link</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-blue-300 truncate select-all">
                    {referralLink}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center rounded-3xl bg-emerald-500 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-emerald-600 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Share Across Channels</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => openShareUrl(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}
                    className="rounded-3xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)}
                    className="rounded-3xl bg-blue-700 hover:bg-blue-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => openShareUrl(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join Trust Me AI Builder and earn credits!')}`)}
                    className="rounded-3xl bg-cyan-600 hover:bg-cyan-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={() => openShareUrl(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join Trust Me AI Builder and earn credits!')}`)}
                    className="rounded-3xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    X / Twitter
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="rounded-3xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-5 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold">How It Works</div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>You earn <strong>45 credits</strong> for each successful referral signup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Your referred friend gets <strong>10 welcome credits</strong> instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Unlimited referrals</strong> — no caps on earning potential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Referral History */}
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl h-fit">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Recent Activity</span>
              <h2 className="mt-2 text-xl font-bold text-white">Referral History</h2>
            </div>
            <div className="rounded-3xl bg-slate-900 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              {dashboard.count} total
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">
              <div className="inline-block h-5 w-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-2"></div>
              <p className="text-sm">Loading referrals...</p>
            </div>
          ) : dashboard.referrals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800/60 p-8 text-center text-slate-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No referrals yet</p>
              <p className="text-xs mt-1">Share your link above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {dashboard.referrals.map((ref) => (
                <div key={ref.id} className="rounded-3xl border border-slate-800/80 bg-slate-900 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{ref.name}</p>
                      <p className="text-[11px] text-slate-400">{ref.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        {new Date(ref.joinedAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-flex mt-2 rounded-full px-3 py-1 text-[10px] font-semibold ${
                        ref.status === 'verified' 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                          : 'bg-yellow-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {ref.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-3 text-sm text-slate-300">
                    <span>Credits earned</span>
                    <span className="font-semibold text-white">+{ref.creditsEarned} CR</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
