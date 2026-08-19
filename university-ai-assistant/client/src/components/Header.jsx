export default function Header({ student, selectedCourseName, onSignOut }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-brand-border bg-brand-panel">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-brand-accent/20 flex items-center justify-center">
          🎓
        </div>
        <div>
          <p className="font-semibold leading-tight">المساعد الأكاديمي الذكي</p>
          {selectedCourseName && (
            <p className="text-xs text-brand-muted leading-tight">{selectedCourseName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {student && (
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium leading-tight">{student.full_name}</p>
            <p className="text-xs text-brand-muted leading-tight" dir="ltr">
              {student.academic_id}
            </p>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="text-sm px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-bg transition"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
