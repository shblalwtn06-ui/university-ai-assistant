export default function Login({ onGoogleSignIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md bg-brand-panel border border-brand-border rounded-2xl p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-3xl">
          🎓
        </div>
        <h1 className="text-2xl font-bold mb-2">المساعد الأكاديمي الذكي</h1>
        <p className="text-brand-muted mb-8">
          سجّل الدخول باستخدام حساب جوجل الجامعي للوصول إلى مساعدك الدراسي المدعوم
          بالذكاء الاصطناعي.
        </p>

        <button
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold rounded-xl py-3 px-4 hover:bg-gray-100 transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5 29.3 3 24 3 15.8 3 8.8 7.7 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.1 40.5 16 45 24 45z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2C40.9 36 44 30.8 44 24c0-1.2-.1-2.4-.4-3.5z"
            />
          </svg>
          تسجيل الدخول عبر جوجل
        </button>

        <p className="text-xs text-brand-muted mt-6">
          يُطلب منك ربط رقمك الأكاديمي بعد تسجيل الدخول لأول مرة.
        </p>
      </div>
    </div>
  );
}
