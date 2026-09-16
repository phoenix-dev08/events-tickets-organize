import React, { useEffect, useState } from 'react';
import { cx, qrMatrix } from '@/lib/helpers';
import { ChevronLeft, X, Search, Check } from 'lucide-react';

/* ------------------------------ Screen shell ------------------------------ */
export const Screen: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cx('pb-28 min-h-[70vh]', className)}>{children}</div>
);

export const TopBar: React.FC<{
  title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode; sticky?: boolean;
}> = ({ title, subtitle, onBack, right, sticky = true }) => (
  <div className={cx('z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800', sticky && 'sticky top-0')}>
    <div className="flex items-center gap-2 px-4 h-14">
      {onBack && (
        <button aria-label="Go back" onClick={onBack} className="-ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[17px] font-semibold truncate text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  </div>
);

export const Section: React.FC<{ title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, action, children, className }) => (
  <section className={cx('px-4 mt-6', className)}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-3">
        {title && <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

/* ------------------------------ Controls ------------------------------ */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg'; full?: boolean; icon?: React.ReactNode;
};
export const Button: React.FC<BtnProps> = ({ variant = 'primary', size = 'md', full, icon, className, children, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  const sizes: Record<string, string> = { sm: 'h-9 px-3 text-[13px]', md: 'h-11 px-4 text-sm', lg: 'h-12 px-5 text-[15px]' };

  return (
    <button className={cx(base, variants[variant], sizes[size], full && 'w-full', className)} {...rest}>
      {icon}{children}
    </button>
  );
};

export const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode; className?: string }> = ({ active, onClick, children, className }) => (
  <button onClick={onClick} className={cx(
    'px-3.5 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition border active:scale-95',
    active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    className)}>{children}</button>
);

export const Badge: React.FC<{ tone?: 'green' | 'amber' | 'rose' | 'slate' | 'indigo' | 'blue'; children: React.ReactNode; className?: string }> = ({ tone = 'slate', children, className }) => {
  const tones: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
  return <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border', tones[tone], className)}>{children}</span>;
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    className={cx('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl', onClick && 'cursor-pointer active:scale-[0.99] transition', className)}>
    {children}
  </div>
);

export const Field: React.FC<{
  label?: string; value: any; onChange: (v: string) => void; placeholder?: string; type?: string;
  error?: string; hint?: string; required?: boolean; multiline?: boolean; disabled?: boolean; className?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', error, hint, required, multiline, disabled, className }) => (
  <label className={cx('block', className)}>
    {label && <span className="block text-[13px] font-medium mb-1.5 text-slate-700 dark:text-slate-300">{label}{required && <span className="text-rose-500"> *</span>}</span>}
    {multiline ? (
      <textarea disabled={disabled} value={value ?? ''} placeholder={placeholder} rows={4} onChange={(e) => onChange(e.target.value)}
        className={cx('w-full rounded-xl border px-3.5 py-3 text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
          error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700', disabled && 'opacity-60')} />
    ) : (
      <input disabled={disabled} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={cx('w-full h-12 rounded-xl border px-3.5 text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
          error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700', disabled && 'opacity-60')} />
    )}
    {error ? <span className="block text-[12px] text-rose-600 mt-1">{error}</span>
      : hint ? <span className="block text-[12px] text-slate-500 mt-1">{hint}</span> : null}
  </label>
);

export const Select: React.FC<{ label?: string; value: any; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; error?: string; required?: boolean; className?: string }> =
  ({ label, value, onChange, options, error, required, className }) => (
    <label className={cx('block', className)}>
      {label && <span className="block text-[13px] font-medium mb-1.5 text-slate-700 dark:text-slate-300">{label}{required && <span className="text-rose-500"> *</span>}</span>}
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className={cx('w-full h-12 rounded-xl border px-3 text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40',
          error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700')}>
        <option value="">Select…</option>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
      {error && <span className="block text-[12px] text-rose-600 mt-1">{error}</span>}
    </label>
  );

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <div className="min-w-0">
      {label && <p className="text-[14px] font-medium text-slate-900 dark:text-white">{label}</p>}
      {description && <p className="text-[12px] text-slate-500">{description}</p>}
    </div>
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cx('w-12 h-7 rounded-full p-0.5 transition shrink-0', checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700')}>
      <span className={cx('block w-6 h-6 bg-white rounded-full transition-transform', checked && 'translate-x-5')} />
    </button>
  </div>
);

export const Stepper: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string }> = ({ value, onChange, min = 0, max = 99, label }) => (
  <div className="flex items-center gap-3" role="group" aria-label={label || 'quantity'}>
    <button aria-label="Decrease" disabled={value <= min} onClick={() => onChange(value - 1)}
      className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 text-lg leading-none disabled:opacity-30 active:scale-95">−</button>
    <span className="w-6 text-center font-semibold tabular-nums">{value}</span>
    <button aria-label="Increase" disabled={value >= max} onClick={() => onChange(value + 1)}
      className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 text-lg leading-none disabled:opacity-30 active:scale-95">+</button>
  </div>
);

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Search'} aria-label={placeholder || 'Search'}
      className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[15px] outline-none focus:ring-2 focus:ring-indigo-500/30" />
    {value && <button aria-label="Clear" onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"><X className="w-4 h-4" /></button>}
  </div>
);

/* ------------------------------ Sheet / Modal ------------------------------ */
export const Sheet: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-[slideUp_.2s_ease-out]">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-[16px] text-slate-900 dark:text-white">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>
  );
};

export const Confirm: React.FC<{ open: boolean; title: string; body: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }> =
  ({ open, title, body, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) => (
    <Sheet open={open} onClose={onCancel} title={title}
      footer={<div className="flex gap-3"><Button variant="secondary" full onClick={onCancel}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} full onClick={onConfirm}>{confirmLabel}</Button></div>}>
      <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
    </Sheet>
  );

/* ------------------------------ States ------------------------------ */
export const EmptyState: React.FC<{ title: string; body?: string; action?: React.ReactNode; icon?: React.ReactNode }> = ({ title, body, action, icon }) => (
  <div className="text-center py-12 px-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">{icon || <Search className="w-6 h-6" />}</div>
    <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
    {body && <p className="text-[13px] text-slate-500 mt-1 max-w-xs mx-auto">{body}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl', className)} />
);

export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="text-center py-10">
    <p className="text-[15px] text-slate-700 dark:text-slate-200 font-medium">{message}</p>
    <Button className="mt-3" size="sm" onClick={onRetry}>Retry</Button>
  </div>
);

/* ------------------------------ QR ------------------------------ */
export const QRCode: React.FC<{ value: string; size?: number; className?: string }> = ({ value, size = 220, className }) => {
  const m = qrMatrix(value);
  const n = m.length;
  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cx('bg-white rounded-xl', className)} role="img" aria-label={`QR code for ticket ${value}`}>
      <rect width={size} height={size} fill="#fff" />
      {m.map((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell + 0.4} height={cell + 0.4} fill="#0f172a" /> : null))}
    </svg>
  );
};

/* ------------------------------ Misc ------------------------------ */
export const Segmented: React.FC<{ options: string[]; value: string; onChange: (v: string) => void; className?: string }> = ({ options, value, onChange, className }) => (
  <div className={cx('flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl', className)}>
    {options.map((o) => (
      <button key={o} onClick={() => onChange(o)}
        className={cx('flex-1 h-9 rounded-lg text-[13px] font-semibold transition',
          value === o ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500')}>{o}</button>
    ))}
  </div>
);

export const Row: React.FC<{ label: string; value?: React.ReactNode; onClick?: () => void; right?: React.ReactNode; icon?: React.ReactNode; danger?: boolean }> =
  ({ label, value, onClick, right, icon, danger }) => (
    <button onClick={onClick} disabled={!onClick}
      className={cx('w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-100 dark:border-slate-800 last:border-0', onClick && 'active:bg-slate-50 dark:active:bg-slate-800')}>
      {icon && <span className={cx('shrink-0', danger ? 'text-rose-500' : 'text-slate-400')}>{icon}</span>}
      <span className={cx('flex-1 text-[15px]', danger ? 'text-rose-600' : 'text-slate-900 dark:text-white')}>{label}</span>
      {value && <span className="text-[13px] text-slate-500">{value}</span>}
      {right}
    </button>
  );

export const PullToRefresh: React.FC<{ onRefresh: () => void; children: React.ReactNode }> = ({ onRefresh, children }) => {
  const [refreshing, setRefreshing] = useState(false);
  const start = React.useRef(0);
  return (
    <div
      onTouchStart={(e) => { if (window.scrollY <= 0) start.current = e.touches[0].clientY; }}
      onTouchMove={(e) => {
        if (start.current && e.touches[0].clientY - start.current > 90 && !refreshing) {
          setRefreshing(true); start.current = 0;
          setTimeout(() => { setRefreshing(false); onRefresh(); }, 700);
        }
      }}>
      {refreshing && <div className="py-3 text-center text-[13px] text-indigo-600">Refreshing…</div>}
      {children}
    </div>
  );
};

export const CheckRow: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <button onClick={() => onChange(!checked)} className="w-full flex items-start gap-3 py-2.5 text-left">
    <span className={cx('w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0', checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600')}>
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </span>
    <span>
      <span className="block text-[14px] text-slate-900 dark:text-white">{label}</span>
      {description && <span className="block text-[12px] text-slate-500">{description}</span>}
    </span>
  </button>
);
