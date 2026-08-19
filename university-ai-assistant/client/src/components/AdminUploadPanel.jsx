import { useState } from 'react';
import { api } from '../lib/api.js';

export default function AdminUploadPanel({ courses, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    setStatus('');

    if (!file || !courseId || !password) {
      setStatus('يرجى تعبئة جميع الحقول.');
      return;
    }

    setBusy(true);
    try {
      const res = await api.uploadFile(file, courseId, password);
      setStatus(`تم الرفع بنجاح ✅ (${res.chunksIndexed} مقطع)`);
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setStatus(`فشل الرفع: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-brand-border pt-3 mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-sm text-brand-muted hover:text-brand-text flex items-center justify-between"
      >
        <span>لوحة رفع المسؤول</span>
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <form onSubmit={handleUpload} className="mt-3 space-y-2">
          <input
            type="password"
            placeholder="كلمة سر المسؤول"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-accent"
          />

          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-accent"
          >
            <option value="">اختر المقرر</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-accent hover:bg-brand-accentSoft transition rounded-lg py-1.5 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'جارٍ الرفع...' : 'رفع الملف'}
          </button>

          {status && <p className="text-xs text-brand-muted">{status}</p>}
        </form>
      )}
    </div>
  );
}
