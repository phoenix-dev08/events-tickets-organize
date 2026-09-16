import React from 'react';
import { Icon, Press } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

export const TopBar: React.FC<{
  title: string; sub?: string; dark?: boolean; right?: React.ReactNode; onBack?: () => void;
}> = ({ title, sub, dark, right, onBack }) => {
  const { back } = useDemo();
  return (
    <div className={`sticky top-0 z-30 flex items-center gap-3 px-4 py-3 ${dark ? 'glass-dark text-ivory' : 'glass text-ink'}`}>
      <Press onClick={onBack || back} aria-label="Back"
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${dark ? 'bg-white/10' : 'bg-ink/[0.06]'}`}>
        <Icon.Back className="h-5 w-5" />
      </Press>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-tight">{title}</p>
        {sub && <p className={`truncate text-[11.5px] ${dark ? 'text-ivory/60' : 'text-ink-400'}`}>{sub}</p>}
      </div>
      {right}
    </div>
  );
};

export const Steps: React.FC<{ steps: string[]; active: number; dark?: boolean }> = ({ steps, active, dark }) => (
  <div className="flex items-center gap-2 px-5 pt-4">
    {steps.map((s, i) => (
      <div key={s} className="flex-1">
        <div className={`h-[3px] rounded-full transition-all duration-500 ${i <= active ? 'bg-coral' : dark ? 'bg-white/15' : 'bg-ink/12'}`} />
        <p className={`mt-2 text-[10.5px] font-bold uppercase tracking-label ${i === active ? 'text-coral' : dark ? 'text-ivory/40' : 'text-ink-300'}`}>{s}</p>
      </div>
    ))}
  </div>
);

export const BottomNav: React.FC = () => {
  const { screen, setRoot, switchMode, mode } = useDemo();
  const items = [
    { k: 'explore', label: 'Explore', icon: Icon.Compass },
    { k: 'tickets', label: 'Tickets', icon: Icon.Ticket },
    { k: 'organize', label: 'Organize', icon: Icon.Grid },
    { k: 'profile', label: 'Profile', icon: Icon.User },
  ] as const;

  const activeKey = ['explore', 'event', 'notifications'].includes(screen.k)
    ? 'explore'
    : ['tickets', 'ticket', 'checkout', 'tables', 'payment', 'success'].includes(screen.k)
      ? 'tickets'
      : screen.k === 'profile' ? 'profile' : 'organize';

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 glass border-t border-ink/[0.07] px-2 pb-2 pt-1.5">
      <div className="flex items-stretch">
        {items.map(it => {
          const active = activeKey === it.k;
          const IconC = it.icon;
          return (
            <Press
              key={it.k}
              aria-label={it.label}
              aria-current={active}
              onClick={() => {
                if (it.k === 'organize') switchMode(mode === 'organizer' ? 'attendee' : 'organizer');
                else setRoot({ k: it.k as any });
              }}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2"
            >
              <span className={`relative grid h-8 w-12 place-items-center rounded-full transition-colors duration-300 ${active ? 'bg-ink text-ivory' : 'text-ink-400'}`}>
                <IconC className="h-[19px] w-[19px]" />
                {it.k === 'organize' && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-champagne" />
                )}
              </span>
              <span className={`text-[10.5px] font-bold ${active ? 'text-ink' : 'text-ink-300'}`}>{it.label}</span>
            </Press>
          );
        })}
      </div>
    </nav>
  );
};

export const OrgNav: React.FC = () => {
  const { screen, setRoot, switchMode } = useDemo();
  const items = [
    { k: 'org-dash', label: 'Overview', icon: Icon.Trend },
    { k: 'org-attendees', label: 'Attendees', icon: Icon.Users },
    { k: 'org-seating', label: 'Seating', icon: Icon.Grid },
    { k: 'org-scan', label: 'Check-in', icon: Icon.Scan },
  ] as const;
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 glass-dark border-t border-white/10 px-2 pb-2 pt-1.5">
      <div className="flex items-stretch">
        {items.map(it => {
          const active = screen.k === it.k || (it.k === 'org-dash' && screen.k === 'org-create');
          const IconC = it.icon;
          return (
            <Press key={it.k} aria-label={it.label} onClick={() => setRoot({ k: it.k as any })}
              className="flex flex-1 flex-col items-center gap-1 py-2">
              <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors duration-300 ${active ? 'bg-champagne text-ink-900' : 'text-ivory/55'}`}>
                <IconC className="h-[19px] w-[19px]" />
              </span>
              <span className={`text-[10.5px] font-bold ${active ? 'text-ivory' : 'text-ivory/45'}`}>{it.label}</span>
            </Press>
          );
        })}
        <Press aria-label="Attendee mode" onClick={() => switchMode('attendee')}
          className="flex flex-1 flex-col items-center gap-1 py-2">
          <span className="grid h-8 w-12 place-items-center rounded-full text-ivory/55">
            <Icon.Swap className="h-[19px] w-[19px]" />
          </span>
          <span className="text-[10.5px] font-bold text-ivory/45">Attendee</span>
        </Press>
      </div>
    </nav>
  );
};

export const RoleTransition: React.FC<{ show: boolean; to: 'attendee' | 'organizer' }> = ({ show, to }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 animate-fade-in bg-ink-900" />
      <div className="relative animate-pop text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-champagne/40">
          <Icon.Swap className="h-7 w-7 text-champagne" />
        </div>
        <p className="mt-5 text-[10.5px] font-bold uppercase tracking-label text-champagne">Switching to</p>
        <p className="mt-2 font-display text-[28px] leading-tight text-ivory">
          {to === 'organizer' ? 'Organizer Mode' : 'Attendee Mode'}
        </p>
      </div>
    </div>
  );
};
