import React, { useState } from "react";

export default function FeedbackPanel({ onClose }: { onClose?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Feedback");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!subject || !description) return alert('Please provide subject and description');
    setLoading(true);
    try {
      const res = await fetch('/api/feedback/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, subject, category, description, priority }) });
      const j = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit: ' + (j.error || JSON.stringify(j)));
      }
    } catch (e:any) {
      alert('Network error: ' + e.message);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="p-6 bg-[#0b0b0d] rounded-2xl border border-slate-800 w-full max-w-xl mx-auto">
      <h3 className="text-lg font-bold text-white mb-2">Thanks — feedback submitted</h3>
      <p className="text-sm text-slate-400">Our team will review and respond if you provided contact details.</p>
      <div className="mt-4">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => { setSuccess(false); if (onClose) onClose(); }}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#0b0b0d] rounded-2xl border border-slate-800 w-full max-w-xl mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">Feedback & Support</h3>
      <div className="grid grid-cols-1 gap-3">
        <input placeholder="Name" className="p-2 rounded bg-[#0f0f12] text-white" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" className="p-2 rounded bg-[#0f0f12] text-white" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Subject" className="p-2 rounded bg-[#0f0f12] text-white" value={subject} onChange={e=>setSubject(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)} className="p-2 rounded bg-[#0f0f12] text-white">
          <option>General Feedback</option>
          <option>Bug Report</option>
          <option>Feature Request</option>
          <option>Billing Issue</option>
          <option>Payment Issue</option>
          <option>Referral Issue</option>
          <option>Voice Assistant Issue</option>
          <option>Technical Support</option>
        </select>
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="p-2 rounded bg-[#0f0f12] text-white h-28" />
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 rounded bg-[#0f0f12] text-white">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>

        <div className="flex gap-2">
          <button onClick={submit} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>{loading? 'Submitting...':'Submit Feedback'}</button>
          <button onClick={() => { if (onClose) onClose(); }} className="px-4 py-2 border border-slate-700 text-white rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
