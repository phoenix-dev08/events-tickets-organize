import React, { useEffect, useRef, useState } from 'react';

// ── Pressable ────────────────────────────────────────────────
export const Press: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' | 'div' }
> = ({ className = '', children, ...rest }) => (
  <button
    type="button"
    className={`press select-none text-left ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// ── Icons (inline, consistent stroke) ────────────────────────
type I = { className?: string; strokeWidth?: number };
const S = ({ children, className = 'w-5 h-5', strokeWidth = 1.7 }: I & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export const Icon = {
  Compass: (p: I) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 5-5 2.2 2.2-5z" /></S>,
  Ticket: (p: I) => <S {...p}><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-6Z" /><path d="M12 8v8" strokeDasharray="2 3" /></S>,
  Grid: (p: I) => <S {...p}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><circle cx="8" cy="16" r="3" /><circle cx="16" cy="16" r="3" /></S>,
  User: (p: I) => <S {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5" /></S>,
  Heart: ({ filled, ...p }: I & { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" className={p.className || 'w-5 h-5'}>
      <path d="M12 20s-7-4.5-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" />
    </svg>
  ),
  Share: (p: I) => <S {...p}><path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></S>,
  Back: (p: I) => <S {...p}><path d="m14 6-6 6 6 6" /></S>,
  Chevron: (p: I) => <S {...p}><path d="m9 6 6 6-6 6" /></S>,
  Down: (p: I) => <S {...p}><path d="m6 9 6 6 6-6" /></S>,
  Pin: (p: I) => <S {...p}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></S>,
  Calendar: (p: I) => <S {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></S>,
  Clock: (p: I) => <S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.2l3 1.8" /></S>,
  Plus: (p: I) => <S {...p}><path d="M12 5v14M5 12h14" /></S>,
  Minus: (p: I) => <S {...p}><path d="M5 12h14" /></S>,
  Check: (p: I) => <S {...p}><path d="m5 13 4.5 4.5L19 7" /></S>,
  Search: (p: I) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></S>,
  Bell: (p: I) => <S {...p}><path d="M18 9a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13 18 9Z" /><path d="M10 18a2 2 0 0 0 4 0" /></S>,
  Qr: (p: I) => <S {...p}><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h1M18 14h1" /></S>,
  Scan: (p: I) => <S {...p}><path d="M4 9V6a2 2 0 0 1 2-2h3M20 9V6a2 2 0 0 0-2-2h-3M4 15v3a2 2 0 0 0 2 2h3M20 15v3a2 2 0 0 1-2 2h-3M4 12h16" /></S>,
  Trend: (p: I) => <S {...p}><path d="m4 16 4.5-5 3.5 3L20 7" /><path d="M20 7h-4M20 7v4" /></S>,
  Wallet: (p: I) => <S {...p}><rect x="3.5" y="6" width="17" height="13" rx="3" /><path d="M3.5 10h17M16 14.5h1.5" /></S>,
  Sparkle: (p: I) => <S {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></S>,
  Settings: (p: I) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4.5 7.5l1.7 1M17.8 15.5l1.7 1M4.5 16.5l1.7-1M17.8 8.5l1.7-1" /></S>,
  Logout: (p: I) => <S {...p}><path d="M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" /><path d="m17 9 3 3-3 3M20 12h-8" /></S>,
  Swap: (p: I) => <S {...p}><path d="M4 8h13l-3-3M20 16H7l3 3" /></S>,
  Close: (p: I) => <S {...p}><path d="m6 6 12 12M18 6 6 18" /></S>,
  Image: (p: I) => <S {...p}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 4.5-4.5L13 17l3-3 4 4" /></S>,
  Undo: (p: I) => <S {...p}><path d="M4 9h9a5 5 0 0 1 0 10h-3" /><path d="m4 9 3.5-3.5M4 9l3.5 3.5" /></S>,
  Wand: (p: I) => <S {...p}><path d="M5 19 16 8" /><path d="m14 6 1 1M18 4l.8 2.2L21 7l-2.2.8L18 10l-.8-2.2L15 7l2.2-.8z" /></S>,
  Users: (p: I) => <S {...p}><circle cx="9" cy="9" r="3" /><path d="M3.5 19c1-3 3-4.2 5.5-4.2S13.5 16 14.5 19" /><path d="M16 7.5a2.8 2.8 0 0 1 0 5.4M17.5 19c-.3-1.4-.8-2.5-1.5-3.3 2 .2 3.5 1.4 4.2 3.3" /></S>,
};

// ── Bottom Sheet ─────────────────────────────────────────────
export const Sheet: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dark?: boolean;
  label?: string;
}> = ({ open, onClose, children, dark, label }) => {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 220); return () => clearTimeout(t); }
  }, [open]);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end" role="dialog" aria-label={label}>
      <button
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(8,13,22,0.5)', backdropFilter: 'blur(3px)' }}
      />
      <div
        className={`relative w-full rounded-t-[28px] overflow-hidden ${dark ? 'bg-ink-800 text-ivory' : 'bg-ivory text-ink'} ${open ? 'animate-sheet-up' : 'translate-y-full transition-transform duration-200'}`}
        style={{ boxShadow: '0 -20px 60px -20px rgba(8,13,22,0.5)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className={`h-1.5 w-10 rounded-full ${dark ? 'bg-white/25' : 'bg-ink/15'}`} />
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Toast ────────────────────────────────────────────────────
export const Toast: React.FC<{ message: string | null; tone?: 'dark' | 'green' }> = ({ message, tone = 'dark' }) => {
  if (!message) return null;
  return (
    <div className="absolute left-0 right-0 bottom-24 z-[60] flex justify-center px-6 pointer-events-none">
      <div className={`animate-pop flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-lift ${tone === 'green' ? 'bg-sage text-white' : 'bg-ink-900 text-ivory'}`}>
        <Icon.Check className="w-4 h-4" />
        {message}
      </div>
    </div>
  );
};

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number>();
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2200);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { msg, show };
}

// ── Misc primitives ──────────────────────────────────────────
export const Pill: React.FC<{
  active?: boolean; onClick?: () => void; children: React.ReactNode; dark?: boolean; className?: string;
}> = ({ active, onClick, children, dark, className = '' }) => (
  <Press
    onClick={onClick}
    aria-pressed={active}
    className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors min-h-[44px] flex items-center ${
      active
        ? dark ? 'bg-champagne text-ink-900' : 'bg-ink text-ivory'
        : dark ? 'bg-white/10 text-ivory/80 hover:bg-white/15' : 'bg-ink/[0.055] text-ink-600 hover:bg-ink/10'
    } ${className}`}
  >
    {children}
  </Press>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`text-[10.5px] font-bold uppercase tracking-label ${className}`}>{children}</span>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-ink/[0.06] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)' }} />
  </div>
);

export const Divider = ({ className = '' }: { className?: string }) => (
  <div className={`h-px bg-ink/10 ${className}`} />
);

export const CTA: React.FC<{
  onClick?: () => void; children: React.ReactNode; tone?: 'coral' | 'ink' | 'gold' | 'ghost';
  disabled?: boolean; className?: string;
}> = ({ onClick, children, tone = 'coral', disabled, className = '' }) => {
  const tones = {
    coral: 'bg-coral text-white shadow-[0_14px_30px_-12px_rgba(232,81,56,0.75)]',
    ink: 'bg-ink text-ivory shadow-[0_14px_30px_-14px_rgba(14,22,38,0.7)]',
    gold: 'bg-champagne text-ink-900 shadow-[0_14px_30px_-14px_rgba(201,165,87,0.8)]',
    ghost: 'bg-transparent text-ink border border-ink/15',
  };
  return (
    <Press
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[54px] rounded-2xl text-center text-[15px] font-bold tracking-tight flex items-center justify-center gap-2 disabled:opacity-40 disabled:shadow-none ${tones[tone]} ${className}`}
    >
      {children}
    </Press>
  );
};

// QR code — deterministic pseudo-random matrix with proper finder patterns
export const QRCode: React.FC<{ seed?: string; size?: number; className?: string }> = ({
  seed = 'RE-826194', size = 27, className = '',
}) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
  const rand = () => { h = (h * 1103515245 + 12345) % 2147483648; return ((h >> 16) & 1) === 1; };

  const finder = (r: number, c: number): boolean | null => {
    const boxes = [[0, 0], [0, size - 7], [size - 7, 0]];
    for (const [br, bc] of boxes) {
      if (r >= br && r < br + 7 && c >= bc && c < bc + 7) {
        const lr = r - br, lc = c - bc;
        const edge = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        return edge || core;
      }
      if (r >= br - 1 && r <= br + 7 && c >= bc - 1 && c <= bc + 7) return false;
    }
    return null;
  };

  const cells: boolean[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const f = finder(r, c);
      cells.push(f === null ? rand() : f);
    }
  }

  return (
    <div className={`grid bg-white ${className}`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }} aria-label="Ticket QR code">
      {cells.map((on, i) => (
        <div key={i} className="aspect-square" style={{ background: on ? '#0A101C' : '#ffffff' }} />
      ))}
    </div>
  );
};

export const Avatar: React.FC<{ src: string; className?: string; ring?: boolean; alt?: string }> = ({
  src, className = 'w-10 h-10', ring, alt = '',
}) => (
  <img src={src} alt={alt} loading="lazy"
    className={`${className} rounded-full object-cover ${ring ? 'ring-2 ring-ivory' : ''}`} />
);

export function useEnter(delayMs = 0) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delayMs); return () => clearTimeout(t); }, [delayMs]);
  return on;
}
