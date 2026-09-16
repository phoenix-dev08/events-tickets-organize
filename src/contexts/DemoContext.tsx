import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { ATTENDEES, Attendee, EVENTS, EventItem, SERVICE_FEE_RATE, TABLES, TableSeat } from '@/data/redeemed';
import { SavedTicket, useAuth } from '@/contexts/AuthContext';


export type ScreenKey =
  | 'explore' | 'tickets' | 'profile' | 'notifications'
  | 'event' | 'checkout' | 'tables' | 'payment' | 'success' | 'ticket'
  | 'org-dash' | 'org-attendees' | 'org-seating' | 'org-scan' | 'org-create';

export interface Screen { k: ScreenKey; id?: string }

interface Order {
  eventId: string;
  tierId: string;
  qty: number;
  table: number | null;
}

interface Ctx {
  mode: 'attendee' | 'organizer';
  switchMode: (m: 'attendee' | 'organizer') => void;
  switching: boolean;
  stack: Screen[];
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  setRoot: (s: Screen) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  order: Order;
  setQty: (tierId: string, qty: number) => void;
  setTable: (n: number | null) => void;
  clearOrder: () => void;
  activeEvent: EventItem;
  totals: { subtotal: number; fee: number; total: number; tierName: string; unit: number };
  purchased: boolean;
  completePurchase: () => Promise<void>;
  myTickets: SavedTicket[];
  activeTicket: SavedTicket | null;
  openTicket: (t: SavedTicket | null) => void;
  isAuthed: boolean;
  authSheet: { open: boolean; headline: string; sub: string; next: (() => void) | null };
  requireAuth: (opts: { headline?: string; sub?: string; then?: () => void }) => boolean;
  closeAuthSheet: () => void;
  runAuthNext: () => void;
  tables: TableSeat[];
  assign: (attendeeId: string, table: number) => void;
  undo: () => boolean;
  attendees: Attendee[];
  checkIn: (id: string) => void;
  toast: string | null;
  showToast: (m: string, tone?: 'dark' | 'green') => void;
  toastTone: 'dark' | 'green';
  following: string[];
  toggleFollow: (name: string) => void;
}


const DemoContext = createContext<Ctx | undefined>(undefined);

export const useDemo = () => {
  const c = useContext(DemoContext);
  if (!c) throw new Error('useDemo must be used inside DemoProvider');
  return c;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [mode, setMode] = useState<'attendee' | 'organizer'>('attendee');
  const [switching, setSwitching] = useState(false);
  const [stack, setStack] = useState<Screen[]>([{ k: 'explore' }]);
  const [guestFavorites, setGuestFavorites] = useState<string[]>(['light-sound']);
  const [following, setFollowing] = useState<string[]>(['Redeemed Collective']);
  const [order, setOrder] = useState<Order>({ eventId: 'redeem-2026', tierId: 'premium', qty: 0, table: null });
  const [purchased, setPurchased] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SavedTicket | null>(null);
  const [authSheet, setAuthSheet] = useState<{ open: boolean; headline: string; sub: string; next: (() => void) | null }>({
    open: false,
    headline: 'Save your seat',
    sub: 'Sign in to keep your tickets, favorites and table on every device.',
    next: null,
  });
  const [tables, setTables] = useState<TableSeat[]>(TABLES);
  const [attendees, setAttendees] = useState<Attendee[]>(ATTENDEES);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'dark' | 'green'>('dark');
  const timer = useRef<number>();
  const history = useRef<{ tables: TableSeat[]; attendees: Attendee[] }[]>([]);


  const showToast = useCallback((m: string, tone: 'dark' | 'green' = 'dark') => {
    setToast(m); setToastTone(tone);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const go = useCallback((s: Screen) => {
    setStack(prev => [...prev, s]);
  }, []);

  const back = useCallback(() => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const setRoot = useCallback((s: Screen) => setStack([s]), []);

  const switchMode = useCallback((m: 'attendee' | 'organizer') => {
    setSwitching(true);
    window.setTimeout(() => {
      setMode(m);
      setStack([{ k: m === 'organizer' ? 'org-dash' : 'explore' }]);
    }, 460);
    window.setTimeout(() => setSwitching(false), 900);
  }, []);

  const favorites = auth.user ? auth.favorites : guestFavorites;

  const requireAuth = useCallback((opts: { headline?: string; sub?: string; then?: () => void }) => {
    if (auth.user) return true;
    setAuthSheet({
      open: true,
      headline: opts.headline || 'Save your seat',
      sub: opts.sub || 'Sign in to keep your tickets, favorites and table on every device.',
      next: opts.then || null,
    });
    return false;
  }, [auth.user]);

  const closeAuthSheet = useCallback(() => setAuthSheet(s => ({ ...s, open: false })), []);

  const runAuthNext = useCallback(() => {
    setAuthSheet(s => {
      if (s.next) window.setTimeout(s.next, 240);
      return { ...s, open: false, next: null };
    });
  }, []);

  const openTicket = useCallback((t: SavedTicket | null) => setActiveTicket(t), []);

  const toggleFav = useCallback((id: string) => {
    if (auth.user) { void auth.toggleFavorite(id); return; }
    const ok = requireAuth({
      headline: 'Save this event',
      sub: 'Create a free account to keep favorites on every device.',
    });
    if (!ok) return;
    setGuestFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  }, [auth, requireAuth]);


  const toggleFollow = useCallback((name: string) => {
    setFollowing(prev => (prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]));
  }, []);

  const screen = stack[stack.length - 1];

  const activeEvent = useMemo(() => {
    const id = screen.k === 'event' ? screen.id : order.eventId;
    return EVENTS.find(e => e.id === id) || EVENTS[0];
  }, [screen, order.eventId]);

  const setQty = useCallback((tierId: string, qty: number) => {
    setOrder(prev => ({
      ...prev,
      eventId: EVENTS.find(e => e.tickets.some(t => t.id === tierId) && e.id === prev.eventId)?.id || prev.eventId,
      tierId,
      qty: Math.max(0, Math.min(8, qty)),
    }));
  }, []);

  const setTable = useCallback((n: number | null) => setOrder(prev => ({ ...prev, table: n })), []);

  const clearOrder = useCallback(() => setOrder(prev => ({ ...prev, qty: 0, table: null })), []);

  const totals = useMemo(() => {
    const ev = EVENTS.find(e => e.id === order.eventId) || EVENTS[0];
    const tier = ev.tickets.find(t => t.id === order.tierId) || ev.tickets[0];
    const subtotal = tier.price * order.qty;
    const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    return { subtotal, fee, total: Math.round((subtotal + fee) * 100) / 100, tierName: tier.name, unit: tier.price };
  }, [order]);

  const completePurchase = useCallback(async () => {
    setPurchased(true);
    setTables(prev => prev.map(t => (t.id === order.table ? { ...t, taken: Math.min(t.seats, t.taken + 1), guests: ['You', ...t.guests].slice(0, 3) } : t)));
    setAttendees(prev => prev.map(a => (a.name === 'Maya Johnson' ? { ...a, table: order.table ?? a.table, tier: 'Premium' } : a)));

    if (auth.user) {
      const ev = EVENTS.find(e => e.id === order.eventId) || EVENTS[0];
      const tier = ev.tickets.find(t => t.id === order.tierId) || ev.tickets[0];
      const code = `RE-${Math.floor(100000 + Math.random() * 899999)}`;
      const saved = await auth.savePurchase({
        event_id: ev.id,
        tier_id: tier.id,
        tier_name: tier.name,
        quantity: Math.max(1, order.qty),
        table_number: order.table,
        total_cents: Math.round(tier.price * Math.max(1, order.qty) * (1 + SERVICE_FEE_RATE) * 100),
        ticket_code: code,
        attendee_name: auth.displayName,
        attendee_email: auth.user.email || undefined,
      });
      if (saved) setActiveTicket(saved);
    }
  }, [order, auth]);


  const assign = useCallback((attendeeId: string, table: number) => {
    history.current.push({ tables, attendees });
    setAttendees(prev => prev.map(a => (a.id === attendeeId ? { ...a, table } : a)));
    setTables(prev => prev.map(t => {
      const was = attendees.find(a => a.id === attendeeId)?.table;
      if (t.id === table) return { ...t, taken: Math.min(t.seats, t.taken + 1) };
      if (t.id === was) return { ...t, taken: Math.max(0, t.taken - 1) };
      return t;
    }));
  }, [tables, attendees]);

  const undo = useCallback(() => {
    const last = history.current.pop();
    if (!last) return false;
    setTables(last.tables);
    setAttendees(last.attendees);
    return true;
  }, []);

  const checkIn = useCallback((id: string) => {
    setAttendees(prev => prev.map(a => (a.id === id ? { ...a, checkedIn: true, time: '9:42 AM' } : a)));
  }, []);

  const value: Ctx = {
    mode, switchMode, switching, stack, screen, go, back, setRoot,
    favorites, toggleFav, order, setQty, setTable, clearOrder, activeEvent, totals,
    purchased, completePurchase, tables, assign, undo, attendees, checkIn,
    toast, showToast, toastTone, following, toggleFollow,
    myTickets: auth.tickets, activeTicket, openTicket,
    isAuthed: !!auth.user, authSheet, requireAuth, closeAuthSheet, runAuthNext,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
