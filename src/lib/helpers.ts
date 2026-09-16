// Shared helpers: money, dates, ids, fees, QR encoding. Single source of truth.

export const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

export const money = (cents: number) =>
  (cents < 0 ? '-' : '') + '$' + (Math.abs(cents) / 100).toFixed(2);

export const ADMIN_FEE_RATE = 0.035;
export const PAY_FEE_RATE = 0.029;
export const PAY_FEE_FLAT = 30;

export interface FeeBreakdown {
  subtotal: number;
  adminFee: number;
  paymentFee: number;
  discount: number;
  placementAdjust: number;
  total: number;
  absorbed: boolean;
}

export function computeFees(
  subtotalCents: number,
  opts: { absorbFees?: boolean; discount?: number; placementAdjust?: number } = {}
): FeeBreakdown {
  const discount = Math.min(opts.discount || 0, subtotalCents);
  const placementAdjust = opts.placementAdjust || 0;
  const base = Math.max(0, subtotalCents - discount + placementAdjust);
  const absorbed = !!opts.absorbFees;
  const adminFee = absorbed || base === 0 ? 0 : Math.round(base * ADMIN_FEE_RATE);
  const paymentFee = absorbed || base === 0 ? 0 : Math.round(base * PAY_FEE_RATE + PAY_FEE_FLAT);
  return {
    subtotal: subtotalCents,
    adminFee,
    paymentFee,
    discount,
    placementAdjust,
    total: base + adminFee + paymentFee,
    absorbed,
  };
}

export const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};

export const fmtTime = (t: string) => {
  if (!t) return '';
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export const fmtDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return iso; }
};

export const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(iso);
};

export const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();

export const daysFromNow = (n: number, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const txnId = () => 'txn_' + Math.random().toString(36).slice(2, 10).toUpperCase();
export const orderNumber = () => 'RE-' + Math.floor(100000 + Math.random() * 899999);

// Deterministic pseudo-QR matrix (visual stand-in that encodes the ticket code)
export function qrMatrix(code: string, size = 25): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const rand = () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  };
  const m: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const edge = r === 0 || r === 6 || c === 0 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m[r0 + r][c0 + c] = edge || core;
    }
  };
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) m[r][c] = rand() > 0.5;
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  const clear = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr >= 0 && cc >= 0 && rr < size && cc < size && (r === -1 || r === 7 || c === -1 || c === 7)) m[rr][cc] = false;
    }
  };
  clear(0, 0); clear(0, size - 7); clear(size - 7, 0);
  return m;
}

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export const CATEGORIES = ['Music', 'Community', 'Conference'] as const;

export const TEAM_PERMISSIONS = [
  { key: 'scan', label: 'Scan Tickets' },
  { key: 'finances', label: 'Finances' },
  { key: 'attendees', label: 'Attendee List' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'editEvent', label: 'Edit Event' },
  { key: 'deleteEvent', label: 'Delete Event' },
  { key: 'coupon', label: 'Coupon' },
  { key: 'resend', label: 'Resend Ticket' },
] as const;

export const UNIT_TYPES = ['Table', 'Room', 'Section', 'Seat', 'Group', 'Custom'] as const;

export const ASSIGN_MODES = [
  { key: 'organizer', label: 'Organizer Assigns' },
  { key: 'checkout', label: 'Attendee Selects at Checkout' },
  { key: 'post', label: 'Attendee Selects After Purchase' },
  { key: 'hybrid', label: 'Hybrid' },
] as const;
