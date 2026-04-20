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
      email: email
    });

    // 1. IMMEDIATE OWNER BYPASS (Source of truth for initial setup)
    if (email === 'owner@gmail.com' || email === 'admin@tfs.com') {
      console.log("DEBUG: Owner bypass triggered for:", email);
      setIsPendingApproval(false);
      return {
        id: sessionUser.id,
        email: sessionUser.email || email,
        name: 'Gnanasekaran',
        role: 'owner',
        isApproved: true,
        applicationStatus: 'approved'
      };
    }

    try {
      console.log("DEBUG: Fetching from 'users' table...");
      // 2. Try to get profile from 'users' table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();


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
    // 1. Create a BroadcastChannel to sync logout across tabs
    const logoutChannel = new BroadcastChannel('auth_logout');
    logoutChannel.onmessage = (event) => {
      if (event.data === 'logout') {
        console.log("DEBUG: Received logout signal from another tab");
        setCurrentUser(null);
        setIsPendingApproval(false);
        window.location.href = '/login';
      }
    };

    // Fail-safe: Force loading to stop after 5 seconds no matter what
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("DEBUG: Auth timeout reached, forcing loading to stop");
        setIsLoading(false);
      }
    }, 5000);

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await getProfile(session.user);
          setCurrentUser(profile);
        }
      } catch (e) {
        console.error("DEBUG: Init error:", e);
      } finally {
        setIsLoading(false);
        clearTimeout(timeout);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("DEBUG: Auth state changed:", event, session?.user?.email);

      try {
        if (session) {
          const profile = await getProfile(session.user);
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
          setIsPendingApproval(false);
        }
      } catch (e) {
        console.error("DEBUG: Auth change error:", e);
      } finally {
        setIsLoading(false);
        clearTimeout(timeout);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    let timeoutId: any;
    try {
      console.log("DEBUG: Login attempt started for:", email);
      setIsPendingApproval(false);

      // 1. Brief pause to ensure Capacitor native bridge is ready
      await new Promise(r => setTimeout(r, 200));

      // 2. Extended timeout for mobile networks (30 seconds)
      const loginTimeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Login timed out. Please check your internet connection and try again.")), 30000);
      });

      // 3. Race the login against the timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      const result: any = await Promise.race([loginPromise, loginTimeout]);
      const { data, error } = result;

      if (timeoutId) clearTimeout(timeoutId);

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, message: error.message };
      }

      if (data.session) {
        console.log("DEBUG: Session established, verifying profile...");

        // Ensure session is recognized by the client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        // Fetch profile
        const profile = await getProfile(data.session.user);
        console.log("DEBUG: Profile fetched:", profile);

        setCurrentUser(profile);
        return { success: true, profile };
      }

      return { success: false, message: "Failed to establish session." };
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Unexpected login error:", err);
      return { success: false, message: err.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      console.log("DEBUG: Permanent logout initiated...");
      // 1. Clear local state first
      setCurrentUser(null);
      setIsPendingApproval(false);

      // 2. Perform the actual sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Supabase signOut error:", error.message);

      // 3. NUCLEAR OPTION: Clear EVERYTHING
      localStorage.clear();
      sessionStorage.clear();

      // Clear all Cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 4. Force a hard redirect to login to break any memory-held sessions
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = '/login';
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
