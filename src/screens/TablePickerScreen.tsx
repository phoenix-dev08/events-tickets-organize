import React, { useState } from 'react';
import { TableSeat, tableState } from '@/data/redeemed';
import { CTA, Divider, Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { Steps, TopBar } from '@/components/Chrome';
import { FloorPlan, Legend } from '@/components/TableCanvas';
import { useDemo } from '@/contexts/DemoContext';

const TablePickerScreen: React.FC = () => {
  const { tables, order, setTable, go, showToast } = useDemo();
  const [view, setView] = useState<'Map' | 'List'>('Map');
  const [sheet, setSheet] = useState<TableSeat | null>(null);
  const selected = order.table;

  const choose = (t: TableSeat) => {
    setTable(t.id);
    setSheet(null);
    showToast(`${t.label} reserved for 10:00`, 'green');
  };

  return (
    <div className="pb-44">

      <TopBar title="Choose your table" sub="Community Celebration Dinner" />
      <Steps steps={['Tickets', 'Placement', 'Payment']} active={1} />

      <div className="px-5 pt-6">
        <h1 className="font-display text-[27px] leading-[1.08] text-ink">Choose your table</h1>
        <p className="mt-2 max-w-[300px] text-[13.5px] leading-relaxed text-ink-400">
          Select where you’d like to sit for the Community Celebration Dinner.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex rounded-full bg-ink/[0.06] p-1">
            {(['Map', 'List'] as const).map(v => (
              <Press key={v} onClick={() => setView(v)}
                className={`min-h-[40px] rounded-full px-5 text-[12.5px] font-bold transition-colors ${view === v ? 'bg-white text-ink shadow-soft' : 'text-ink-400'}`}>
                {v}
              </Press>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-sage">
            <span className="h-2 w-2 rounded-full bg-sage" />
            Live availability
          </div>
        </div>

        <div className="mt-4">
          <Legend />
        </div>
      </div>

      <div className="mt-5 px-4">
        {view === 'Map' ? (
          <div className="animate-fade-in">
            <FloorPlan tables={tables} selectedId={selected} onTap={setSheet} />
          </div>
        ) : (
          <div className="animate-fade-in space-y-2.5">
            {tables.map(t => {
              const st = tableState(t, selected);
              const left = t.seats - t.taken;
              const tones: Record<string, string> = {
                available: 'text-sage', almost: 'text-champagne-dark', full: 'text-ink-300', selected: 'text-coral',
              };
              return (
                <Press key={t.id} disabled={st === 'full'} onClick={() => setSheet(t)}
                  className={`flex w-full items-center gap-3.5 rounded-[20px] border p-3.5 ${st === 'selected' ? 'border-coral/50 bg-coral/[0.05]' : st === 'full' ? 'border-ink/8 bg-ink/[0.03]' : 'border-ink/10 bg-white'}`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-extrabold ${st === 'selected' ? 'bg-coral text-white' : st === 'full' ? 'bg-ink/[0.07] text-ink-300' : 'bg-ink/[0.05] text-ink'}`}>
                    {t.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-bold ${st === 'full' ? 'text-ink-300' : 'text-ink'}`}>{t.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-400">{t.note}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[12.5px] font-extrabold tabular-nums ${tones[st]}`}>{t.taken}/{t.seats}</p>
                    <p className="mt-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-300">
                      {st === 'full' ? 'Full' : st === 'selected' ? 'Selected' : `${left} open`}
                    </p>
                  </div>
                </Press>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-6 px-5">
          <div className="flex items-center gap-3 rounded-[22px] bg-sage/10 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage text-white">
              <Icon.Check className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold text-sage">Table {selected} reserved for 10:00</p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">We’ll hold these seats while you complete payment.</p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-7 px-5 text-center text-[11.5px] leading-relaxed text-ink-300">
        Tables seat eight. Seating is confirmed by email and shown on your digital ticket.
      </p>

      {/* Bottom sheet */}
      <Sheet open={!!sheet} onClose={() => setSheet(null)} label="Table details">
        {sheet && (
          <div className="px-5 pb-7 pt-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-coral">{sheet.note}</Label>
                <h2 className="mt-1.5 font-display text-[28px] leading-none text-ink">{sheet.label.toUpperCase()}</h2>
                <p className="mt-2 text-[13.5px] font-semibold text-ink-600">
                  {sheet.seats - sheet.taken} of {sheet.seats} seats available
                </p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-ink/[0.05]">
                <span className="text-center leading-none">
                  <span className="block text-[17px] font-extrabold text-ink">{sheet.taken}</span>
                  <span className="block text-[9.5px] font-bold text-ink-300">of {sheet.seats}</span>
                </span>
              </div>
            </div>

            <Divider className="my-5" />

            <Label className="text-ink-300">Attendees already here</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {sheet.guests.map(g => (
                <span key={g} className="rounded-full bg-ink/[0.05] px-3 py-2 text-[12px] font-bold text-ink-600">{g}</span>
              ))}
              {sheet.taken > sheet.guests.length && (
                <span className="rounded-full bg-ink/[0.05] px-3 py-2 text-[12px] font-bold text-ink-400">
                  +{sheet.taken - sheet.guests.length} more
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-ivory-100 px-4 py-3.5">
              <span className="text-[12.5px] font-semibold text-ink-600">Price adjustment</span>
              <span className="text-[12.5px] font-extrabold text-sage">No additional charge</span>
            </div>

            <div className="mt-5">
              <CTA onClick={() => choose(sheet)} disabled={sheet.seats - sheet.taken <= 0}>
                Choose {sheet.label}
              </CTA>
            </div>
          </div>
        )}
      </Sheet>

      {/* Sticky continue */}
      <div className="absolute inset-x-0 bottom-[72px] z-40 px-4 pb-4 pt-10"

        style={{ background: 'linear-gradient(to top, rgba(251,248,243,1) 45%, rgba(251,248,243,0))' }}>
        <CTA onClick={() => go({ k: 'payment' })} disabled={!selected}>
          {selected ? `Continue · Table ${selected}` : 'Select a table to continue'}
        </CTA>
      </div>
    </div>
  );
};

export default TablePickerScreen;
