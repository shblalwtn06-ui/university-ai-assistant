import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { api } from '../lib/api.js';

/**
 * useAuth
 * -------
 * Tracks the Supabase auth session and the corresponding `students`
 * profile row. Exposes helpers for Google sign-in, sign-out, and
 * completing onboarding.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshStudent = useCallback(async () => {
    try {
      const { student: s } = await api.getMe();
      setStudent(s);
    } catch (err) {
      console.error('Failed to load student profile:', err.message);
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await refreshStudent();
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await refreshStudent();
      } else {
        setStudent(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [refreshStudent]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStudent(null);
  }, []);

  const completeOnboarding = useCallback(
    async (academicId, fullName) => {
      const { student: s } = await api.onboard(academicId, fullName);
      setStudent(s);
    },
    []
  );

  return {
    session,
    user: session?.user || null,
    student,
    loading,
    isAuthenticated: !!session,
    needsOnboarding: !!session && !student,
    signInWithGoogle,
    signOut,
    completeOnboarding,
  };
}
