import { supabase } from '@/lib/supabase';
import { buildSeed } from '@/data/seed';

/* ------------------------------------------------------------------ */
/* Collection -> Postgres table + column whitelist.                    */
/* Tables use the same quoted camelCase column names the app already   */
/* uses, so no field mapping is needed anywhere in the UI layer.       */
/* ------------------------------------------------------------------ */
export const TABLES: Record<string, { table: string; cols: string[] }> = {
  users: { table: 'users', cols: ['id', 'name', 'email', 'password', 'phone', 'roles', 'avatar', 'organizerId', 'teamMemberId', 'createdAt'] },
  organizers: { table: 'organizer_profiles', cols: ['id', 'userId', 'name', 'email', 'phone', 'bio', 'avatar', 'website', 'status', 'stripe', 'createdAt'] },
  teamMembers: { table: 'team_members', cols: ['id', 'organizerId', 'userId', 'name', 'email', 'phone', 'status', 'permissions', 'createdAt'] },
  events: {
    table: 'events',
    cols: ['id', 'organizerId', 'title', 'category', 'image', 'gallery', 'capacity', 'sold', 'status', 'description', 'startDate', 'endDate',
      'startTime', 'endTime', 'timezone', 'address', 'city', 'state', 'zip', 'venue', 'externalLink', 'videos', 'socials', 'guests', 'agenda',
      'allowWaitlist', 'privateEvent', 'createdAt'],
  },
  ticketTypes: { table: 'ticket_types', cols: ['id', 'eventId', 'title', 'price', 'quantity', 'sold', 'available', 'absorbFees', 'salesStart', 'salesStartTime', 'deadline', 'deadlineTime', 'description', 'sortOrder'] },
  questions: { table: 'ticket_questions', cols: ['id', 'eventId', 'type', 'question', 'options', 'required', 'applyToAll'] },
  orders: { table: 'orders', cols: ['id', 'number', 'eventId', 'organizerId', 'userId', 'buyerName', 'buyerEmail', 'status', 'subtotal', 'adminFee', 'paymentFee', 'discount', 'placementAdjust', 'total', 'transactionId', 'couponCode', 'address', 'method', 'createdAt'] },
  tickets: { table: 'tickets', cols: ['id', 'code', 'orderId', 'eventId', 'ticketTypeId', 'ticketTypeTitle', 'userId', 'holderName', 'holderEmail', 'price', 'status', 'checkInStatus', 'answers', 'walletAdded', 'createdAt'] },
  payments: { table: 'payments', cols: ['id', 'orderId', 'userId', 'eventId', 'transactionId', 'amount', 'status', 'method', 'createdAt'] },
  coupons: { table: 'coupons', cols: ['id', 'eventId', 'code', 'description', 'percent', 'maxDiscount', 'totalUsers', 'used', 'active', 'createdAt'] },
  follows: { table: 'follows', cols: ['id', 'userId', 'organizerId', 'createdAt'] },
  enquiries: { table: 'enquiries', cols: ['id', 'organizerId', 'eventId', 'name', 'email', 'message', 'read', 'replies', 'createdAt'] },
  announcements: { table: 'announcements', cols: ['id', 'organizerId', 'eventId', 'subject', 'message', 'audience', 'audienceValue', 'status', 'scheduledFor', 'recipients', 'createdAt'] },
  notifications: { table: 'notifications', cols: ['id', 'userId', 'type', 'title', 'body', 'route', 'params', 'read', 'createdAt'] },
  checkIns: { table: 'check_ins', cols: ['id', 'ticketId', 'eventId', 'by', 'at', 'action'] },
  layouts: { table: 'layouts', cols: ['id', 'eventId', 'name', 'mode', 'locked', 'waitlistEnabled', 'keepTogether', 'description', 'campaign', 'createdAt'] },
  units: { table: 'placement_units', cols: ['id', 'layoutId', 'parentUnitId', 'type', 'label', 'capacity', 'description', 'priceAdjust', 'selectable', 'allowedTicketTypes', 'locked', 'sortOrder', 'x', 'y', 'width', 'height', 'rotation', 'waitlist'] },
  placements: { table: 'placements', cols: ['id', 'layoutId', 'unitId', 'ticketId', 'holdKey', 'orderId', 'attendeeName', 'attendeeEmail', 'userId', 'assignedBy', 'status', 'heldUntil', 'version', 'createdAt', 'updatedAt'] },
  audit: { table: 'placement_audit', cols: ['id', 'eventId', 'layoutId', 'actor', 'action', 'detail', 'oldValue', 'newValue', 'createdAt'] },
  templates: { table: 'layout_templates', cols: ['id', 'name', 'unitType', 'units', 'createdAt'] },
  payouts: { table: 'payouts', cols: ['id', 'organizerId', 'amount', 'status', 'arrival', 'destination'] },
  deliveries: { table: 'deliveries', cols: ['id', 'type', 'to', 'eventId', 'at'] },
  supportTickets: { table: 'support_tickets', cols: ['id', 'type', 'subject', 'issueType', 'description', 'orderNumber', 'email', 'status', 'createdAt'] },
  mailingList: { table: 'mailing_list', cols: ['id', 'firstName', 'lastName', 'role', 'email', 'createdAt'] },
  analytics: { table: 'analytics_events', cols: ['id', 'name', 'props', 'at'] },
};

export const COLLECTIONS = Object.keys(TABLES);
export const SHOWCASE_EVENT_ID = 'evt_showcase';

const clean = (key: string, row: any) => {
  const cols = TABLES[key].cols;
  const out: any = {};
  cols.forEach((c) => { if (row[c] !== undefined) out[c] = row[c]; });
  return out;
};

export const emptyDb = () => {
  const d: any = { showcaseEventId: SHOWCASE_EVENT_ID, transfers: [] };
  COLLECTIONS.forEach((k) => { d[k] = []; });
  return d;
};

/* ------------------------------ reads ------------------------------ */
export async function loadAll() {
  const results = await Promise.all(
    COLLECTIONS.map(async (key) => {
      const { data, error } = await supabase.from(TABLES[key].table).select('*').limit(5000);
      if (error) console.error('load', key, error.message);
      return [key, data || []] as [string, any[]];
    })
  );
  const db: any = { showcaseEventId: SHOWCASE_EVENT_ID, transfers: [] };
  results.forEach(([key, rows]) => { db[key] = rows; });
  return db;
}

export async function reloadCollections(keys: string[]) {
  const results = await Promise.all(
    keys.map(async (key) => {
      const { data } = await supabase.from(TABLES[key].table).select('*').limit(5000);
      return [key, data || []] as [string, any[]];
    })
  );
  const patch: any = {};
  results.forEach(([key, rows]) => { patch[key] = rows; });
  return patch;
}

/* ------------------------------ writes ----------------------------- */
export async function insertRows(key: string, rows: any[]) {
  if (!rows?.length) return;
  const payload = rows.map((r) => clean(key, r));
  for (let i = 0; i < payload.length; i += 250) {
    const { error } = await supabase.from(TABLES[key].table).upsert(payload.slice(i, i + 250), { onConflict: 'id' });
    if (error) console.error('insert', key, error.message);
  }
}

export const insertRow = (key: string, row: any) => insertRows(key, [row]);

export async function updateRow(key: string, id: string, patch: any) {
  const payload = clean(key, patch);
  delete payload.id;
  if (!Object.keys(payload).length) return;
  const { error } = await supabase.from(TABLES[key].table).update(payload).eq('id', id);
  if (error) console.error('update', key, error.message);
}

export const updateRows = (key: string, rows: any[]) => insertRows(key, rows);

export async function deleteRow(key: string, id: string) {
  const { error } = await supabase.from(TABLES[key].table).delete().eq('id', id);
  if (error) console.error('delete', key, error.message);
}

export async function deleteWhere(key: string, column: string, value: any) {
  const { error } = await supabase.from(TABLES[key].table).delete().eq(column, value);
  if (error) console.error('deleteWhere', key, error.message);
}

export async function deleteIn(key: string, column: string, values: any[]) {
  if (!values?.length) return;
  const { error } = await supabase.from(TABLES[key].table).delete().in(column, values);
  if (error) console.error('deleteIn', key, error.message);
}

/* --------------------- server-authoritative claim ------------------- */
export async function claimPlacement(args: {
  id: string; layoutId: string; unitId: string; ticketId?: string | null; holdKey?: string | null;
  orderId?: string | null; name: string; email: string; userId?: string | null; assignedBy: string;
  status: 'confirmed' | 'held'; holdSeconds?: number;
}) {
  const { data, error } = await supabase.rpc('claim_placement', {
    p_id: args.id,
    p_layout: args.layoutId,
    p_unit: args.unitId,
    p_ticket: args.ticketId ?? null,
    p_hold_key: args.holdKey ?? null,
    p_order: args.orderId ?? null,
    p_name: args.name,
    p_email: args.email,
    p_user: args.userId ?? null,
    p_assigned_by: args.assignedBy,
    p_status: args.status,
    p_hold_seconds: args.holdSeconds ?? 600,
  });
  if (error) return { ok: false, error: error.message } as any;
  return (data || { ok: false, error: 'Placement failed' }) as any;
}

/* ------------------------------ seeding ---------------------------- */
export async function isEmpty() {
  const { count, error } = await supabase.from('events').select('id', { count: 'exact', head: true });
  if (error) { console.error('isEmpty', error.message); return false; }
  return (count || 0) === 0;
}

const SEED_ORDER = ['users', 'organizers', 'teamMembers', 'events', 'ticketTypes', 'questions', 'layouts', 'units',
  'templates', 'orders', 'tickets', 'payments', 'placements', 'audit', 'checkIns', 'coupons', 'follows',
  'enquiries', 'announcements', 'notifications', 'analytics', 'payouts', 'deliveries', 'supportTickets', 'mailingList'];

export async function seedDatabase() {
  const seed: any = buildSeed();
  for (const key of SEED_ORDER) await insertRows(key, seed[key] || []);
  return loadAll();
}

export async function wipeDatabase() {
  for (const key of [...SEED_ORDER].reverse()) {
    const { error } = await supabase.from(TABLES[key].table).delete().neq('id', '__never__');
    if (error) console.error('wipe', key, error.message);
  }
}

export async function ensureSeeded() {
  if (await isEmpty()) return seedDatabase();
  return loadAll();
}

/* ---------------------------- realtime ----------------------------- */
export function subscribeRealtime(onChange: (collection: string) => void) {
  const watch: Record<string, string> = {
    placements: 'placements', tickets: 'tickets', orders: 'orders',
    placement_units: 'units', notifications: 'notifications', events: 'events',
    placement_audit: 'audit', check_ins: 'checkIns', ticket_types: 'ticketTypes', layouts: 'layouts',
  };
  const channel = supabase.channel('redeemed-events-live');
  Object.entries(watch).forEach(([table, collection]) => {
    channel.on('postgres_changes', { event: '*', schema: '*', table }, () => onChange(collection));
  });
  channel.subscribe();
  return () => { supabase.removeChannel(channel); };
}
