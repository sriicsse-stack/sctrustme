import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { CheckCircle2, UploadCloud, ShieldCheck, Clock, AlertTriangle, FileText, XCircle, ThumbsUp, Shield } from "lucide-react";

interface StudentVerificationProps {
  currentUser: null | { name: string; email: string; googleId: string };
  onStatusChanged?: () => void;
}

interface VerificationRequest {
  id: string;
  googleId: string;
  email: string;
  name: string;
  documentType: string;
  documentName: string;
  documentPath: string | null;
  documentUrl: string | null;
  documentMimeType: string | null;
  note: string | null;
  status: "none" | "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  reviewer: string | null;
  reviewerNotes: string | null;
}

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "verification-documents";
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || "").split(",").map((email: string) => email.trim().toLowerCase()).filter(Boolean);
const SUPPORTED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export default function StudentVerification({ currentUser, onStatusChanged }: StudentVerificationProps) {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [status, setStatus] = useState<VerificationRequest["status"]>("none");
  const [selectedType, setSelectedType] = useState("College ID");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminRequests, setAdminRequests] = useState<VerificationRequest[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isAdmin = Boolean(
    currentUser?.email &&
    (ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) || currentUser.email.toLowerCase().endsWith("@trustmeai.com"))
  );

  useEffect(() => {
    if (!currentUser) return;
    refreshVerificationStatus();
  }, [currentUser?.email, currentUser?.googleId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const refreshVerificationStatus = async () => {
    if (!currentUser) return;
    setLoadingState(true);
    setError(null);
    try {
      const res = await fetch("/api/verification/me");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to load verification requirements.");
      } else {
        setRequest(data.verificationRequest || null);
        setStatus(data.verificationStatus || "none");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to load verification status.");
    } finally {
      setLoadingState(false);
    }
  };

  const loadAdminRequests = async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    setReviewError(null);
    try {
      const res = await fetch("/api/verification/requests");
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Unable to load verification requests.");
      } else {
        setAdminRequests(data.requests || []);
      }
    } catch (err: any) {
      setReviewError(err?.message || "Unable to load verification requests.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError(null);
    setSuccess(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!SUPPORTED_FILE_TYPES.includes(file.type) && !/\.(png|jpe?g|pdf)$/i.test(file.name)) {
      setError("Supported file types: PDF, JPG, PNG.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadFileToSupabase = async (file: File) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase Storage is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const timestamp = Date.now();
    const storagePath = `verification/${currentUser?.googleId}/${timestamp}_${safeName}`;
    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      throw uploadError;
    }
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
    if (signedError) {
      throw signedError;
    }
    return { path: storagePath, url: signedData?.signedUrl || null };
  };

  const submitVerification = async () => {
    if (!currentUser) {
      setError("Sign in to submit a verification document.");
      return;
    }
    if (!selectedFile) {
      setError("Please choose a document to upload.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    setUploading(true);

    try {
      const uploadResult = await uploadFileToSupabase(selectedFile);
      const payload = {
        documentType: selectedType,
        documentName: selectedFile.name,
        documentPath: uploadResult.path,
        documentUrl: uploadResult.url,
        documentMimeType: selectedFile.type,
        note: `Submitted via student verification panel (${selectedType}).`,
      };

      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification submission failed.");
      } else {
        setSuccess("Verification request submitted. Your document is under review.");
        setSelectedFile(null);
        setPreviewUrl(null);
        setRequest(data.request || null);
        setStatus(data.request?.status || "pending");
        if (onStatusChanged) onStatusChanged();
      }
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const reviewRequest = async (requestId: string, decision: "approved" | "rejected") => {
    setReviewError(null);
    try {
      const res = await fetch("/api/verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: decision, reviewerNotes: `Reviewed by ${currentUser?.email || "admin"}.` }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Unable to update request.");
      } else {
        await loadAdminRequests();
        if (request?.id === requestId) {
          setRequest(data.request);
          setStatus(data.request.status);
        }
        if (onStatusChanged) onStatusChanged();
      }
    } catch (err: any) {
      setReviewError(err?.message || "Unable to update request.");
    }
  };

  const statusLabel = () => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending Review";
      default:
        return "Not Submitted";
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800/80 bg-[#101116] p-6 shadow-2xl shadow-black/20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold">Student Verification</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Upload your College ID or Bonafide document</h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-2">
            Submit a PDF, JPG, or PNG of your student ID or bonafide certificate. Our team will review the document and approve your student verification request.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-4 text-right">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Current request status</p>
          <div className="mt-2 text-lg font-semibold text-white">{statusLabel()}</div>
          {status === "approved" && <div className="text-emerald-400 text-sm mt-1">Student verification active.</div>}
          {status === "rejected" && <div className="text-rose-400 text-sm mt-1">Your submission was rejected. Please resubmit.</div>}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="inline-block h-4 w-4 mr-2 align-text-bottom" /> {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="inline-block h-4 w-4 mr-2 align-text-bottom" /> {success}
        </div>
      )}

      {!currentUser ? (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-center text-slate-300">
          Please sign in with Supabase to submit a student verification request.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Document Type
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500"
                >
                  <option>College ID</option>
                  <option>Bonafide Certificate</option>
                  <option>Other Student Document</option>
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                File Upload
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{selectedFile.type || "Unknown file type"} • {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                {previewUrl ? (
                  <img src={previewUrl} alt="Document preview" className="mt-4 rounded-3xl border border-slate-800 object-contain max-h-72 w-full" />
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-slate-700 p-6 text-sm text-slate-400 bg-slate-950/70">
                    PDF and document previews are not available inside the builder, but your file is ready to submit.
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={submitVerification}
              disabled={submitting || uploading || !selectedFile}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              {submitting ? "Submitting request..." : "Submit Verification"}
            </button>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-400">
              <p className="font-semibold text-slate-200">Accepted documents</p>
              <ul className="mt-3 space-y-2 list-disc pl-5">
                <li>College ID card or student ID</li>
                <li>Bonafide certificate PDF</li>
                <li>PDF, JPG, PNG only</li>
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure storage powered by Supabase</p>
                <p className="text-xs text-slate-400">Your uploaded documents are stored safely in a private verification bucket.</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Upload destination</p>
                <p className="mt-2 font-semibold text-slate-100">{STORAGE_BUCKET}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Verification review</p>
                <p className="mt-2 font-semibold text-slate-100">Manual approval by our team</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Status refresh</p>
                <button
                  type="button"
                  onClick={refreshVerificationStatus}
                  className="mt-2 rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 hover:bg-slate-700 transition"
                >
                  Refresh status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {request && (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-3xl bg-slate-900 p-3 text-slate-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Latest verification request</p>
              <p className="mt-1 text-white font-semibold">{request.documentName}</p>
              <p className="text-xs text-slate-500">Submitted {new Date(request.submittedAt).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-2">Current status: <span className="font-semibold text-white">{statusLabel()}</span></p>
              {request.reviewerNotes && <p className="text-xs text-slate-400 mt-2">Reviewer note: {request.reviewerNotes}</p>}
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold">Admin Review Panel</p>
              <h3 className="text-lg font-semibold text-white">Manage verification requests</h3>
            </div>
            <button
              type="button"
              onClick={loadAdminRequests}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-blue-500 transition"
            >
              Refresh requests
            </button>
          </div>
          {reviewError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{reviewError}</div>
          )}
          {adminLoading ? (
            <div className="text-slate-400">Loading requests...</div>
          ) : adminRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900 p-4 text-sm text-slate-400">No verification requests found.</div>
          ) : (
            <div className="space-y-4">
              {adminRequests.map((reqItem) => (
                <div key={reqItem.id} className="rounded-3xl border border-slate-800/70 bg-slate-900 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{reqItem.name} • {reqItem.email}</p>
                      <p className="text-xs text-slate-500">Type: {reqItem.documentType} • {new Date(reqItem.submittedAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Status: {reqItem.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => reviewRequest(reqItem.id, "approved")}
                        className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 hover:bg-emerald-400 transition"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewRequest(reqItem.id, "rejected")}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-rose-400 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
