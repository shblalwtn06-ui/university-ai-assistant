import AdminUploadPanel from './AdminUploadPanel.jsx';

export default function Sidebar({
  courses,
  selectedCourseId,
  onSelectCourse,
  files,
  onRefreshFiles,
}) {
  return (
    <aside className="w-72 shrink-0 bg-brand-panel border-l border-brand-border flex flex-col p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-brand-muted mb-2">المقررات</h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCourse(null)}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm transition ${
              !selectedCourseId
                ? 'bg-brand-accent/20 text-brand-accentSoft'
                : 'hover:bg-brand-bg text-brand-text'
            }`}
          >
            كل المقررات
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition ${
                selectedCourseId === course.id
                  ? 'bg-brand-accent/20 text-brand-accentSoft'
                  : 'hover:bg-brand-bg text-brand-text'
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-brand-muted mb-2">الملفات المرفوعة</h3>
        <div className="space-y-1">
          {files.length === 0 && (
            <p className="text-xs text-brand-muted">لا توجد ملفات مرفوعة بعد.</p>
          )}
          {files.map((f) => (
            <div
              key={`${f.courseId}-${f.fileName}`}
              className="text-xs bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 flex items-center justify-between gap-2"
              title={f.fileName}
            >
              <span className="truncate">📄 {f.fileName}</span>
              <span className="text-brand-muted shrink-0">{f.chunkCount}</span>
            </div>
          ))}
        </div>
      </div>

      <AdminUploadPanel courses={courses} onUploaded={onRefreshFiles} />
    </aside>
  );
}
