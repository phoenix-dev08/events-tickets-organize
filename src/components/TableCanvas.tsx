import React from 'react';
import { TableSeat, tableState } from '@/data/redeemed';
import { Icon, Press } from '@/components/ui/kit';

const STATE_STYLE: Record<string, { ring: string; fill: string; text: string; badge: string; label: string }> = {
  available: { ring: 'stroke-sage', fill: 'bg-white', text: 'text-ink', badge: 'bg-sage/12 text-sage', label: 'Available' },
  almost: { ring: 'stroke-champagne', fill: 'bg-white', text: 'text-ink', badge: 'bg-champagne/18 text-champagne-dark', label: 'Almost full' },
  full: { ring: 'stroke-ink-300', fill: 'bg-ink/[0.045]', text: 'text-ink-300', badge: 'bg-ink/[0.07] text-ink-300', label: 'Full' },
  selected: { ring: 'stroke-coral', fill: 'bg-coral', text: 'text-white', badge: 'bg-coral text-white', label: 'Selected' },
};

export const TableDot: React.FC<{
  t: TableSeat; selectedId: number | null; onTap: (t: TableSeat) => void; compact?: boolean; highlight?: boolean;
}> = ({ t, selectedId, onTap, compact, highlight }) => {
  const st = tableState(t, selectedId);
  const s = STATE_STYLE[st];
  const pct = t.taken / t.seats;
  const r = compact ? 26 : 29;
  const circ = 2 * Math.PI * r;
  const disabled = st === 'full';

  return (
    <Press
      onClick={() => !disabled && onTap(t)}
      disabled={disabled}
      aria-label={`${t.label}, ${t.seats - t.taken} of ${t.seats} seats available, ${s.label}`}
      className={`relative grid place-items-center transition-transform duration-300 ${st === 'selected' ? 'scale-[1.12]' : ''} ${highlight ? 'scale-[1.06]' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <svg viewBox="0 0 70 70" className={compact ? 'h-[62px] w-[62px]' : 'h-[70px] w-[70px]'}>
        <circle cx="35" cy="35" r={r} className="stroke-ink/10" strokeWidth="4" fill="none" />
        <circle
          cx="35" cy="35" r={r}
          className={s.ring} strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 35 35)"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <span className={`absolute inset-[9px] grid place-items-center rounded-full ${s.fill} ${st === 'selected' ? 'shadow-[0_10px_24px_-8px_rgba(232,81,56,0.8)]' : 'shadow-soft'}`}>
        {st === 'selected' ? (
          <span className="text-center leading-none text-white">
            <Icon.Check className="mx-auto h-4 w-4" />
            <span className="mt-0.5 block text-[10px] font-extrabold">{t.id}</span>
          </span>
        ) : (
          <span className={`text-center leading-none ${s.text}`}>
            <span className="block text-[15px] font-extrabold">{t.id}</span>
            <span className="mt-0.5 block text-[8.5px] font-bold tabular-nums opacity-70">{t.taken}/{t.seats}</span>
          </span>
        )}
      </span>
      {st === 'full' && (
        <span className="absolute -bottom-1 rounded-full bg-ink/80 px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wide text-ivory">Full</span>
      )}
    </Press>
  );
};

export const Stage: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className="mx-auto w-[72%]">
    <div
      className="grid h-11 place-items-center rounded-b-[26px] rounded-t-lg"
      style={{
        background: dark
          ? 'linear-gradient(180deg, rgba(201,165,87,0.55), rgba(201,165,87,0.12))'
          : 'linear-gradient(180deg, #1B283D, rgba(27,40,61,0.55))',
      }}
    >
      <span className="text-[10.5px] font-bold uppercase tracking-label text-ivory">Stage</span>
    </div>
  </div>
);

export const Legend: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
    {[
      { c: 'bg-sage', l: 'Available' },
      { c: 'bg-champagne', l: 'Almost full' },
      { c: 'bg-ink-300', l: 'Full' },
      { c: 'bg-coral', l: 'Selected' },
    ].map(x => (
      <span key={x.l} className={`flex items-center gap-1.5 text-[11px] font-semibold ${dark ? 'text-ivory/65' : 'text-ink-400'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${x.c}`} />{x.l}
      </span>
    ))}
  </div>
);

/** Floor plan: stage at top, 12 tables in a horseshoe/grid hybrid */
export const FloorPlan: React.FC<{
  tables: TableSeat[]; selectedId: number | null; onTap: (t: TableSeat) => void;
  dark?: boolean; highlightId?: number | null;
  onDropTable?: (id: number) => void;
}> = ({ tables, selectedId, onTap, dark, highlightId, onDropTable }) => {
  const rows = [tables.slice(0, 3), tables.slice(3, 7), tables.slice(7, 10), tables.slice(10, 12)];
  return (
    <div className={`rounded-[26px] p-4 ${dark ? 'border border-white/10 bg-white/[0.035]' : 'border border-ink/10 bg-white'}`}
      style={{
        backgroundImage: dark
          ? 'radial-gradient(circle at 50% 0%, rgba(201,165,87,0.12), transparent 62%)'
          : 'radial-gradient(circle at 50% 0%, rgba(201,165,87,0.14), transparent 60%)',
      }}>
      <Stage dark={dark} />
      <div className="mt-4 space-y-3.5">
        {rows.map((row, ri) => (
          <div key={ri} className={`flex items-center justify-center gap-3 ${ri === 3 ? 'gap-10' : ''}`}>
            {row.map(t => (
              <div
                key={t.id}
                onDragOver={e => { if (onDropTable) e.preventDefault(); }}
                onDrop={() => onDropTable?.(t.id)}
              >
                <TableDot t={t} selectedId={selectedId} onTap={onTap} highlight={highlightId === t.id} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={`mt-4 flex items-center justify-center gap-1.5 text-[10.5px] font-semibold ${dark ? 'text-ivory/45' : 'text-ink-300'}`}>
        <Icon.Pin className="h-3.5 w-3.5" />
        Hall C · Entrance at rear
      </div>
    </div>
  );
};
