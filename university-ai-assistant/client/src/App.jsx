import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { api } from './lib/api.js';

import Login from './components/Login.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Sidebar from './components/Sidebar.jsx';
import Chat from './components/Chat.jsx';

export default function App() {
  const {
    loading,
    isAuthenticated,
    needsOnboarding,
    student,
    user,
    signInWithGoogle,
    signOut,
    completeOnboarding,
  } = useAuth();

  const [courses, setCourses] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const loadCourses = useCallback(async () => {
    try {
      const { courses: c } = await api.getCourses();
      setCourses(c);
    } catch (err) {
      console.error('Failed to load courses:', err.message);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const { files: f } = await api.getFiles();
      setFiles(f);
    } catch (err) {
      console.error('Failed to load files:', err.message);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && student) {
      loadCourses();
      loadFiles();
    }
  }, [isAuthenticated, student, loadCourses, loadFiles]);

  const visibleFiles = selectedCourseId
    ? files.filter((f) => f.courseId === selectedCourseId)
    : files;

  const selectedCourseName = courses.find((c) => c.id === selectedCourseId)?.name;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-muted">
        جارٍ التحميل...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onGoogleSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {needsOnboarding && (
        <OnboardingModal
          defaultName={user?.user_metadata?.full_name}
          onSubmit={completeOnboarding}
        />
      )}

      <Header student={student} selectedCourseName={selectedCourseName} onSignOut={signOut} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          files={visibleFiles}
          onRefreshFiles={loadFiles}
        />
        <Chat courseId={selectedCourseId} />
      </div>

      <Footer />
    </div>
  );
}
