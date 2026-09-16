import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { uid, computeFees, txnId, orderNumber, avatarFallback } from '@/lib/store-helpers';
import {
  emptyDb, ensureSeeded, loadAll, reloadCollections, insertRow, insertRows, updateRow, updateRows,
  deleteRow, deleteWhere, deleteIn, claimPlacement, wipeDatabase, seedDatabase, subscribeRealtime,
} from '@/lib/db';

export type NavEntry = { route: string; params?: any };
type Toast = { id: string; text: string; kind: 'success' | 'error' | 'info' };

const SESSION_KEY = 'redeemed_events_session_v2';

const AppCtx = createContext<any>(null);
export const useApp = () => useContext(AppCtx);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDbState] = useState<any>(emptyDb);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  });
  const [nav, setNav] = useState<NavEntry[]>([{ route: 'explore' }]);
  const [tab, setTabState] = useState('explore');
  const [cart, setCart] = useState<any[]>([]);
  const [checkout, setCheckout] = useState<any>({ holders: {}, answers: {}, coupon: null, placement: {}, hold: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('re_theme') as any) || 'light');
  const [offline, setOffline] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [holdSeconds, setHoldSeconds] = useState(600);
  const [tick, setTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const pending = useRef<Set<string>>(new Set());
  const timer = useRef<any>(null);
  const offlineRef = useRef(offline);
  offlineRef.current = offline;

  /* ---------------------- boot: load from Postgres ---------------------- */
  const boot = async () => {
    setBooting(true); setBootError(null);
    try {
      const data = await ensureSeeded();
      setDbState(data);
    } catch (e: any) {
      setBootError(e?.message || 'Could not reach the database.');
    } finally { setBooting(false); }
  };
  useEffect(() => { boot(); }, []); // eslint-disable-line

  /* ------------------------ realtime subscriptions ---------------------- */
  const scheduleReload = (collection: string) => {
    if (offlineRef.current) return;
    pending.current.add(collection);
    if (timer.current) return;
    timer.current = setTimeout(async () => {
      const keys = Array.from(pending.current);
      pending.current.clear();
      timer.current = null;
      try {
        setSyncing(true);
        const patchData = await reloadCollections(keys);
        setDbState((prev: any) => ({ ...prev, ...patchData }));
      } finally { setSyncing(false); }
    }, 400);
  };
  useEffect(() => subscribeRealtime(scheduleReload), []); // eslint-disable-line

  useEffect(() => { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }, [session]);
  useEffect(() => {
    localStorage.setItem('re_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => { const t = setInterval(() => setTick((v) => v + 1), 1000); return () => clearInterval(t); }, []);

  /* --------------- local mirror + write-through to Postgres ------------- */
  const local = (fn: (d: any) => any) => setDbState((prev: any) => ({ ...fn({ ...prev }) }));
  const addLocal = (key: string, rows: any[]) => local((d) => ({ ...d, [key]: [...rows, ...(d[key] || [])] }));
  const patchLocal = (key: string, id: string, p: any) => local((d) => ({ ...d, [key]: (d[key] || []).map((r: any) => (r.id === id ? { ...r, ...p } : r)) }));
  const removeLocal = (key: string, pred: (r: any) => boolean) => local((d) => ({ ...d, [key]: (d[key] || []).filter((r: any) => !pred(r)) }));

  const create = (key: string, row: any) => { addLocal(key, [row]); void insertRow(key, row); return row; };
  const createMany = (key: string, rows: any[]) => { if (rows.length) { addLocal(key, rows); void insertRows(key, rows); } return rows; };
  const patch = (key: string, id: string, p: any) => { patchLocal(key, id, p); void updateRow(key, id, p); };
  const patchMany = (key: string, rows: any[]) => {
    if (!rows.length) return;
    local((d) => ({ ...d, [key]: (d[key] || []).map((r: any) => rows.find((x) => x.id === r.id) || r) }));
    void updateRows(key, rows);
  };
  const remove = (key: string, id: string) => { removeLocal(key, (r) => r.id === id); void deleteRow(key, id); };

  /* ------------------------- toast / nav ------------------------- */
  const toast = (text: string, kind: Toast['kind'] = 'success') => {
    const id = uid('t');
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };
  const go = (route: string, params: any = {}) => { setNav((n) => [...n, { route, params }]); window.scrollTo({ top: 0 }); };
  const back = () => setNav((n) => (n.length > 1 ? n.slice(0, -1) : n));
  const setTab = (t: string) => { setTabState(t); setNav([{ route: t }]); window.scrollTo({ top: 0 }); };
  const resetTo = (route: string, params: any = {}) => { setNav([{ route, params }]); window.scrollTo({ top: 0 }); };
  const current = nav[nav.length - 1];
  const refresh = async () => { const data = await loadAll(); setDbState(data); };

  const track = (name: string, props: any = {}) =>
    create('analytics', { id: uid('an'), name, props, at: new Date().toISOString() });

  /* ------------------------- auth ------------------------- */
  const user = db.users.find((u: any) => u.id === session?.userId) || null;
  const activeRole = session?.role || 'attendee';

  const login = (email: string, password: string) => {
    const u = db.users.find((x: any) => (x.email || '').toLowerCase() === email.trim().toLowerCase());
    if (!u) return { error: 'No account found with that email.' };
    if (u.password !== password) return { error: 'Incorrect password. Try Demo123!' };
    const roles = u.roles || ['attendee'];
    const role = roles.includes('admin') ? 'admin' : roles.includes('organizer') ? 'organizer' : roles.includes('team') ? 'team' : 'attendee';
    setSession({ userId: u.id, role });
    const home = role === 'admin' ? 'admin' : role === 'attendee' ? 'explore' : 'organize';
    setTabState(home); setNav([{ route: home }]);
    track('login', { role });
    return { user: u };
  };
  const signup = (data: any) => {
    if (db.users.some((u: any) => (u.email || '').toLowerCase() === data.email.toLowerCase())) return { error: 'An account with that email already exists.' };
    const u = {
      id: uid('u'), name: data.name, email: data.email, password: data.password, phone: data.phone || '',
      roles: ['attendee'], avatar: avatarFallback(data.name), createdAt: new Date().toISOString(),
    };
    create('users', u);
    setSession({ userId: u.id, role: 'attendee' });
    setNav([{ route: 'explore' }]); setTabState('explore');
    return { user: u };
  };
  const logout = () => { setSession(null); setNav([{ route: 'explore' }]); setTabState('explore'); setCart([]); };
  const switchRole = (role: string) => {
    setSession((s: any) => ({ ...s, role }));
    const home = role === 'attendee' ? 'explore' : role === 'admin' ? 'admin' : 'organize';
    setTabState(home); setNav([{ route: home }]);
    toast(`Switched to ${role} view`);
  };
  const updateUser = (p: any) => { if (session?.userId) patch('users', session.userId, p); };
  const deleteAccount = () => { if (session?.userId) remove('users', session.userId); logout(); toast('Account deleted', 'info'); };
  const becomeOrganizer = (profile: any) => {
    const orgId = uid('org');
    create('organizers', {
      id: orgId, userId: user.id, name: profile.name, email: user.email, phone: user.phone, bio: profile.bio,
      avatar: avatarFallback(profile.name), website: profile.website, status: 'Active',
      stripe: { connected: false, accountEmail: '', verification: 'Onboarding incomplete', available: 0, pending: 0, schedule: 'Not set' },
      createdAt: new Date().toISOString(),
    });
    patch('users', user.id, { roles: Array.from(new Set([...(user.roles || []), 'organizer'])), organizerId: orgId });
    setSession((s: any) => ({ ...s, role: 'organizer' }));
    setTabState('organize'); setNav([{ route: 'organize' }]);
    toast('Welcome aboard! Organizer account created.');
  };

  /* ------------------------- permissions ------------------------- */
  const teamMember = user?.teamMemberId ? db.teamMembers.find((t: any) => t.id === user.teamMemberId) : null;
  const can = (perm: string) => {
    if (activeRole === 'admin') return true;
    if (activeRole === 'team') return !!teamMember?.permissions?.[perm];
    return activeRole === 'organizer';
  };
  const myOrganizerId = user?.organizerId || null;
  const myOrganizer = db.organizers.find((o: any) => o.id === myOrganizerId) || null;

  /* ------------------------- selectors ------------------------- */
  const liveP = (p: any) => p.status !== 'released' && (!p.heldUntil || new Date(p.heldUntil).getTime() > Date.now());

  const sel = useMemo(() => ({
    event: (id: string) => db.events.find((e: any) => e.id === id),
    organizer: (id: string) => db.organizers.find((o: any) => o.id === id),
    ticketTypes: (eventId: string) => db.ticketTypes.filter((t: any) => t.eventId === eventId).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    questions: (eventId: string) => db.questions.filter((q: any) => q.eventId === eventId),
    layouts: (eventId: string) => db.layouts.filter((l: any) => l.eventId === eventId),
    units: (layoutId: string) => db.units.filter((u: any) => u.layoutId === layoutId).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    unit: (id: string) => db.units.find((u: any) => u.id === id),
    placementsForUnit: (unitId: string) => db.placements.filter((p: any) => p.unitId === unitId && liveP(p)),
    placementsForTicket: (ticketId: string) => db.placements.filter((p: any) => p.ticketId === ticketId && liveP(p)),
    occupancy: (unitId: string) => db.placements.filter((p: any) => p.unitId === unitId && liveP(p)).length,
    ticketsForEvent: (eventId: string) => db.tickets.filter((t: any) => t.eventId === eventId),
    myTickets: () => db.tickets.filter((t: any) => t.userId === session?.userId || (user?.email && t.holderEmail === user.email)),
    myOrders: () => db.orders.filter((o: any) => o.userId === session?.userId),
    myPayments: () => db.payments.filter((p: any) => p.userId === session?.userId),
    orgEvents: (orgId: string) => db.events.filter((e: any) => e.organizerId === orgId),
    orgOrders: (orgId: string) => db.orders.filter((o: any) => o.organizerId === orgId),
    coupons: (eventId: string) => db.coupons.filter((c: any) => c.eventId === eventId),
    notifications: () => db.notifications.filter((n: any) => n.userId === session?.userId)
      .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    isFollowing: (orgId: string) => db.follows.some((f: any) => f.userId === session?.userId && f.organizerId === orgId),
    followerCount: (orgId: string) => db.follows.filter((f: any) => f.organizerId === orgId).length,
    followers: (orgId: string) => db.follows.filter((f: any) => f.organizerId === orgId)
      .map((f: any) => db.users.find((u: any) => u.id === f.userId)).filter(Boolean),
    ticketAvailable: (tt: any) => Math.max(0, (tt.quantity || 0) - (tt.sold || 0)),
  }), [db, session, user, tick]);

  /* ------------------------- notifications ------------------------- */
  const notify = (userId: string, type: string, title: string, body: string, route = 'notifications', params: any = {}) => {
    if (!userId) return;
    create('notifications', { id: uid('nt'), userId, type, title, body, route, params, read: false, createdAt: new Date().toISOString() });
  };
  const notifyMany = (userIds: string[], build: (id: string) => any) =>
    createMany('notifications', userIds.filter(Boolean).map(build));
  const markNotificationRead = (id: string) => patch('notifications', id, { read: true });
  const markAllRead = () => patchMany('notifications',
    db.notifications.filter((n: any) => n.userId === session?.userId && !n.read).map((n: any) => ({ ...n, read: true })));

  /* ------------------------- follow ------------------------- */
  const toggleFollow = (orgId: string) => {
    if (!session) { go('auth'); return; }
    const exists = db.follows.find((f: any) => f.userId === session.userId && f.organizerId === orgId);
    if (exists) remove('follows', exists.id);
    else create('follows', { id: uid('fl'), userId: session.userId, organizerId: orgId, createdAt: new Date().toISOString() });
    toast(exists ? 'Unfollowed organizer' : 'Following organizer');
  };

  /* ------------------------- cart ------------------------- */
  const addToCart = (eventId: string, ticketTypeId: string, qty: number) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.ticketTypeId === ticketTypeId);
      if (qty <= 0) return c.filter((x) => x.ticketTypeId !== ticketTypeId);
      if (i >= 0) { const n = [...c]; n[i] = { ...n[i], qty }; return n; }
      return [...c, { id: uid('ci'), eventId, ticketTypeId, qty }];
    });
  };
  const removeFromCart = (ticketTypeId: string) => setCart((c) => c.filter((x) => x.ticketTypeId !== ticketTypeId));
  const clearCart = () => { setCart([]); setCheckout({ holders: {}, answers: {}, coupon: null, placement: {}, hold: null }); };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const cartTotals = useMemo(() => {
    let subtotal = 0; let absorb = true;
    cart.forEach((i) => {
      const tt = db.ticketTypes.find((t: any) => t.id === i.ticketTypeId);
      if (!tt) return;
      subtotal += tt.price * i.qty;
      if (!tt.absorbFees) absorb = false;
    });
    let discount = 0;
    if (checkout.coupon) discount = Math.min(Math.round(subtotal * (checkout.coupon.percent / 100)), checkout.coupon.maxDiscount);
    const placementAdjust = Object.values(checkout.placement || {}).reduce((s: number, p: any) => s + (p?.priceAdjust || 0), 0) as number;
    return computeFees(subtotal, { absorbFees: absorb && subtotal > 0, discount, placementAdjust });
  }, [cart, db.ticketTypes, checkout.coupon, checkout.placement]);

  const applyCoupon = (code: string) => {
    const eventId = cart[0]?.eventId;
    const c = db.coupons.find((x: any) => x.eventId === eventId && (x.code || '').toLowerCase() === code.trim().toLowerCase() && x.active);
    if (!c) { toast('That coupon code is not valid for this event.', 'error'); return false; }
    if (c.used >= c.totalUsers) { toast('This coupon has reached its usage limit.', 'error'); return false; }
    setCheckout((s: any) => ({ ...s, coupon: c }));
    track('coupon_applied', { code: c.code });
    toast(`Coupon ${c.code} applied`);
    return true;
  };
  const removeCoupon = () => setCheckout((s: any) => ({ ...s, coupon: null }));

  /* --------- placement holds (server-authoritative via RPC) ---------- */
  const holdPlacement = async (layoutId: string, unitId: string, ticketKey: string) => {
    const id = uid('pl');
    const res = await claimPlacement({
      id, layoutId, unitId, holdKey: ticketKey, name: user?.name || 'Guest', email: user?.email || '',
      userId: session?.userId, assignedBy: 'Attendee', status: 'held', holdSeconds,
    });
    if (!res.ok) { toast(res.error || 'That placement is unavailable.', 'error'); scheduleReload('placements'); return false; }
    setCheckout((s: any) => ({
      ...s,
      placement: { ...s.placement, [ticketKey]: { layoutId, unitId, label: res.label, priceAdjust: res.priceAdjust || 0, heldUntil: res.heldUntil, placementId: id } },
    }));
    scheduleReload('placements');
    track('placement_selected', { unitId });
    return true;
  };
  const releaseHolds = async () => {
    const mine = db.placements.filter((p: any) => p.status === 'held' && p.userId === session?.userId);
    removeLocal('placements', (p) => p.status === 'held' && p.userId === session?.userId);
    await deleteIn('placements', 'id', mine.map((p: any) => p.id));
    setCheckout((s: any) => ({ ...s, placement: {} }));
  };
  // expired holds return capacity to inventory for every device
  useEffect(() => {
    if (booting || offline) return;
    const expired = db.placements.filter((p: any) => p.status === 'held' && p.heldUntil && new Date(p.heldUntil).getTime() < Date.now() - 2000);
    if (!expired.length) return;
    removeLocal('placements', (p) => expired.some((e: any) => e.id === p.id));
    void deleteIn('placements', 'id', expired.map((e: any) => e.id));
    setCheckout((s: any) => {
      const next = { ...s.placement };
      Object.keys(next).forEach((k) => { if (expired.some((e: any) => e.id === next[k].placementId)) delete next[k]; });
      return { ...s, placement: next };
    });
  }, [tick]); // eslint-disable-line

  /* ------------------------- checkout ------------------------- */
  const completePurchase = (payload: any) => {
    const eventId = cart[0]?.eventId;
    const ev = sel.event(eventId);
    const totals = cartTotals;
    const oid = uid('ord');
    const tid = txnId();
    const num = orderNumber();
    const createdAt = new Date().toISOString();

    const newTickets: any[] = [];
    const keyed: Record<string, any> = {};
    cart.forEach((item) => {
      const tt = db.ticketTypes.find((t: any) => t.id === item.ticketTypeId);
      for (let i = 0; i < item.qty; i++) {
        const key = `${item.ticketTypeId}_${i}`;
        const holder = checkout.holders[key] || { name: user?.name, email: user?.email };
        const t = {
          id: uid('tkt'), code: 'RDM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), orderId: oid, eventId,
          ticketTypeId: tt.id, ticketTypeTitle: tt.title, userId: session?.userId, holderName: holder.name, holderEmail: holder.email,
          price: tt.price, status: 'valid', checkInStatus: 'Not Checked In', answers: checkout.answers[key] || {}, walletAdded: false, createdAt,
        };
        newTickets.push(t); keyed[key] = t;
      }
    });

    create('orders', {
      id: oid, number: num, eventId, organizerId: ev.organizerId, userId: session?.userId,
      buyerName: payload.fullName || user?.name, buyerEmail: user?.email, status: 'paid',
      subtotal: totals.subtotal, adminFee: totals.adminFee, paymentFee: totals.paymentFee, discount: totals.discount,
      placementAdjust: totals.placementAdjust, total: totals.total, transactionId: tid,
      couponCode: checkout.coupon?.code || null, address: payload.address || {}, method: payload.method, createdAt,
    });
    createMany('tickets', newTickets);
    create('payments', { id: uid('pay'), orderId: oid, userId: session?.userId, eventId, transactionId: tid, amount: totals.total, status: 'Succeeded', method: payload.method, createdAt });

    // convert my held placements into confirmed placements attached to the new tickets
    const heldRows = db.placements.filter((p: any) => p.status === 'held' && p.userId === session?.userId);
    const confirmed = heldRows.map((p: any) => {
      const entry = Object.entries(checkout.placement).find(([, v]: any) => v.placementId === p.id);
      const key = (entry?.[0] || '').split('::').pop() as string;
      const t = keyed[key] || newTickets[0];
      return { ...p, status: 'confirmed', ticketId: t?.id, orderId: oid, heldUntil: null, updatedAt: createdAt, version: (p.version || 1) + 1 };
    });
    if (confirmed.length) patchMany('placements', confirmed);

    patchMany('ticketTypes', cart.map((c) => {
      const tt = db.ticketTypes.find((t: any) => t.id === c.ticketTypeId);
      return { ...tt, sold: (tt.sold || 0) + c.qty };
    }));
    patch('events', eventId, { sold: (ev.sold || 0) + cart.reduce((s, c) => s + c.qty, 0) });
    if (checkout.coupon) patch('coupons', checkout.coupon.id, { used: (checkout.coupon.used || 0) + 1 });

    notify(session?.userId, 'Order Confirmed', 'Order confirmed', `Your ${newTickets.length} ticket(s) for ${ev.title} are ready.`, 'tickets');
    notify(db.organizers.find((o: any) => o.id === ev.organizerId)?.userId, 'New Order', 'New order received',
      `${payload.fullName || user?.name} purchased ${newTickets.length} ticket(s).`, 'org-orders');
    create('deliveries', { id: uid('dl'), type: 'Order confirmation email', to: user?.email, eventId, at: createdAt });
    track('purchase_completed', { eventId, total: totals.total });

    const result = { orderId: oid, number: num, transactionId: tid, total: totals.total, count: newTickets.length, eventId };
    setCart([]);
    setCheckout({ holders: {}, answers: {}, coupon: null, placement: {}, hold: null });
    return result;
  };

  /* ---------------- placements (organizer / attendee) ---------------- */
  const assignPlacement = async (layoutId: string, unitId: string, ticket: any, actor?: string) => {
    const actorName = actor || user?.name || 'Organizer';
    const res = await claimPlacement({
      id: uid('pl'), layoutId, unitId, ticketId: ticket.id, orderId: ticket.orderId, name: ticket.holderName,
      email: ticket.holderEmail, userId: ticket.userId, assignedBy: actorName, status: 'confirmed',
    });
    if (!res.ok) { toast(res.error || 'That placement is unavailable.', 'error'); scheduleReload('placements'); return false; }
    scheduleReload('placements');
    if (res.unchanged) return true;
    create('audit', {
      id: uid('aud'), eventId: ticket.eventId, layoutId, actor: actorName, action: res.reassigned ? 'Reassigned' : 'Assigned',
      detail: `${ticket.holderName} moved from ${res.oldLabel} → ${res.label}`, oldValue: res.oldLabel, newValue: res.label,
      createdAt: new Date().toISOString(),
    });
    notify(ticket.userId, res.reassigned ? 'Placement Changed' : 'Placement Assigned',
      res.reassigned ? 'Your placement changed' : 'Placement assigned', `${ticket.holderName}: ${res.oldLabel} → ${res.label}`, 'tickets');
    track('placement_reassigned', { from: res.oldLabel, to: res.label });
    return true;
  };

  const unassignPlacement = async (placementId: string) => {
    const p = db.placements.find((x: any) => x.id === placementId);
    if (!p) return;
    const unitLabel = sel.unit(p.unitId)?.label;
    remove('placements', placementId);
    create('audit', {
      id: uid('aud'), eventId: db.tickets.find((t: any) => t.id === p.ticketId)?.eventId, layoutId: p.layoutId,
      actor: user?.name || 'Organizer', action: 'Unassigned', detail: `${p.attendeeName} removed from ${unitLabel}`,
      oldValue: unitLabel, newValue: 'Unassigned', createdAt: new Date().toISOString(),
    });
    toast('Attendee unassigned');
    await promoteWaitlist(p.unitId);
  };

  const promoteWaitlist = async (unitId: string) => {
    const unit = sel.unit(unitId);
    if (!unit?.waitlist?.length) return;
    const ticket = db.tickets.find((t: any) => t.id === unit.waitlist[0].ticketId);
    if (!ticket) return;
    const res = await claimPlacement({
      id: uid('pl'), layoutId: unit.layoutId, unitId, ticketId: ticket.id, orderId: ticket.orderId,
      name: ticket.holderName, email: ticket.holderEmail, userId: ticket.userId, assignedBy: 'Waitlist promotion', status: 'confirmed',
    });
    if (!res.ok) return;
    patch('units', unitId, { waitlist: unit.waitlist.slice(1) });
    create('audit', {
      id: uid('aud'), eventId: ticket.eventId, layoutId: unit.layoutId, actor: 'System', action: 'Waitlist Promotion',
      detail: `${ticket.holderName} promoted into ${unit.label}`, oldValue: 'Waitlist', newValue: unit.label, createdAt: new Date().toISOString(),
    });
    notify(ticket.userId, 'Waitlist Spot Available', 'A spot opened up', `You've been placed at ${unit.label}.`, 'tickets');
    toast(`${ticket.holderName} promoted from the waitlist into ${unit.label}`);
    scheduleReload('placements');
  };

  const joinWaitlist = (unitId: string, ticket: any) => {
    const unit = sel.unit(unitId);
    if (!unit) return;
    patch('units', unitId, { waitlist: [...(unit.waitlist || []), { ticketId: ticket.id, name: ticket.holderName, at: new Date().toISOString() }] });
    toast('Added to the waitlist. We will notify you if a spot opens.');
  };

  const autoAssign = async (layoutId: string, strategy: 'fill' | 'even', keepTogether: boolean) => {
    const layout = db.layouts.find((l: any) => l.id === layoutId);
    const unitList = sel.units(layoutId).filter((u: any) => !u.locked);
    const evTickets = db.tickets.filter((t: any) => t.eventId === layout.eventId && t.status === 'valid');
    const unassigned = evTickets.filter((t: any) => !db.placements.some((p: any) => p.ticketId === t.id && p.layoutId === layoutId && liveP(p)));
    if (!unassigned.length) { toast('Everyone is already placed in this layout.', 'info'); return 0; }

    const occ: Record<string, number> = {};
    unitList.forEach((u: any) => { occ[u.id] = sel.occupancy(u.id); });
    const groups: any[][] = [];
    if (keepTogether) {
      const byOrder: Record<string, any[]> = {};
      unassigned.forEach((t: any) => { (byOrder[t.orderId] = byOrder[t.orderId] || []).push(t); });
      Object.values(byOrder).forEach((g) => groups.push(g));
    } else unassigned.forEach((t: any) => groups.push([t]));

    const created: any[] = [];
    const at = new Date().toISOString();
    groups.forEach((group) => {
      const target: any = strategy === 'fill'
        ? unitList.find((u: any) => u.capacity - occ[u.id] >= group.length) || unitList.find((u: any) => u.capacity - occ[u.id] > 0)
        : [...unitList].sort((a: any, b: any) => (occ[a.id] / a.capacity) - (occ[b.id] / b.capacity)).find((u: any) => u.capacity - occ[u.id] > 0);
      group.forEach((t: any) => {
        let u = target;
        if (!u || occ[u.id] >= u.capacity) u = unitList.find((x: any) => occ[x.id] < x.capacity);
        if (!u) return;
        occ[u.id]++;
        created.push({
          id: uid('pl'), layoutId, unitId: u.id, ticketId: t.id, orderId: t.orderId, attendeeName: t.holderName,
          attendeeEmail: t.holderEmail, userId: t.userId, assignedBy: 'Auto Assign', status: 'confirmed',
          heldUntil: null, version: 1, createdAt: at, updatedAt: at,
        });
      });
    });
    createMany('placements', created);
    create('audit', {
      id: uid('aud'), eventId: layout.eventId, layoutId, actor: user?.name || 'Organizer', action: 'Auto Assign',
      detail: `${strategy === 'fill' ? 'Fill in order' : 'Distribute evenly'} placed ${created.length} attendees`,
      oldValue: 'Unassigned', newValue: layout.name, createdAt: at,
    });
    toast(`Auto-assigned ${created.length} attendees`);
    return created.length;
  };

  const undoLastPlacementAction = async (layoutId: string) => {
    const last = [...db.audit].sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)).find((a: any) => a.layoutId === layoutId);
    if (!last) { toast('Nothing to undo.', 'info'); return; }
    if (last.action === 'Auto Assign') {
      const rows = db.placements.filter((p: any) => p.layoutId === layoutId && p.assignedBy === 'Auto Assign');
      removeLocal('placements', (p) => p.layoutId === layoutId && p.assignedBy === 'Auto Assign');
      await deleteIn('placements', 'id', rows.map((r: any) => r.id));
      remove('audit', last.id);
      toast('Auto assignment undone');
      return;
    }
    if (last.action === 'Reassigned' || last.action === 'Assigned') {
      const name = String(last.detail || '').split(' moved')[0];
      const row = db.placements.find((p: any) => p.layoutId === layoutId && p.attendeeName === name);
      const back = db.units.find((u: any) => u.layoutId === layoutId && u.label === last.oldValue);
      if (row && back) patch('placements', row.id, { unitId: back.id, version: (row.version || 1) + 1 });
      else if (row) remove('placements', row.id);
      remove('audit', last.id);
      toast('Last placement action undone');
      return;
    }
    toast('That action cannot be undone safely.', 'info');
  };

  /* ------------------------- layouts & units ------------------------- */
  const createLayout = (eventId: string, data: any) => {
    const id = uid('lay');
    create('layouts', {
      id, eventId, name: data.name, mode: data.mode || 'organizer', locked: false,
      waitlistEnabled: !!data.waitlistEnabled, keepTogether: true, description: data.description || '',
      campaign: null, createdAt: new Date().toISOString(),
    });
    return id;
  };
  const deleteLayout = async (layoutId: string) => {
    const unitIds = db.units.filter((u: any) => u.layoutId === layoutId).map((u: any) => u.id);
    removeLocal('placements', (p) => p.layoutId === layoutId);
    removeLocal('units', (u) => u.layoutId === layoutId);
    remove('layouts', layoutId);
    await deleteWhere('placements', 'layoutId', layoutId);
    await deleteIn('units', 'id', unitIds);
  };
  const updateLayout = (layoutId: string, p: any) => patch('layouts', layoutId, p);

  const addUnit = (layoutId: string, data: any) => {
    const existing = db.units.filter((u: any) => u.layoutId === layoutId);
    const id = uid('unit');
    create('units', {
      id, layoutId, parentUnitId: data.parentUnitId || null, type: data.type || 'Table',
      label: data.label || `Unit ${existing.length + 1}`, capacity: Number(data.capacity) || 8,
      description: data.description || '', priceAdjust: Number(data.priceAdjust) || 0,
      selectable: data.selectable !== false, allowedTicketTypes: data.allowedTicketTypes || [], locked: !!data.locked,
      sortOrder: existing.length, x: data.x ?? (existing.length % 5) * 19 + 6, y: data.y ?? Math.floor(existing.length / 5) * 30 + 10,
      width: 15, height: 20, rotation: 0, waitlist: [],
    });
    return id;
  };
  const updateUnit = (unitId: string, p: any) => patch('units', unitId, p);
  const deleteUnit = async (unitId: string) => {
    const unit = sel.unit(unitId);
    if (!unit) return;
    removeLocal('placements', (p) => p.unitId === unitId);
    removeLocal('units', (u) => u.id === unitId || u.parentUnitId === unitId);
    await deleteWhere('placements', 'unitId', unitId);
    await deleteRow('units', unitId);
    await deleteWhere('units', 'parentUnitId', unitId);
    create('audit', {
      id: uid('aud'), eventId: db.layouts.find((l: any) => l.id === unit.layoutId)?.eventId, layoutId: unit.layoutId,
      actor: user?.name || 'Organizer', action: 'Unit Deleted', detail: `${unit.label} deleted; occupants moved to Unassigned`,
      oldValue: unit.label, newValue: 'Unassigned', createdAt: new Date().toISOString(),
    });
  };
  const bulkGenerateUnits = (layoutId: string, cfg: any) => {
    const existing = db.units.filter((u: any) => u.layoutId === layoutId).length;
    const made = Array.from({ length: Number(cfg.quantity) || 1 }, (_, i) => ({
      id: uid('unit'), layoutId, parentUnitId: null, type: cfg.type || 'Table',
      label: `${cfg.prefix || 'Unit'} ${Number(cfg.start || 1) + i}`, capacity: Number(cfg.capacity) || 8,
      description: '', priceAdjust: 0, selectable: true, allowedTicketTypes: [], locked: false,
      sortOrder: existing + i, x: ((existing + i) % 5) * 19 + 6, y: Math.floor((existing + i) / 5) * 30 + 10,
      width: 15, height: 20, rotation: 0, waitlist: [],
    }));
    createMany('units', made);
    toast(`Generated ${made.length} units`);
  };
  const applyTemplate = (layoutId: string, templateId: string) => {
    const tpl = db.templates.find((t: any) => t.id === templateId);
    if (!tpl) return;
    const existing = db.units.filter((u: any) => u.layoutId === layoutId).length;
    const made = (tpl.units || []).map((u: any, i: number) => ({
      id: uid('unit'), layoutId, parentUnitId: null, type: u.type, label: u.label, capacity: u.capacity,
      description: '', priceAdjust: u.priceAdjust || 0, selectable: true, allowedTicketTypes: [], locked: false,
      sortOrder: existing + i, x: ((existing + i) % 5) * 19 + 6, y: Math.floor((existing + i) / 5) * 30 + 10,
      width: 15, height: 20, rotation: 0, waitlist: [],
    }));
    createMany('units', made);
    toast(`Applied template “${tpl.name}”`);
  };
  const saveAsTemplate = (layoutId: string, name: string) => {
    const unitList = sel.units(layoutId);
    create('templates', {
      id: uid('tpl'), name, unitType: unitList[0]?.type || 'Table', createdAt: new Date().toISOString(),
      units: unitList.map((u: any) => ({ label: u.label, type: u.type, capacity: u.capacity, priceAdjust: u.priceAdjust })),
    });
    toast('Layout saved as template');
  };

  const sendSelectionCampaign = (layoutId: string, cfg: any) => {
    const layout = db.layouts.find((l: any) => l.id === layoutId);
    const evTickets = db.tickets.filter((t: any) => t.eventId === layout.eventId && t.status === 'valid');
    const unplaced = evTickets.filter((t: any) => !db.placements.some((p: any) => p.ticketId === t.id && p.layoutId === layoutId && liveP(p)));
    const at = new Date().toISOString();
    patch('layouts', layoutId, { campaign: cfg, mode: layout.mode === 'organizer' ? 'post' : layout.mode });
    notifyMany(Array.from(new Set(unplaced.map((t: any) => t.userId))) as string[], (userId: string) => ({
      id: uid('nt'), userId, type: 'Selection Invitation', title: `Choose your ${layout.name.toLowerCase()}`,
      body: `Selection is open for ${layout.name}. Tap to pick your spot.`, route: 'tickets', params: {}, read: false, createdAt: at,
    }));
    toast(`Invitation sent to ${unplaced.length} attendees`);
    return unplaced.length;
  };

  /* ------------------------- events ------------------------- */
  const saveEvent = (data: any) => {
    if (db.events.some((e: any) => e.id === data.id)) patch('events', data.id, data);
    else create('events', data);
    return data.id;
  };
  const deleteEvent = (eventId: string) => { remove('events', eventId); toast('Event deleted'); };
  const publishEvent = (eventId: string) => {
    patch('events', eventId, { status: 'published' });
    const ev = sel.event(eventId);
    const org = sel.organizer(ev?.organizerId);
    const followers = db.follows.filter((f: any) => f.organizerId === ev?.organizerId).slice(0, 20);
    const at = new Date().toISOString();
    notifyMany(followers.map((f: any) => f.userId), (userId: string) => ({
      id: uid('nt'), userId, type: 'New Event From Followed Organizer', title: `${org?.name} published a new event`,
      body: ev?.title, route: 'event', params: { id: eventId }, read: false, createdAt: at,
    }));
    track('event_published', { eventId });
    toast('Event published');
  };
  const saveTicketType = (tt: any) => {
    if (db.ticketTypes.some((t: any) => t.id === tt.id)) patch('ticketTypes', tt.id, tt);
    else create('ticketTypes', tt);
  };
  const deleteTicketType = (id: string) => remove('ticketTypes', id);
  const saveQuestion = (q: any) => {
    if (db.questions.some((x: any) => x.id === q.id)) patch('questions', q.id, q);
    else create('questions', q);
  };
  const deleteQuestion = (id: string) => remove('questions', id);

  /* ------------------- orders / refunds / check-in ------------------- */
  const refundOrder = async (orderId: string) => {
    const order = db.orders.find((o: any) => o.id === orderId);
    if (!order) return;
    patch('orders', orderId, { status: 'refunded' });
    patchMany('payments', db.payments.filter((p: any) => p.orderId === orderId).map((p: any) => ({ ...p, status: 'Refunded' })));
    patchMany('tickets', db.tickets.filter((t: any) => t.orderId === orderId).map((t: any) => ({ ...t, status: 'refunded', checkInStatus: 'Not Checked In' })));
    removeLocal('placements', (p) => p.orderId === orderId);
    await deleteWhere('placements', 'orderId', orderId);
    notify(order.userId, 'Refund Processed', 'Refund processed', `Your order ${order.number} has been refunded.`, 'payments');
    toast('Order refunded (sandbox)');
  };
  const deleteOrder = async (orderId: string) => {
    removeLocal('tickets', (t) => t.orderId === orderId);
    removeLocal('payments', (p) => p.orderId === orderId);
    removeLocal('placements', (p) => p.orderId === orderId);
    remove('orders', orderId);
    await deleteWhere('placements', 'orderId', orderId);
    await deleteWhere('tickets', 'orderId', orderId);
    await deleteWhere('payments', 'orderId', orderId);
  };

  const setCheckIn = (ticketId: string, action: 'Check In' | 'Check Out') => {
    const ticket = db.tickets.find((t: any) => t.id === ticketId);
    if (!ticket) return { error: 'Ticket not found' };
    if (ticket.status !== 'valid') return { error: 'This ticket is not valid (refunded or cancelled).' };
    if (action === 'Check In' && ticket.checkInStatus === 'Checked In') return { error: 'Already checked in' };
    const at = new Date().toISOString();
    const status = action === 'Check In' ? 'Checked In' : 'Checked Out';
    if (offline) {
      setQueue((q) => [...q, { ticketId, action, at }]);
      patchLocal('tickets', ticketId, { checkInStatus: status });
      return { queued: true };
    }
    patch('tickets', ticketId, { checkInStatus: status });
    create('checkIns', { id: uid('ci'), ticketId, eventId: ticket.eventId, by: user?.name || 'Staff', at, action });
    track('qr_checked_in', { ticketId });
    return { ok: true };
  };
  const syncQueue = () => {
    if (!queue.length) { toast('Nothing queued to sync.', 'info'); return; }
    createMany('checkIns', queue.map((q) => ({
      id: uid('ci'), ticketId: q.ticketId, eventId: db.tickets.find((t: any) => t.id === q.ticketId)?.eventId,
      by: user?.name || 'Staff', at: q.at, action: q.action,
    })));
    patchMany('tickets', queue.map((q) => {
      const t = db.tickets.find((x: any) => x.id === q.ticketId);
      return t ? { ...t, checkInStatus: q.action === 'Check In' ? 'Checked In' : 'Checked Out' } : null;
    }).filter(Boolean) as any[]);
    toast(`Synced ${queue.length} queued check-ins to the shared database`);
    setQueue([]);
  };

  /* ------------------------- coupons / comms ------------------------- */
  const saveCoupon = (c: any) => {
    if (db.coupons.some((x: any) => x.id === c.id)) patch('coupons', c.id, c);
    else create('coupons', { ...c, used: c.used || 0, createdAt: new Date().toISOString() });
  };
  const deleteCoupon = (id: string) => remove('coupons', id);

  const sendAnnouncement = (a: any) => {
    const at = new Date().toISOString();
    const evTickets = db.tickets.filter((t: any) => t.eventId === a.eventId && t.status === 'valid');
    let targets = evTickets;
    if (a.audience === 'Ticket Type') targets = evTickets.filter((t: any) => t.ticketTypeTitle === a.audienceValue);
    if (a.audience === 'Placement') {
      const unit = db.units.find((u: any) => u.label === a.audienceValue);
      const ids = db.placements.filter((p: any) => p.unitId === unit?.id).map((p: any) => p.ticketId);
      targets = evTickets.filter((t: any) => ids.includes(t.id));
    }
    const userIds = Array.from(new Set(targets.map((t: any) => t.userId))).filter(Boolean) as string[];
    create('announcements', {
      id: uid('ann'), organizerId: a.organizerId, eventId: a.eventId, subject: a.subject, message: a.message,
      audience: a.audience, audienceValue: a.audienceValue, scheduledFor: a.scheduledFor || null,
      status: a.scheduledFor ? 'Scheduled' : 'Sent', recipients: userIds.length, createdAt: at,
    });
    if (!a.scheduledFor) {
      notifyMany(userIds, (userId: string) => ({
        id: uid('nt'), userId, type: 'Organizer Announcement', title: a.subject, body: a.message,
        route: 'event', params: { id: a.eventId }, read: false, createdAt: at,
      }));
    }
    track('announcement_sent', { eventId: a.eventId });
    toast(a.scheduledFor ? 'Announcement scheduled' : `Announcement sent to ${userIds.length} attendees`);
  };
  const deleteAnnouncement = (id: string) => remove('announcements', id);

  const createEnquiry = (e: any) => {
    const ev = sel.event(e.eventId);
    const orgId = ev?.organizerId || 'org_1';
    create('enquiries', {
      id: uid('enq'), organizerId: orgId, eventId: e.eventId, name: e.name, email: e.email,
      message: e.message, read: false, replies: [], createdAt: new Date().toISOString(),
    });
    notify(db.organizers.find((o: any) => o.id === orgId)?.userId, 'New Enquiry', 'New enquiry received', `${e.name}: ${String(e.message).slice(0, 60)}…`, 'org-enquiries');
    toast('Message sent to the organizer');
  };
  const updateEnquiry = (id: string, p: any) => patch('enquiries', id, p);
  const replyEnquiry = (id: string, body: string) => {
    const e = db.enquiries.find((x: any) => x.id === id);
    if (!e) return;
    patch('enquiries', id, { read: true, replies: [...(e.replies || []), { body, at: new Date().toISOString() }] });
    create('deliveries', { id: uid('dl'), type: 'Enquiry reply', to: e.email, at: new Date().toISOString() });
  };
  const deleteEnquiry = (id: string) => remove('enquiries', id);

  const resendTickets = (eventId: string) => {
    const count = db.tickets.filter((t: any) => t.eventId === eventId && t.status === 'valid').length;
    create('deliveries', { id: uid('dl'), type: 'Ticket resend', to: `${count} attendees`, eventId, at: new Date().toISOString() });
    toast('Tickets resent successfully.');
  };

  const saveTeamMember = (m: any) => {
    if (db.teamMembers.some((x: any) => x.id === m.id)) patch('teamMembers', m.id, m);
    else create('teamMembers', { ...m, createdAt: new Date().toISOString() });
  };
  const deleteTeamMember = (id: string) => remove('teamMembers', id);
  const updateTicket = (id: string, p: any) => patch('tickets', id, p);
  const addSupport = (rec: any) => create('supportTickets', { ...rec, id: uid('sup'), status: 'Open', createdAt: new Date().toISOString() });
  const addMailing = (rec: any) => create('mailingList', { ...rec, id: uid('ml'), createdAt: new Date().toISOString() });
  const setModeration = (kind: 'events' | 'organizers', id: string, status: string) => patch(kind, id, { status });

  /* ------------------------- demo controls ------------------------- */
  const resetDemo = async () => {
    toast('Resetting the shared demo database…', 'info');
    setBooting(true);
    await wipeDatabase();
    const data = await seedDatabase();
    setDbState(data);
    setBooting(false);
    toast('Demo data reset for every device');
  };
  const simulateNewOrder = () => {
    const ev = db.events.find((e: any) => e.id === db.showcaseEventId) || db.events[0];
    const tt = db.ticketTypes.find((t: any) => t.eventId === ev?.id);
    const buyer = db.users.find((u: any) => u.id === 'u_a5') || db.users[4];
    if (!ev || !tt || !buyer) { toast('Seed data missing.', 'error'); return; }
    const at = new Date().toISOString();
    const oid = uid('ord'); const tid = txnId();
    const fees = computeFees(tt.price);
    create('orders', {
      id: oid, number: orderNumber(), eventId: ev.id, organizerId: ev.organizerId, userId: buyer.id,
      buyerName: buyer.name, buyerEmail: buyer.email, status: 'paid', subtotal: tt.price, adminFee: fees.adminFee,
      paymentFee: fees.paymentFee, discount: 0, placementAdjust: 0, total: fees.total, transactionId: tid,
      couponCode: null, address: {}, method: 'Card •••• 4242', createdAt: at,
    });
    create('payments', { id: uid('pay'), orderId: oid, userId: buyer.id, eventId: ev.id, transactionId: tid, amount: fees.total, status: 'Succeeded', method: 'Card •••• 4242', createdAt: at });
    create('tickets', {
      id: uid('tkt'), code: 'RDM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), orderId: oid, eventId: ev.id,
      ticketTypeId: tt.id, ticketTypeTitle: tt.title, userId: buyer.id, holderName: buyer.name, holderEmail: buyer.email,
      price: tt.price, status: 'valid', checkInStatus: 'Not Checked In', answers: {}, walletAdded: false, createdAt: at,
    });
    patch('events', ev.id, { sold: (ev.sold || 0) + 1 });
    patch('ticketTypes', tt.id, { sold: (tt.sold || 0) + 1 });
    notify(db.organizers.find((o: any) => o.id === ev.organizerId)?.userId, 'New Order', 'New order received', `${buyer.name} purchased 1 ${tt.title} ticket.`, 'org-orders');
    toast('Simulated new order created');
  };
  const simulateConflict = () => {
    const unit = db.units.find((u: any) => u.layoutId === 'lay_dinner' && !u.locked) || db.units[0];
    if (!unit) { toast('No placement units found.', 'error'); return; }
    const need = unit.capacity - 1 - sel.occupancy(unit.id);
    const evTickets = db.tickets.filter((t: any) => t.eventId === db.showcaseEventId && !db.placements.some((p: any) => p.ticketId === t.id && p.layoutId === unit.layoutId));
    const at = new Date().toISOString();
    createMany('placements', evTickets.slice(0, Math.max(0, need)).map((t: any) => ({
      id: uid('pl'), layoutId: unit.layoutId, unitId: unit.id, ticketId: t.id, orderId: t.orderId,
      attendeeName: t.holderName, attendeeEmail: t.holderEmail, userId: t.userId, assignedBy: 'Demo Control',
      status: 'confirmed', heldUntil: null, version: 1, createdAt: at, updatedAt: at,
    })));
    toast(`${unit.label} is now at ${unit.capacity - 1}/${unit.capacity}. Two final claims will race server-side.`, 'info');
  };
  const simulateReminder = () => {
    notify(session?.userId, 'Event Reminder', 'Event starts soon', 'Redeemed Leadership Conference 2026 starts in 24 hours.', 'tickets');
    toast('Reminder notification created');
  };
  const simulatePayout = () => {
    create('payouts', { id: uid('po'), organizerId: 'org_1', amount: 245000, status: 'Paid', arrival: new Date().toISOString(), destination: 'Chase •••• 4411' });
    notify('u_org', 'Payout Sent', 'Payout sent', '$2,450.00 is on the way to your bank account.', 'org-payouts');
    toast('Payout simulated');
  };
  const simulateWaitlistOpen = async () => {
    const unit = db.units.find((u: any) => (u.waitlist || []).length);
    if (!unit) { toast('No waitlisted attendees right now.', 'info'); return; }
    const p = db.placements.find((x: any) => x.unitId === unit.id);
    if (p) await unassignPlacement(p.id); else await promoteWaitlist(unit.id);
  };

  const value = {
    db, sel, user, session, activeRole, teamMember, can, myOrganizerId, myOrganizer,
    booting, bootError, syncing, boot, refresh,
    nav, current, go, back, setTab, tab, resetTo, toasts, toast, theme, setTheme,
    login, signup, logout, switchRole, updateUser, deleteAccount, becomeOrganizer,
    cart, addToCart, removeFromCart, clearCart, cartCount, cartTotals, checkout, setCheckout, applyCoupon, removeCoupon,
    completePurchase, holdPlacement, releaseHolds, holdSeconds, setHoldSeconds,
    assignPlacement, unassignPlacement, autoAssign, undoLastPlacementAction, joinWaitlist, promoteWaitlist,
    createLayout, updateLayout, deleteLayout, addUnit, updateUnit, deleteUnit, bulkGenerateUnits, applyTemplate, saveAsTemplate, sendSelectionCampaign,
    saveEvent, deleteEvent, publishEvent, saveTicketType, deleteTicketType, saveQuestion, deleteQuestion,
    refundOrder, deleteOrder, setCheckIn, offline, setOffline, queue, syncQueue,
    saveCoupon, deleteCoupon, sendAnnouncement, deleteAnnouncement, createEnquiry, updateEnquiry, replyEnquiry, deleteEnquiry,
    resendTickets, saveTeamMember, deleteTeamMember, updateTicket, toggleFollow, notify, markNotificationRead, markAllRead,
    addSupport, addMailing, setModeration, track,
    resetDemo, simulateNewOrder, simulateConflict, simulateReminder, simulatePayout, simulateWaitlistOpen,
    tick,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};
