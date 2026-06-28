import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  Zap,
  ArrowRight,
  Download,
  File,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface StudentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; googleId: string } | null;
  onStatusChanged?: () => void;
}

export default function StudentVerificationModal({
  isOpen,
  onClose,
  currentUser,
  onStatusChanged,
}: StudentVerificationModalProps) {
  const [selectedType, setSelectedType] = useState("College ID");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [currentRequest, setCurrentRequest] = useState<any>(null);

  const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "verification-documents";
  const SUPPORTED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  useEffect(() => {
    if (isOpen && currentUser) {
      loadVerificationStatus();
    }
  }, [isOpen, currentUser]);

  const loadVerificationStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/verification/me");
      const data = await res.json();
      if (res.ok) {
        setVerificationStatus(data.verificationStatus || "none");
        setCurrentRequest(data.verificationRequest || null);
      }
    } catch (err) {
      console.error("Failed to load verification status:", err);
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

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type) && !/\.(png|jpe?g|pdf)$/i.test(file.name)) {
      setError("Supported file types: PDF, JPG, JPEG, PNG.");
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
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured");
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
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    if (signedError) {
      throw signedError;
    }

    return { path: storagePath, url: signedData?.signedUrl || null };
  };

  const submitVerification = async () => {
    if (!currentUser) {
      setError("You must be signed in to submit a verification document.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a document to upload.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    setUploading(true);

    try {
      let uploadResult = { path: null, url: null };
      
      if (isSupabaseConfigured && supabase) {
        uploadResult = await uploadFileToSupabase(selectedFile);
      }

      const payload = {
        documentType: selectedType,
        documentName: selectedFile.name,
        documentPath: uploadResult.path,
        documentUrl: uploadResult.url,
        documentMimeType: selectedFile.type,
        note: `Submitted via student verification (${selectedType}).`,
      };

      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification submission failed.");
        return;
      }

      setSuccess("✅ Verification request submitted! Our team will review your document within 24-48 hours.");
      setSelectedFile(null);
      setPreviewUrl(null);
      setVerificationStatus("pending");
      setCurrentRequest(data.request || null);
      
      if (onStatusChanged) {
        onStatusChanged();
      }

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4"
            >
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Sign In Required</h3>
              <p className="text-sm text-slate-400">
                Please sign in with your email or Google account to verify your student status.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-auto relative overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all text-slate-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/50 border border-indigo-900/30 rounded-full text-xs font-bold text-indigo-400">
                  <Shield className="h-3 w-3" />
                  <span>🎓 Student Verification</span>
                </div>
                <h2 className="text-3xl font-black text-white">Verify Your Student Status</h2>
                <p className="text-sm text-slate-400">
                  Get 60% OFF on the Basic Plan. Upload your college ID or bonafide certificate.
                </p>
              </div>

              {/* Status Display */}
              {verificationStatus !== "none" && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    verificationStatus === "approved"
                      ? "bg-emerald-950/20 border-emerald-900/30"
                      : verificationStatus === "pending"
                      ? "bg-amber-950/20 border-amber-900/30"
                      : "bg-rose-950/20 border-rose-900/30"
                  }`}
                >
                  {verificationStatus === "approved" && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-400">✅ Verified!</p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">
                          You are approved for the 60% student discount!
                        </p>
                      </div>
                    </>
                  )}
                  {verificationStatus === "pending" && (
                    <>
                      <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "3s" }} />
                      <div>
                        <p className="font-bold text-amber-400">⏳ Verification Pending</p>
                        <p className="text-xs text-amber-300/80 mt-0.5">
                          Your document is under review. We'll notify you within 24-48 hours.
                        </p>
                      </div>
                    </>
                  )}
                  {verificationStatus === "rejected" && (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-400">❌ Verification Rejected</p>
                        <p className="text-xs text-rose-300/80 mt-0.5">
                          Please resubmit with a clearer document image or different document type.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              {verificationStatus !== "approved" && (
                <div className="space-y-6">
                  {/* Document Type Selection */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Select Document Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["College ID", "Bonafide Certificate", "College Document"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-3 rounded-xl border-2 transition-all font-bold text-xs text-center ${
                            selectedType === type
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-white/[0.02] border-white/[0.05] text-slate-400 hover:border-indigo-500/50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Upload Document</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="block p-6 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500 transition-all cursor-pointer text-center bg-white/[0.01]"
                      >
                        <Upload className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                        <p className="font-bold text-white text-sm">
                          {selectedFile ? selectedFile.name : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5 MB)</p>
                      </label>
                    </div>
                  </div>

                  {/* File Preview */}
                  {selectedFile && (
                    <div className="rounded-xl border border-slate-700 bg-white/[0.01] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-indigo-400" />
                          <div>
                            <p className="font-bold text-white text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="p-1.5 bg-rose-950/30 hover:bg-rose-950/60 rounded text-rose-400 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Document preview"
                          className="rounded-lg max-h-64 w-full object-contain border border-slate-700"
                        />
                      )}
                    </div>
                  )}

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {success}
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 space-y-2">
                    <p className="font-bold text-blue-400 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Benefits of Student Verification
                    </p>
                    <ul className="text-xs text-blue-300/80 space-y-1 ml-6">
                      <li className="list-disc">60% OFF on Basic Plan (₹299 instead of ₹499)</li>
                      <li className="list-disc">Valid for 12 months from verification</li>
                      <li className="list-disc">Same features as the full Basic Plan</li>
                      <li className="list-disc">Easy to upgrade to higher plans anytime</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submitVerification}
                    disabled={!selectedFile || submitting}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      !selectedFile || submitting
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg hover:shadow-indigo-500/25"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Submit for Verification
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Verified State - Show CTA */}
              {verificationStatus === "approved" && (
                <div className="space-y-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">Verification Approved! 🎉</h3>
                    <p className="text-sm text-slate-400">
                      You can now claim the 60% student discount on the Basic Plan.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Pricing Plans</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
