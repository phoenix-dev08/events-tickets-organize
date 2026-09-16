import React, { useState } from 'react';
import { Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { FloorPlan, Legend } from '@/components/TableCanvas';
import { useDemo } from '@/contexts/DemoContext';

const SeatingBuilder: React.FC = () => {
  const { tables, attendees, assign, undo, showToast } = useDemo();
  const [drawer, setDrawer] = useState<'Assigned' | 'Unassigned' | 'Waitlist'>('Unassigned');
  const [dragId, setDragId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [settings, setSettings] = useState(false);

  const unassigned = attendees.filter(a => a.table === null);
  const assigned = attendees.filter(a => a.table !== null);
  const waitlist = attendees.slice(0, 4);
  const rows = drawer === 'Assigned' ? assigned : drawer === 'Unassigned' ? unassigned : waitlist;
  const totalSeats = tables.reduce((s, t) => s + t.seats, 0);

  const drop = (tableId: number) => {
    if (!dragId) return;
    const person = attendees.find(a => a.id === dragId);
    assign(dragId, tableId);
    setHighlight(tableId);
    setTimeout(() => setHighlight(null), 700);
    showToast(`${person?.name} moved to Table ${tableId}`, 'green');
    setDragId(null);
  };

  return (
    <div className="min-h-full bg-ink-900 pb-8 text-ivory">
      <div className="px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[27px] leading-tight text-ivory">Dinner Seating</h1>
            <p className="mt-1 text-[12.5px] text-ivory/55">{tables.length} tables · {totalSeats} seats</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/12 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-sage-light" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-light" />
            </span>
            <span className="text-[10.5px] font-bold uppercase tracking-label text-sage-light">Live</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex gap-2">
          <Press onClick={() => showToast(undo() ? 'Last change undone' : 'Nothing to undo')}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.05] text-[12px] font-bold text-ivory">
            <Icon.Undo className="h-4 w-4" />Undo
          </Press>
          <Press onClick={() => {
            const free = tables.find(t => t.taken < t.seats);
            if (unassigned.length && free) { assign(unassigned[0].id, free.id); showToast(`Auto-assigned ${unassigned[0].name} to Table ${free.id}`, 'green'); }
            else showToast('Everyone has a table');
          }}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.05] text-[12px] font-bold text-ivory">
            <Icon.Wand className="h-4 w-4" />Auto Assign
          </Press>
          <Press onClick={() => showToast('Seating published to attendees', 'green')}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-champagne text-[12px] font-extrabold text-ink-900">
            <Icon.Check className="h-4 w-4" />Publish
          </Press>
        </div>

        <div className="mt-4"><Legend dark /></div>
      </div>

      {/* Canvas */}
      <div className="mt-4 px-4">
        <FloorPlan
          dark
          tables={tables}
          selectedId={null}
          highlightId={highlight}
          onTap={t => showToast(`${t.label} · ${t.taken}/${t.seats} seated`)}
          onDropTable={drop}
        />
        {dragId && (
          <p className="mt-3 text-center text-[11.5px] font-bold text-champagne animate-fade-in">
            Drop onto a table to seat this guest
          </p>
        )}
      </div>

      {/* Tools */}
      <div className="mt-5 flex gap-2 px-5">
        {[
          { l: 'Add Table', i: <Icon.Plus className="h-4 w-4" />, a: () => showToast('Table 13 added to layout') },
          { l: 'Bulk Assign', i: <Icon.Users className="h-4 w-4" />, a: () => showToast('12 guests queued for bulk assign') },
          { l: 'Layout', i: <Icon.Settings className="h-4 w-4" />, a: () => setSettings(true) },
        ].map(b => (
          <Press key={b.l} onClick={b.a}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 text-[11.5px] font-bold text-ivory/80">
            {b.i}{b.l}
          </Press>
        ))}
      </div>

      {/* Attendee drawer */}
      <div className="mt-7 rounded-t-[28px] border-t border-white/10 bg-white/[0.04] px-5 pb-6 pt-5">
        <div className="flex gap-2">
          {([
            ['Assigned', assigned.length],
            ['Unassigned', unassigned.length],
            ['Waitlist', waitlist.length],
          ] as const).map(([t, n]) => (
            <Press key={t} onClick={() => setDrawer(t as any)}
              className={`flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold ${drawer === t ? 'bg-champagne text-ink-900' : 'bg-white/[0.07] text-ivory/60'}`}>
              {t} <span className="opacity-70">· {n}</span>
            </Press>
          ))}
        </div>

        <p className="mt-4 text-[11.5px] font-semibold text-ivory/45">
          {drawer === 'Unassigned' ? 'Drag a guest onto a table above to seat them.' : drawer === 'Assigned' ? 'Tap a guest to move or unseat.' : 'Waitlisted guests are seated when space opens.'}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {rows.slice(0, 12).map(a => (
            <div
              key={a.id}
              draggable
              onDragStart={() => setDragId(a.id)}
              onDragEnd={() => setDragId(null)}
              onClick={() => {
                if (drawer === 'Unassigned') { setDragId(a.id); showToast('Now tap a table to seat'); }
                else showToast(`${a.name} · Table ${a.table}`);
              }}
              className={`flex cursor-grab items-center gap-2 rounded-full border px-2.5 py-2 transition-all active:scale-95 ${
                dragId === a.id ? 'border-champagne bg-champagne/20' : 'border-white/12 bg-white/[0.06]'}`}
            >
              <img src={a.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
              <span className="text-[12px] font-bold text-ivory">{a.name.split(' ')[0]} {a.name.split(' ')[1]?.[0]}.</span>
              {a.table && <span className="text-[10.5px] font-bold text-champagne">T{a.table}</span>}
            </div>
          ))}
          {rows.length === 0 && (
            <div className="w-full rounded-2xl border border-dashed border-white/15 py-8 text-center">
              <p className="text-[13px] font-bold text-ivory">Nothing here</p>
              <p className="mt-1 text-[11.5px] text-ivory/50">Every guest in this group has a table.</p>
            </div>
          )}
        </div>

        {dragId && (
          <Press onClick={() => drop(7)}
            className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[13.5px] font-bold text-white">
            Seat at Table 7
          </Press>
        )}
      </div>

      <Sheet open={settings} onClose={() => setSettings(false)} dark label="Layout settings">
        <div className="px-5 pb-7 pt-3">
          <h3 className="font-display text-[22px] text-ivory">Layout settings</h3>
          <div className="mt-4 space-y-3">
            {[
              { l: 'Seats per table', v: '8' },
              { l: 'Layout template', v: '12 Round Tables' },
              { l: 'Attendee self-selection', v: 'Enabled' },
              { l: 'Hold duration', v: '10 minutes' },
            ].map(x => (
              <div key={x.l} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <span className="text-[13px] font-semibold text-ivory/75">{x.l}</span>
                <span className="text-[13px] font-bold text-champagne">{x.v}</span>
              </div>
            ))}
          </div>
          <Press onClick={() => { setSettings(false); showToast('Layout settings saved', 'green'); }}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-champagne text-[14px] font-extrabold text-ink-900">
            Save layout
          </Press>
        </div>
      </Sheet>
    </div>
  );
};

export default SeatingBuilder;
