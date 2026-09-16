import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SavedTicket {
  id: number;
  event_id: string;
  tier_id: string;
  tier_name: string | null;
  quantity: number;
  table_number: number | null;
  total_cents: number;
  ticket_code: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
}

interface AuthCtx {
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  loading: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (eventId: string) => Promise<void>;
  tickets: SavedTicket[];
  savePurchase: (t: {
    event_id: string; tier_id: string; tier_name: string; quantity: number;
    table_number: number | null; total_cents: number; ticket_code: string;
    attendee_name?: string; attendee_email?: string;
  }) => Promise<SavedTicket | null>;
  updateTicketTable: (ticketId: number, table: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: favs }, { data: tix }] = await Promise.all([
      supabase.from('re_profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('re_favorites').select('event_id').eq('user_id', uid),
      supabase.from('re_tickets').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);
    setProfile((prof as Profile) || null);
    setFavorites((favs || []).map((f: any) => f.event_id));
    setTickets((tix || []) as SavedTicket[]);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      if (!active) return;
      if (s?.user) {
        setUser({ id: s.user.id, email: s.user.email ?? null });
        await loadUserData(s.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setFavorites([]);
        setTickets([]);
      }
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: error.message };
    const uid = data.user?.id;
    if (uid) {
      await supabase.from('re_profiles').upsert({
        id: uid, email: email.trim(), full_name: name.trim() || null, phone: phone?.trim() || null,
      });
      setProfile({ id: uid, email: email.trim(), full_name: name.trim() || null, phone: phone?.trim() || null });
    }
    if (!data.session) {
      const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (res.error) return { error: res.error.message };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const toggleFavorite = useCallback(async (eventId: string) => {
    if (!user) return;
    const on = favorites.includes(eventId);
    setFavorites(prev => (on ? prev.filter(f => f !== eventId) : [...prev, eventId]));
    if (on) await supabase.from('re_favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
    else await supabase.from('re_favorites').insert({ user_id: user.id, event_id: eventId });
  }, [user, favorites]);

  const savePurchase = useCallback<AuthCtx['savePurchase']>(async (t) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('re_tickets')
      .insert({ ...t, user_id: user.id })
      .select('*')
      .single();
    if (error || !data) return null;
    setTickets(prev => [data as SavedTicket, ...prev]);
    return data as SavedTicket;
  }, [user]);

  const updateTicketTable = useCallback(async (ticketId: number, table: number) => {
    if (!user) return;
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, table_number: table } : t)));
    await supabase.from('re_tickets').update({ table_number: table }).eq('id', ticketId).eq('user_id', user.id);
  }, [user]);

  const refresh = useCallback(async () => { if (user) await loadUserData(user.id); }, [user, loadUserData]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, displayName, signIn, signUp, signOut,
      favorites, toggleFavorite, tickets, savePurchase, updateTicketTable, refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
