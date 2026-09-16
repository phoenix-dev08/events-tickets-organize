import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Card, Badge, Button, Segmented, EmptyState } from '@/components/kit';
import { money, cx } from '@/lib/helpers';
import { Lock, Users } from 'lucide-react';

export const unitTone = (unit: any, occ: number) => {
  if (unit.locked) return { tone: 'slate' as const, label: 'Locked' };
  if (occ >= unit.capacity) return { tone: 'rose' as const, label: 'Full' };
  if (occ / unit.capacity >= 0.75) return { tone: 'amber' as const, label: 'Almost full' };
  return { tone: 'green' as const, label: 'Available' };
};

export const PlacementCanvas: React.FC<{
  layoutId: string; selectedUnitId?: string | null; onSelect?: (u: any) => void; editable?: boolean;
}> = ({ layoutId, selectedUnitId, onSelect, editable }) => {
  const { sel, updateUnit } = useApp();
  const units = sel.units(layoutId);
  const [drag, setDrag] = useState<any>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drag || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pt: any = 'touches' in e ? e.touches[0] : e;
    const x = Math.max(0, Math.min(88, ((pt.clientX - rect.left) / rect.width) * 100 - 6));
    const y = Math.max(0, Math.min(85, ((pt.clientY - rect.top) / rect.height) * 100 - 8));
    updateUnit(drag, { x, y });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
      onTouchMove={onMove} onTouchEnd={() => setDrag(null)}
      className="relative w-full h-[360px] rounded-2xl bg-[linear-gradient(to_right,rgba(148,163,184,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,.18)_1px,transparent_1px)] bg-[size:24px_24px] border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="absolute inset-x-0 top-0 text-center text-[10px] font-bold tracking-widest text-slate-400 py-1 bg-slate-100/70 dark:bg-slate-800/60">STAGE / FRONT</div>
      {units.map((u: any) => {
        const occ = sel.occupancy(u.id);
        const st = unitTone(u, occ);
        const selected = selectedUnitId === u.id;
        const colors = st.tone === 'rose' ? 'bg-rose-500/90' : st.tone === 'amber' ? 'bg-amber-500/90' : st.tone === 'slate' ? 'bg-slate-400/90' : 'bg-emerald-500/90';
        return (
          <button key={u.id}
            onMouseDown={() => editable && setDrag(u.id)}
            onTouchStart={() => editable && setDrag(u.id)}
            onClick={() => onSelect?.(u)}
            style={{ left: `${u.x}%`, top: `${u.y}%`, width: `${u.width}%`, height: `${u.height}%`, transform: `rotate(${u.rotation || 0}deg)` }}
            className={cx('absolute rounded-xl text-white text-[10px] font-bold grid place-items-center px-1 leading-tight transition',
              colors, selected && 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900', editable && 'cursor-move')}>
            <span className="truncate w-full text-center">{u.label}</span>
            <span className="opacity-90">{occ}/{u.capacity}</span>
            {u.locked && <Lock className="w-3 h-3 absolute top-1 right-1" />}
          </button>
        );
      })}
      {units.length === 0 && <div className="absolute inset-0 grid place-items-center text-[13px] text-slate-400">No units yet</div>}
    </div>
  );
};

export const PlacementList: React.FC<{
  layoutId: string; selectedUnitId?: string | null; onSelect?: (u: any) => void; ticketTypeTitle?: string;
  showWaitlist?: boolean; onWaitlist?: (u: any) => void;
}> = ({ layoutId, selectedUnitId, onSelect, ticketTypeTitle, showWaitlist, onWaitlist }) => {
  const { sel, db } = useApp();
  const units = sel.units(layoutId);
  if (!units.length) return <EmptyState title="No placement units" body="The organizer hasn't added units to this layout yet." />;
  return (
    <div className="space-y-2">
      {units.map((u: any) => {
        const occ = sel.occupancy(u.id);
        const st = unitTone(u, occ);
        const notAllowed = u.allowedTicketTypes?.length && ticketTypeTitle && !u.allowedTicketTypes.includes(ticketTypeTitle);
        const disabled = u.locked || occ >= u.capacity || !!notAllowed || !u.selectable;
        const occupants = db.placements.filter((p: any) => p.unitId === u.id && p.status !== 'released');
        return (
          <Card key={u.id} className={cx('p-4', selectedUnitId === u.id && 'ring-2 ring-indigo-500')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{u.label} <span className="text-[12px] font-normal text-slate-500">· {u.type}</span></p>
                {u.description && <p className="text-[12.5px] text-slate-500">{u.description}</p>}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge tone={st.tone}>{notAllowed ? 'Not available for your ticket' : st.label}</Badge>
                  <Badge tone="slate"><Users className="w-3 h-3" />{occ}/{u.capacity}</Badge>
                  {u.priceAdjust !== 0 && <Badge tone={u.priceAdjust > 0 ? 'amber' : 'green'}>{u.priceAdjust > 0 ? '+' : ''}{money(u.priceAdjust)}</Badge>}
                  {(u.waitlist || []).length > 0 && <Badge tone="blue">{u.waitlist.length} waitlisted</Badge>}
                </div>
                {occupants.length > 0 && <p className="text-[11.5px] text-slate-400 mt-1.5 truncate">{occupants.slice(0, 3).map((o: any) => o.attendeeName).join(', ')}{occupants.length > 3 ? ` +${occupants.length - 3}` : ''}</p>}
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                {onSelect && <Button size="sm" variant={selectedUnitId === u.id ? 'secondary' : 'primary'} disabled={disabled} onClick={() => onSelect(u)}>
                  {selectedUnitId === u.id ? 'Selected' : 'Select'}
                </Button>}
                {showWaitlist && occ >= u.capacity && !u.locked && onWaitlist && (
                  <Button size="sm" variant="outline" onClick={() => onWaitlist(u)}>Join waitlist</Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export const PlacementChooser: React.FC<{
  layoutId: string; selectedUnitId?: string | null; onSelect: (u: any) => void; ticketTypeTitle?: string; onWaitlist?: (u: any) => void;
}> = (props) => {
  const [view, setView] = useState('List');
  return (
    <div className="space-y-3">
      <Segmented options={['List', 'Canvas']} value={view} onChange={setView} />
      {view === 'Canvas'
        ? <PlacementCanvas layoutId={props.layoutId} selectedUnitId={props.selectedUnitId} onSelect={(u) => props.onSelect(u)} />
        : <PlacementList {...props} showWaitlist />}

      <div className="flex flex-wrap gap-3 text-[11.5px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" />Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" />Almost full</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" />Full</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400" />Locked</span>
      </div>
    </div>
  );
};
