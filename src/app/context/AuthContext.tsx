import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "../../supabase";

interface User {
  id: string;
  email: string | null;
  name: string;
  role: string;
  isApproved: boolean;
  applicationStatus?: 'pending' | 'rejected' | 'approved';
  rejectionReason?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; profile?: User | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPendingApproval: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const getProfile = async (sessionUser: any): Promise<User | null> => {
    if (!sessionUser) {
      console.log("DEBUG: No sessionUser provided to getProfile");
      setIsPendingApproval(false);
      return null;
    }

    const rawEmail = sessionUser.email || sessionUser.user_metadata?.email || '';
    const email = rawEmail.toLowerCase().trim();

    console.log("DEBUG: getProfile execution started", {
      id: sessionUser.id,
      email: email,
      rawEmail: rawEmail
    });

    // 1. Database-driven Owner Check
    // We check the 'users' table first. If the user is marked as 'owner' in the DB,
    // that is the primary source of truth.

    try {
      // 2. Try to get profile from 'users' table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (profile) {
        console.log("DEBUG: Found profile in 'users' table", profile);
        setIsPendingApproval(false);
        return {
          ...profile,
          isApproved: true,
          applicationStatus: 'approved'
        };
      }

      // 3. Fallback for the very first setup (Owner bypass)
      // This is ONLY for initial setup. You should add this user to the 'users' table.
      if (email === 'owner@gmail.com' || email === 'admin@tfs.com') {
        console.log("DEBUG: Initial setup owner detected:", email);
        setIsPendingApproval(false);
        return {
          id: sessionUser.id,
          email: sessionUser.email || email,
          name: 'System Administrator',
          role: 'owner',
          isApproved: true,
          applicationStatus: 'approved'
        };
      }

      console.log("DEBUG: No profile in 'users' table, checking 'member_applications'");

      // 3. If not in 'users', check 'member_applications'
      const { data: application } = await supabase
        .from('member_applications')
        .select('status, rejection_reason, requested_role')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (application) {
        console.log("DEBUG: Found application in 'member_applications'", application);
        const isPending = application.status === 'pending';
        const isApproved = application.status === 'approved';
        setIsPendingApproval(isPending);

        return {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
          role: isApproved ? (application.requested_role || 'sales') : 'guest',
          isApproved: isApproved,
          applicationStatus: application.status as any,
          rejectionReason: application.rejection_reason
        };
      }

      // 4. Truly unknown user
      setIsPendingApproval(true);
      return {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.email?.split('@')[0] || 'User',
        role: 'guest',
        isApproved: false,
        applicationStatus: 'pending'
      };
    } catch (e) {
      console.error("Profile fetch error:", e);
      setIsPendingApproval(false);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await getProfile(session.user);
          setCurrentUser(profile);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("DEBUG: Auth state changed:", event, session?.user?.email);

      if (session) {
        const profile = await getProfile(session.user);
        setCurrentUser(profile);
      } else {
        // Handle signed out state
        setCurrentUser(null);
        setIsPendingApproval(false);
      }

      // Crucial: ensure loading state is cleared after profile attempt
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Clear any previous pending state
      setIsPendingApproval(false);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, message: error.message };
      }

      if (data.session) {
        // Fetch profile immediately to return it
        const profile = await getProfile(data.session.user);
        setCurrentUser(profile);
        return { success: true, profile };
      }

      return { success: false, message: "Failed to establish session." };
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      return { success: false, message: err.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      // 1. Clear local state first for immediate UI responsiveness
      setCurrentUser(null);
      setIsPendingApproval(false);

      // 2. Perform the actual sign out
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Supabase signOut error:", error.message);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser && currentUser.isApproved, isLoading, isPendingApproval }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
