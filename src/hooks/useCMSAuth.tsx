import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function CMSAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const checkRoles = async (userId: string) => {
    const { data: roles, error } = await supabase
      .from('blog_user_roles')
      .select('role')
      .eq('user_id', userId);

    console.log('[CMS Auth] checkRoles for', userId, '→ roles:', roles, 'error:', error);

    if (roles && roles.length > 0) {
      setIsAdmin(roles.some(r => r.role === 'admin'));
      setIsEditor(roles.some(r => r.role === 'editor' || r.role === 'admin'));
    } else {
      setIsAdmin(false);
      setIsEditor(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          if (isMounted) {
            await checkRoles(session.user.id);
            setLoading(false);
          }
        }, 0);
      } else {
        setIsAdmin(false);
        setIsEditor(false);
        if (isMounted) setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkRoles(session.user.id);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isEditor, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCMSAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCMSAuth must be used within a CMSAuthProvider');
  }
  return context;
}
