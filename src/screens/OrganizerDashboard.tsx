import React, { useEffect, useState } from 'react';
import { KPIS, ORGANIZER_USER, ORG_EVENTS, REVENUE_SERIES, compact } from '@/data/redeemed';
import { Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

const Chart: React.FC<{ range: 'Week' | 'Month' | 'Year' }> = ({ range }) => {
  const data = REVENUE_SERIES[range];
  const max = Math.max(...data.map(d => d.value));
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(false); const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, [range]);

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / max) * 82;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="relative h-[132px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A557" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#C9A557" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
          ))}
          <polygon points={`0,100 ${pts} 100,100`} fill="url(#rev)"
            style={{ opacity: on ? 1 : 0, transition: 'opacity 0.8s ease 0.15s' }} />
          <polyline points={pts} fill="none" stroke="#E3C98B" strokeWidth="1.6" strokeLinecap="round"
            strokeDasharray="300" strokeDashoffset={on ? 0 : 300}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between">
          {data.map((d, i) => (
            <div key={d.label} className="flex flex-1 flex-col items-center">
              <span className="h-2 w-2 rounded-full bg-champagne"
                style={{
                  marginBottom: `calc(${(d.value / max) * 82}% - 4px)`,
                  opacity: on ? 1 : 0,
                  transform: on ? 'scale(1)' : 'scale(0.3)',
                  transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 70 + 200}ms`,
                }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between">
        {data.map(d => <span key={d.label} className="flex-1 text-center text-[10px] font-bold text-ivory/40">{d.label}</span>)}
      </div>
    </div>
  );
};

const OrganizerDashboard: React.FC = () => {
  const { setRoot, go, showToast, attendees } = useDemo();
  const [range, setRange] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Drafts'>('Upcoming');
  const [picker, setPicker] = useState(false);
  const [event, setEvent] = useState(ORG_EVENTS.Upcoming[0]);
  const checkedIn = attendees.filter(a => a.checkedIn).length;

  return (
    <div className="min-h-full bg-ink-900 pb-8 text-ivory">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pb-6 pt-6">
        <div className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(circle at 15% 0%, rgba(201,165,87,0.45), transparent 58%)' }} />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Press onClick={() => setPicker(true)} className="flex items-center gap-2">
              <span className="truncate font-display text-[23px] leading-tight text-ivory">{event.title}</span>
              <Icon.Down className="h-4 w-4 shrink-0 text-champagne" />
            </Press>
            <p className="mt-1.5 text-[12.5px] text-ivory/60">Good afternoon, {ORGANIZER_USER.first}</p>
          </div>
          <img src={ORGANIZER_USER.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-champagne/50" />
        </div>
      </div>

      {/* KPIs — varied treatments */}
      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-[24px] border border-champagne/25 bg-gradient-to-br from-champagne/[0.16] to-transparent p-5">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-champagne">Revenue</Label>
                <p className="mt-2 font-display text-[36px] leading-none text-ivory">${compact(KPIS.revenue)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-sage-light">
                  <Icon.Trend className="h-4 w-4" />+18.4% vs last week
                </p>
              </div>
              <div className="flex rounded-full bg-white/[0.07] p-1">
                {(['Week', 'Month', 'Year'] as const).map(r => (
                  <Press key={r} onClick={() => setRange(r)}
                    className={`rounded-full px-2.5 py-1.5 text-[10.5px] font-bold ${range === r ? 'bg-champagne text-ink-900' : 'text-ivory/55'}`}>
                    {r}
                  </Press>
                ))}
              </div>
            </div>
            <div className="mt-4"><Chart range={range} /></div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <Label className="text-ivory/45">Tickets sold</Label>
            <p className="mt-2 font-display text-[28px] leading-none text-ivory">{KPIS.sold.toLocaleString()}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-champagne transition-all duration-1000" style={{ width: `${(KPIS.sold / KPIS.goal) * 100}%` }} />
            </div>
            <p className="mt-2 text-[10.5px] font-semibold text-ivory/45">of {KPIS.goal.toLocaleString()} capacity</p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <Label className="text-ivory/45">Checked in</Label>
            <div className="mt-2 flex items-end gap-2">
              <p className="font-display text-[28px] leading-none text-ivory">{checkedIn * 42}</p>
              <span className="pb-0.5 text-[11px] font-bold text-sage-light">{KPIS.capacityPct}%</span>
            </div>
            <div className="relative mt-3 grid h-[34px] place-items-center">
              <svg viewBox="0 0 40 40" className="h-[34px] w-[34px] -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#6FA98B" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={100.5} strokeDashoffset={100.5 * (1 - KPIS.capacityPct / 100)} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Today */}
      <div className="mt-8 px-5">
        <Label className="text-champagne">Today</Label>
        <h2 className="mt-1.5 font-display text-[23px] leading-tight text-ivory">Door operations</h2>

        <Press onClick={() => setRoot({ k: 'org-scan' })}
          className="mt-4 flex w-full items-center gap-4 rounded-[24px] bg-coral p-5 shadow-[0_18px_40px_-16px_rgba(232,81,56,0.8)]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white">
            <Icon.Scan className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold text-white">Scan tickets</span>
            <span className="mt-0.5 block text-[12px] font-medium text-white/80">Camera check-in · Hall entry B</span>
          </span>
          <Icon.Chevron className="h-5 w-5 shrink-0 text-white" />
        </Press>

        <div className="mt-3 flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-ivory">{KPIS.checkedIn} of {KPIS.sold.toLocaleString()} checked in</p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sage to-sage-light transition-all duration-1000"
                style={{ width: `${(KPIS.checkedIn / KPIS.sold) * 100}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-ivory/50">406 remaining · avg 4.2s per scan</p>
          </div>
          <Press onClick={() => setRoot({ k: 'org-attendees' })}
            className="shrink-0 rounded-full border border-white/15 px-3.5 py-2.5 text-[11.5px] font-bold text-ivory">
            Guest list
          </Press>
        </div>
      </div>

      {/* Your events */}
      <div className="mt-8 px-5">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[23px] leading-tight text-ivory">Your events</h2>
          <Press onClick={() => go({ k: 'org-create' })} className="text-[12px] font-bold text-champagne">+ New</Press>
        </div>
        <div className="mt-3 flex gap-2">
          {(['Upcoming', 'Past', 'Drafts'] as const).map(t => (
            <Press key={t} onClick={() => setTab(t)}
              className={`min-h-[40px] rounded-full px-3.5 text-[12px] font-bold ${tab === t ? 'bg-champagne text-ink-900' : 'bg-white/[0.07] text-ivory/60'}`}>
              {t}
            </Press>
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          {ORG_EVENTS[tab].map(e => (
            <div key={e.id} className="flex items-center gap-3.5 rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5">
              <img src={e.image} alt="" className="h-[58px] w-[52px] shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold leading-tight text-ivory line-clamp-1">{e.title}</p>
                <p className="mt-1 text-[11.5px] text-ivory/50">{e.date} · {e.sold}/{e.cap} sold</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-champagne" style={{ width: `${Math.min(100, (e.sold / e.cap) * 100)}%` }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className={`rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide ${
                  e.status === 'Draft' ? 'bg-white/10 text-ivory/60'
                    : e.status === 'Completed' ? 'bg-white/10 text-ivory/50'
                      : e.status === 'Nearly full' ? 'bg-coral/20 text-coral-light' : 'bg-sage/20 text-sage-light'}`}>
                  {e.status}
                </span>
                <Press onClick={() => setRoot({ k: 'org-seating' })}
                  className="mt-2 block w-full text-[11px] font-bold text-champagne">Manage</Press>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating create */}
      <Press onClick={() => go({ k: 'org-create' })}
        className="absolute bottom-[86px] right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-champagne px-5 text-[14px] font-extrabold text-ink-900 shadow-[0_18px_40px_-14px_rgba(201,165,87,0.9)]">
        <Icon.Plus className="h-5 w-5" />Create Event
      </Press>

      {/* Event picker sheet */}
      <Sheet open={picker} onClose={() => setPicker(false)} dark label="Switch event">
        <div className="px-5 pb-7 pt-3">
          <h3 className="font-display text-[22px] text-ivory">Switch event</h3>
          <div className="mt-4 space-y-2">
            {ORG_EVENTS.Upcoming.map(e => (
              <Press key={e.id}
                onClick={() => { setEvent(e); setPicker(false); showToast(`Now managing ${e.title}`); }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 ${e.id === event.id ? 'border-champagne/50 bg-champagne/10' : 'border-white/10 bg-white/[0.04]'}`}>
                <img src={e.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold text-ivory line-clamp-1">{e.title}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ivory/50">{e.date}</span>
                </span>
                {e.id === event.id && <Icon.Check className="h-5 w-5 shrink-0 text-champagne" />}
              </Press>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default OrganizerDashboard;
