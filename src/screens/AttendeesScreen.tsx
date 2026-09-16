import React, { useMemo, useState } from 'react';
import { Attendee, KPIS } from '@/data/redeemed';
import { Divider, Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

const FILTERS = ['All', 'Checked in', 'Not checked in', 'VIP', 'Table'] as const;

const AttendeesScreen: React.FC = () => {
  const { attendees, checkIn, showToast, setRoot } = useDemo();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');
  const [sheet, setSheet] = useState<Attendee | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return attendees.filter(a => {
      const matches = !term || a.name.toLowerCase().includes(term) || a.email.includes(term) || a.id.toLowerCase().includes(term);
      if (!matches) return false;
      if (filter === 'Checked in') return a.checkedIn;
      if (filter === 'Not checked in') return !a.checkedIn;
      if (filter === 'VIP') return a.tier === 'VIP';
      if (filter === 'Table') return a.table !== null;
      return true;
    });
  }, [attendees, q, filter]);

  const inCount = attendees.filter(a => a.checkedIn).length;
  const pct = ((inCount / attendees.length) * 100).toFixed(1);

  return (
    <div className="min-h-full bg-ink-900 pb-8 text-ivory">
      <div className="px-5 pt-6">
        <Label className="text-champagne">Redeem Conference 2026</Label>
        <h1 className="mt-1.5 font-display text-[28px] leading-tight text-ivory">Attendees</h1>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { n: KPIS.sold.toLocaleString(), l: 'Registered', c: 'text-ivory' },
            { n: KPIS.checkedIn.toLocaleString(), l: 'Checked in', c: 'text-sage-light' },
            { n: `${pct}%`, l: 'Attendance', c: 'text-champagne' },
          ].map(s => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3.5">
              <p className={`font-display text-[21px] leading-none ${s.c}`}>{s.n}</p>
              <p className="mt-1.5 text-[10.5px] font-semibold text-ivory/50">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] px-4">
          <Icon.Search className="h-[18px] w-[18px] shrink-0 text-ivory/45" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search attendee, email or ticket…"
            className="h-[50px] w-full bg-transparent text-[14px] font-medium text-ivory outline-none placeholder:text-ivory/40"
          />
          {q && (
            <Press onClick={() => setQ('')} aria-label="Clear" className="shrink-0 text-ivory/50">
              <Icon.Close className="h-4 w-4" />
            </Press>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map(f => (
            <Press key={f} onClick={() => setFilter(f)}
              className={`min-h-[40px] whitespace-nowrap rounded-full px-3.5 text-[12px] font-bold ${filter === f ? 'bg-champagne text-ink-900' : 'bg-white/[0.07] text-ivory/60'}`}>
              {f}
            </Press>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="mt-4 px-4">
        {list.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 px-6 py-12 text-center">
            <Icon.Search className="mx-auto h-6 w-6 text-ivory/35" />
            <p className="mt-3 text-[14px] font-bold text-ivory">No attendees found</p>
            <p className="mt-1.5 text-[12px] text-ivory/50">Try a different name, email or ticket ID.</p>
            <Press onClick={() => { setQ(''); setFilter('All'); }}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-white/10 px-5 text-[12.5px] font-bold text-ivory">
              Clear filters
            </Press>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(a => (
              <Press key={a.id} onClick={() => setSheet(a)}
                className="flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
                <img src={a.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold leading-tight text-ivory line-clamp-1">{a.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
                      a.tier === 'VIP' ? 'bg-champagne/20 text-champagne' : a.tier === 'Premium' ? 'bg-coral/20 text-coral-light' : 'bg-white/10 text-ivory/55'}`}>
                      {a.tier}
                    </span>
                    <span className="text-[11px] font-semibold text-ivory/50">
                      {a.table ? `Table ${a.table}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {a.checkedIn ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-light">
                      <Icon.Check className="h-3.5 w-3.5" />Checked in
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-ivory/40">Not checked in</span>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-ivory/35">{a.id}</p>
                </div>
              </Press>
            ))}
          </div>
        )}
      </div>

      {/* Attendee sheet */}
      <Sheet open={!!sheet} onClose={() => setSheet(null)} dark label="Attendee details">
        {sheet && (
          <div className="px-5 pb-7 pt-3">
            <div className="flex items-center gap-3.5">
              <img src={sheet.avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-champagne/40" />
              <div className="min-w-0">
                <h3 className="font-display text-[23px] leading-tight text-ivory">{sheet.name}</h3>
                <p className="mt-0.5 text-[12px] text-ivory/55">{sheet.email}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { l: 'Ticket', v: sheet.tier },
                { l: 'Placement', v: sheet.table ? `Table ${sheet.table}` : 'Unassigned' },
                { l: 'Transaction', v: sheet.paid },
                { l: 'Ticket ID', v: sheet.id },
              ].map(x => (
                <div key={x.l} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">{x.l}</p>
                  <p className="mt-1 text-[13px] font-bold text-ivory">{x.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-white/[0.05] px-4 py-3.5">
              <span className={`h-2.5 w-2.5 rounded-full ${sheet.checkedIn ? 'bg-sage-light' : 'bg-ivory/30'}`} />
              <span className="text-[12.5px] font-bold text-ivory">
                {sheet.checkedIn ? `Checked in at ${sheet.time}` : 'Not checked in yet'}
              </span>
            </div>

            <Divider className="my-5 !bg-white/10" />

            <div className="space-y-2.5">
              {!sheet.checkedIn && (
                <Press onClick={() => { checkIn(sheet.id); showToast(`${sheet.name} checked in`, 'green'); setSheet(null); }}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sage text-[14px] font-bold text-white">
                  <Icon.Check className="h-4 w-4" />Check in manually
                </Press>
              )}
              <div className="flex gap-2.5">
                <Press onClick={() => { setSheet(null); setRoot({ k: 'org-seating' }); }}
                  className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 text-[13px] font-bold text-ivory">
                  <Icon.Grid className="h-4 w-4" />Move table
                </Press>
                <Press onClick={() => showToast('Ticket resent by email')}
                  className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 text-[13px] font-bold text-ivory">
                  <Icon.Share className="h-4 w-4" />Resend
                </Press>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};

export default AttendeesScreen;
