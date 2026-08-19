import { useState } from 'react';

export default function OnboardingModal({ defaultName, onSubmit }) {
  const [academicId, setAcademicId] = useState('');
  const [fullName, setFullName] = useState(defaultName || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (academicId.trim().length < 3) {
      setError('الرقم الأكاديمي غير صالح.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(academicId.trim(), fullName.trim());
    } catch (err) {
      setError(err.message || 'حدث خطأ ما، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm bg-brand-panel border border-brand-border rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-1">أدخل رقمك الأكاديمي</h2>
        <p className="text-sm text-brand-muted mb-6">
          لإتمام إنشاء حسابك وربطه بسجلاتك الدراسية.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-brand-muted">الاسم الكامل</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 outline-none focus:border-brand-accent"
              placeholder="الاسم الثلاثي"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-brand-muted">الرقم الأكاديمي</label>
            <input
              type="text"
              value={academicId}
              onChange={(e) => setAcademicId(e.target.value)}
              required
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 outline-none focus:border-brand-accent"
              placeholder="مثال: CS2024-0451"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-accent hover:bg-brand-accentSoft transition rounded-lg py-2.5 font-semibold disabled:opacity-60"
          >
            {submitting ? 'جارٍ الحفظ...' : 'متابعة'}
          </button>
        </form>
      </div>
    </div>
  );
}
