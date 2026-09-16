import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Field, Select, Segmented, Sheet, Confirm, EmptyState, Toggle, SearchInput, Chip } from '@/components/kit';
import { PlacementCanvas, PlacementList } from '@/components/PlacementPicker';
import { PermissionBlock } from '@/screens/organizer/Orders';
import { uid, money, relTime, UNIT_TYPES, ASSIGN_MODES } from '@/lib/helpers';
import { Plus, LayoutGrid, Trash2, Lock, Unlock, Wand2, History, Save, Send, Users, Undo2, Image } from 'lucide-react';

export const Layouts: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, go, createLayout, deleteLayout, can, toast } = useApp();
  const events = sel.orgEvents(myOrganizerId);
  const [eventId, setEventId] = useState(current.params?.eventId || db.showcaseEventId);
  const [sheet, setSheet] = useState<any>(null);
  const [del, setDel] = useState<any>(null);

  if (!can('editEvent')) return <PermissionBlock title="Seating & placement" />;
  const layouts = db.layouts.filter((l: any) => l.eventId === eventId);

  return (
    <Screen>
      <TopBar title="Seating & placement" subtitle={sel.event(eventId)?.title} onBack={back}
        right={<button onClick={() => setSheet({ name: '', mode: 'organizer', description: '', waitlistEnabled: true, templateId: '' })} aria-label="New layout" className="p-2 text-indigo-600"><Plus className="w-6 h-6" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <Select value={eventId} onChange={setEventId} options={events.map((e: any) => ({ value: e.id, label: e.title }))} />
        {layouts.length === 0 && <EmptyState title="No layouts yet." body="Create dinner tables, breakout rooms, hotel rooms, bus seats or small groups."
          icon={<LayoutGrid className="w-6 h-6" />} action={<Button onClick={() => setSheet({ name: '', mode: 'organizer', description: '', waitlistEnabled: true, templateId: '' })}>Create layout</Button>} />}
        {layouts.map((l: any) => {
          const units = sel.units(l.id);
          const cap = units.reduce((s: number, u: any) => s + u.capacity, 0);
          const occ = units.reduce((s: number, u: any) => s + sel.occupancy(u.id), 0);
          return (
            <Card key={l.id} className="p-4">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] text-slate-900 dark:text-white">{l.name}</p>
                  <p className="text-[12.5px] text-slate-500">{units.length} units · {occ}/{cap} placed</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge tone="indigo">{ASSIGN_MODES.find((m) => m.key === l.mode)?.label}</Badge>
                    {l.locked && <Badge tone="slate">Locked</Badge>}
                    {l.campaign && <Badge tone="amber">Selection open</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" onClick={() => go('org-layout', { layoutId: l.id })}>Open</Button>
                  <Button size="sm" variant="outline" onClick={() => setDel(l)}>Delete</Button>
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="p-4">
          <p className="font-semibold text-[14px] text-slate-900 dark:text-white">Saved templates</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {db.templates.map((t: any) => <Badge key={t.id} tone="slate">{t.name} · {t.units.length} units</Badge>)}
          </div>
        </Card>
      </div>

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title="New layout"
        footer={<Button full onClick={() => {
          if (!sheet.name.trim()) { toast('Name your layout', 'error'); return; }
          const id = createLayout(eventId, sheet);
          setSheet(null);
          setTimeout(() => go('org-layout', { layoutId: id, template: sheet.templateId }), 60);
        }}>Create layout</Button>}>
        {sheet && (
          <div className="space-y-3">
            <Field label="Layout name" value={sheet.name} onChange={(v) => setSheet({ ...sheet, name: v })} placeholder="Dinner Seating, Breakout Session 1, Hotel Rooms…" required />
            <Field label="Description" value={sheet.description} onChange={(v) => setSheet({ ...sheet, description: v })} />
            <Select label="Assignment mode" value={sheet.mode} onChange={(v) => setSheet({ ...sheet, mode: v })} options={ASSIGN_MODES.map((m) => ({ value: m.key, label: m.label }))} />
            <Select label="Start from template (optional)" value={sheet.templateId} onChange={(v) => setSheet({ ...sheet, templateId: v })} options={db.templates.map((t: any) => ({ value: t.id, label: t.name }))} />
            <Toggle checked={sheet.waitlistEnabled} onChange={(v) => setSheet({ ...sheet, waitlistEnabled: v })} label="Enable waitlists" description="Attendees can queue for full units" />
          </div>
        )}
      </Sheet>

      <Confirm open={!!del} title="Delete layout?" danger confirmLabel="Delete layout"
        body={`All units and placements in “${del?.name}” will be removed and attendees become unassigned.`}
        onCancel={() => setDel(null)} onConfirm={() => { deleteLayout(del.id); setDel(null); toast('Layout deleted'); }} />
    </Screen>
  );
};

export const LayoutBuilder: React.FC = () => {
  const {
    db, sel, back, current, addUnit, updateUnit, deleteUnit, bulkGenerateUnits, applyTemplate, saveAsTemplate,
    autoAssign, undoLastPlacementAction, assignPlacement, unassignPlacement, updateLayout, sendSelectionCampaign, toast, promoteWaitlist,
  } = useApp();
  const layout = db.layouts.find((l: any) => l.id === current.params?.layoutId);
  const [view, setView] = useState('Canvas');
  const [unitSheet, setUnitSheet] = useState<any>(null);
  const [bulk, setBulk] = useState<any>(null);
  const [auto, setAuto] = useState<any>(null);
  const [assign, setAssign] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [tplName, setTplName] = useState<any>(null);
  const [history, setHistory] = useState(false);
  const [del, setDel] = useState<any>(null);
  const [q, setQ] = useState('');

  React.useEffect(() => {
    if (current.params?.template && layout && sel.units(layout.id).length === 0) applyTemplate(layout.id, current.params.template);
  }, []); // eslint-disable-line

  if (!layout) return <Screen><TopBar title="Layout" onBack={back} /><EmptyState title="Layout not found" /></Screen>;

  const units = sel.units(layout.id);
  const event = sel.event(layout.eventId);
  const tickets = db.tickets.filter((t: any) => t.eventId === layout.eventId && t.status === 'valid');
  const placed = db.placements.filter((p: any) => p.layoutId === layout.id && p.status !== 'released');
  const unassigned = tickets.filter((t: any) => !placed.some((p: any) => p.ticketId === t.id));
  const audit = db.audit.filter((a: any) => a.layoutId === layout.id);
  const cap = units.reduce((s: number, u: any) => s + u.capacity, 0);

  return (
    <Screen>
      <TopBar title={layout.name} subtitle={`${event?.title} · ${placed.length}/${cap} placed`} onBack={back}
        right={<button onClick={() => setHistory(true)} aria-label="History" className="p-2"><History className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone="indigo">{ASSIGN_MODES.find((m) => m.key === layout.mode)?.label}</Badge>
          <Badge tone={layout.locked ? 'slate' : 'green'}>{layout.locked ? 'Layout locked' : 'Open'}</Badge>
          <Badge tone="amber">{unassigned.length} unassigned</Badge>
        </div>

        <Card className="p-3 space-y-3">
          <Select label="Assignment mode" value={layout.mode} onChange={(v) => { updateLayout(layout.id, { mode: v }); toast('Assignment mode updated'); }}
            options={ASSIGN_MODES.map((m) => ({ value: m.key, label: m.label }))} />
          <Toggle checked={layout.locked} onChange={(v) => { updateLayout(layout.id, { locked: v }); toast(v ? 'Layout locked — attendees cannot change placements' : 'Layout unlocked'); }}
            label="Lock entire layout" description="Prevents attendee changes" />
          <Toggle checked={layout.keepTogether} onChange={(v) => updateLayout(layout.id, { keepTogether: v })} label="Keep orders together" description="Auto-assign seats multi-ticket orders side by side" />
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setUnitSheet({ id: null, type: 'Table', label: `Table ${units.length + 1}`, capacity: 8, description: '', priceAdjust: 0, selectable: true, allowedTicketTypes: [], parentUnitId: null })}>Add unit</Button>
          <Button size="sm" variant="secondary" icon={<Wand2 className="w-4 h-4" />} onClick={() => setBulk({ prefix: 'Table', start: units.length + 1, quantity: 10, capacity: 8, type: 'Table' })}>Bulk generate</Button>
          <Button size="sm" variant="secondary" icon={<Users className="w-4 h-4" />} onClick={() => setAuto({ strategy: 'fill', keepTogether: layout.keepTogether })}>Auto assign</Button>
          <Button size="sm" variant="secondary" icon={<Send className="w-4 h-4" />} onClick={() => setCampaign({ open: new Date().toISOString().slice(0, 10), cutoff: '', reminder: 'Weekly', fallback: 'auto' })}>Invite to choose</Button>
          <Button size="sm" variant="outline" icon={<Save className="w-4 h-4" />} onClick={() => setTplName({ name: layout.name })}>Save template</Button>
          <Button size="sm" variant="outline" icon={<Undo2 className="w-4 h-4" />} onClick={() => undoLastPlacementAction(layout.id)}>Undo last</Button>
        </div>

        <Segmented options={['Canvas', 'List', 'Assign']} value={view} onChange={setView} />

        {view === 'Canvas' && (
          <>
            <PlacementCanvas layoutId={layout.id} editable onSelect={(u) => setUnitSheet({ ...u })} />
            <p className="text-[12px] text-slate-500">Drag units to reposition. Tap a unit to edit, lock or delete it.</p>
            <Button variant="outline" size="sm" icon={<Image className="w-4 h-4" />} onClick={() => toast('Floor plan image uploaded (simulated) — units now overlay the plan')}>Upload floor plan background</Button>
          </>
        )}

        {view === 'List' && (
          <div className="space-y-2">
            {units.length === 0 && <EmptyState title="No units yet." body="Add units or bulk generate a full room." action={<Button size="sm" onClick={() => setBulk({ prefix: 'Table', start: 1, quantity: 10, capacity: 8, type: 'Table' })}>Bulk generate</Button>} />}
            {units.map((u: any) => {
              const occ = sel.occupancy(u.id);
              const occupants = db.placements.filter((p: any) => p.unitId === u.id && p.status !== 'released');
              return (
                <Card key={u.id} className="p-4">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{u.label}</p>
                      <p className="text-[12px] text-slate-500">{u.type} · {occ}/{u.capacity} · {u.priceAdjust ? `${u.priceAdjust > 0 ? '+' : ''}${money(u.priceAdjust)}` : 'no price change'}</p>
                      {u.description && <p className="text-[12px] text-slate-500">{u.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {occupants.slice(0, 6).map((o: any) => (
                          <button key={o.id} onClick={() => unassignPlacement(o.id)} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">{o.attendeeName} ×</button>
                        ))}
                        {occupants.length > 6 && <span className="text-[11px] text-slate-400">+{occupants.length - 6} more</span>}
                      </div>
                      {(u.waitlist || []).length > 0 && (
                        <button onClick={() => promoteWaitlist(u.id)} className="mt-2 text-[12px] text-indigo-600 font-medium">Promote next from waitlist ({u.waitlist.length})</button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => setUnitSheet({ ...u })}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => { updateUnit(u.id, { locked: !u.locked }); toast(u.locked ? 'Unit unlocked' : 'Unit locked'); }} icon={u.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}>{u.locked ? 'Unlock' : 'Lock'}</Button>
                      <Button size="sm" variant="outline" onClick={() => setDel(u)} icon={<Trash2 className="w-3.5 h-3.5" />}>Delete</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {view === 'Assign' && (
          <div className="space-y-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search attendees" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <Chip active>{unassigned.length} unassigned</Chip>
              <Chip>{placed.length} placed</Chip>
            </div>
            {tickets.filter((t: any) => !q || t.holderName.toLowerCase().includes(q.toLowerCase())).slice(0, 60).map((t: any) => {
              const p = placed.find((x: any) => x.ticketId === t.id);
              return (
                <Card key={t.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium truncate text-slate-900 dark:text-white">{t.holderName}</p>
                    <p className="text-[12px] text-slate-500">{t.ticketTypeTitle} · {p ? sel.unit(p.unitId)?.label : 'Unassigned'}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {p && <Button size="sm" variant="outline" onClick={() => unassignPlacement(p.id)}>Remove</Button>}
                    <Button size="sm" onClick={() => setAssign(t)}>{p ? 'Move' : 'Assign'}</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Unit editor */}
      <Sheet open={!!unitSheet} onClose={() => setUnitSheet(null)} title={unitSheet?.id ? 'Edit unit' : 'Add unit'}
        footer={<Button full onClick={() => {
          if (unitSheet.id) updateUnit(unitSheet.id, { ...unitSheet, capacity: Number(unitSheet.capacity), priceAdjust: Number(unitSheet.priceAdjust) });
          else addUnit(layout.id, unitSheet);
          setUnitSheet(null); toast('Unit saved');
        }}>Save unit</Button>}>
        {unitSheet && (
          <div className="space-y-3">
            <Field label="Label" value={unitSheet.label} onChange={(v) => setUnitSheet({ ...unitSheet, label: v })} />
            <Select label="Type" value={unitSheet.type} onChange={(v) => setUnitSheet({ ...unitSheet, type: v })} options={[...UNIT_TYPES]} />
            {unitSheet.type === 'Custom' && <Field label="Custom type name" value={unitSheet.customType || ''} onChange={(v) => setUnitSheet({ ...unitSheet, customType: v, type: v || 'Custom' })} />}
            <Field label="Capacity" type="number" value={unitSheet.capacity} onChange={(v) => setUnitSheet({ ...unitSheet, capacity: v })} />
            <Field label="Description" value={unitSheet.description} onChange={(v) => setUnitSheet({ ...unitSheet, description: v })} />
            <Field label="Price adjustment (cents)" type="number" value={unitSheet.priceAdjust} onChange={(v) => setUnitSheet({ ...unitSheet, priceAdjust: v })} hint={`${Number(unitSheet.priceAdjust) > 0 ? 'Surcharge' : Number(unitSheet.priceAdjust) < 0 ? 'Discount' : 'No change'} · ${money(Number(unitSheet.priceAdjust) || 0)}`} />
            <Select label="Nest under (optional)" value={unitSheet.parentUnitId || ''} onChange={(v) => setUnitSheet({ ...unitSheet, parentUnitId: v || null })} options={units.filter((u: any) => u.id !== unitSheet.id).map((u: any) => ({ value: u.id, label: u.label }))} />
            <Select label="Restrict to ticket type" value={(unitSheet.allowedTicketTypes || [])[0] || ''} onChange={(v) => setUnitSheet({ ...unitSheet, allowedTicketTypes: v ? [v] : [] })}
              options={sel.ticketTypes(layout.eventId).map((t: any) => ({ value: t.title, label: t.title }))} />
            <Toggle checked={unitSheet.selectable !== false} onChange={(v) => setUnitSheet({ ...unitSheet, selectable: v })} label="Attendee selectable" />
            <Toggle checked={!!unitSheet.locked} onChange={(v) => setUnitSheet({ ...unitSheet, locked: v })} label="Locked" />
            {unitSheet.id && <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => setUnitSheet({ ...unitSheet, rotation: ((unitSheet.rotation || 0) + 15) % 360 })}>Rotate</Button>
              <Button size="sm" variant="outline" onClick={() => setUnitSheet({ ...unitSheet, width: Math.min(40, (unitSheet.width || 15) + 3), height: Math.min(40, (unitSheet.height || 20) + 3) })}>Bigger</Button>
              <Button size="sm" variant="outline" onClick={() => setUnitSheet({ ...unitSheet, width: Math.max(8, (unitSheet.width || 15) - 3), height: Math.max(8, (unitSheet.height || 20) - 3) })}>Smaller</Button>
            </div>}
          </div>
        )}
      </Sheet>

      {/* Bulk */}
      <Sheet open={!!bulk} onClose={() => setBulk(null)} title="Bulk generate units"
        footer={<Button full onClick={() => { bulkGenerateUnits(layout.id, bulk); setBulk(null); }}>Generate {bulk?.quantity} units</Button>}>
        {bulk && (
          <div className="space-y-3">
            <Select label="Unit type" value={bulk.type} onChange={(v) => setBulk({ ...bulk, type: v, prefix: v })} options={[...UNIT_TYPES]} />
            <Field label="Label prefix" value={bulk.prefix} onChange={(v) => setBulk({ ...bulk, prefix: v })} hint={`Creates ${bulk.prefix} ${bulk.start} … ${bulk.prefix} ${Number(bulk.start) + Number(bulk.quantity) - 1}`} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Start #" type="number" value={bulk.start} onChange={(v) => setBulk({ ...bulk, start: v })} />
              <Field label="Quantity" type="number" value={bulk.quantity} onChange={(v) => setBulk({ ...bulk, quantity: v })} />
              <Field label="Capacity" type="number" value={bulk.capacity} onChange={(v) => setBulk({ ...bulk, capacity: v })} />
            </div>
            <p className="text-[12.5px] text-slate-500">Or apply a saved template:</p>
            <div className="flex flex-wrap gap-2">
              {db.templates.map((t: any) => <Button key={t.id} size="sm" variant="outline" onClick={() => { applyTemplate(layout.id, t.id); setBulk(null); }}>{t.name}</Button>)}
            </div>
          </div>
        )}
      </Sheet>

      {/* Auto assign */}
      <Sheet open={!!auto} onClose={() => setAuto(null)} title="Auto assign attendees"
        footer={<Button full onClick={() => { autoAssign(layout.id, auto.strategy, auto.keepTogether); setAuto(null); }}>Run auto assign</Button>}>
        {auto && (
          <div className="space-y-3">
            <p className="text-[13px] text-slate-500">{unassigned.length} attendees are not yet placed. Locked units are skipped and capacity is never exceeded.</p>
            <Segmented options={['fill', 'even']} value={auto.strategy} onChange={(v) => setAuto({ ...auto, strategy: v })} />
            <p className="text-[12.5px] text-slate-500">{auto.strategy === 'fill' ? 'Fill units in order — fills Table 1, then Table 2…' : 'Distribute evenly — balances numbers across all units.'}</p>
            <Toggle checked={auto.keepTogether} onChange={(v) => setAuto({ ...auto, keepTogether: v })} label="Keep orders together" description="Guests from the same order stay in the same unit when capacity allows" />
          </div>
        )}
      </Sheet>

      {/* Assign attendee */}
      <Sheet open={!!assign} onClose={() => setAssign(null)} title={assign ? `Place ${assign.holderName}` : ''}>
        {assign && <PlacementList layoutId={layout.id} ticketTypeTitle={assign.ticketTypeTitle}
          onSelect={async (u) => { if (await assignPlacement(layout.id, u.id, assign)) { toast(`${assign.holderName} placed at ${u.label}`); setAssign(null); } }} />}

      </Sheet>

      {/* Campaign */}
      <Sheet open={!!campaign} onClose={() => setCampaign(null)} title="Attendee selection campaign"
        footer={<Button full onClick={() => { sendSelectionCampaign(layout.id, campaign); setCampaign(null); }}>Send invitation</Button>}>
        {campaign && (
          <div className="space-y-3">
            <p className="text-[13px] text-slate-500">{unassigned.length} attendees have not chosen a placement yet.</p>
            <Field label="Opens" type="date" value={campaign.open} onChange={(v) => setCampaign({ ...campaign, open: v })} />
            <Field label="Cutoff" type="date" value={campaign.cutoff} onChange={(v) => setCampaign({ ...campaign, cutoff: v })} />
            <Select label="Reminder schedule" value={campaign.reminder} onChange={(v) => setCampaign({ ...campaign, reminder: v })} options={['Daily', 'Weekly', 'Once, 3 days before cutoff']} />
            <Select label="Fallback at cutoff" value={campaign.fallback} onChange={(v) => setCampaign({ ...campaign, fallback: v })} options={[{ value: 'leave', label: 'Leave unassigned' }, { value: 'auto', label: 'Auto assign remaining' }]} />
            <Button variant="outline" full onClick={() => { sendSelectionCampaign(layout.id, campaign); setCampaign(null); }}>Remind everyone who hasn't chosen</Button>
          </div>
        )}
      </Sheet>

      {/* Template */}
      <Sheet open={!!tplName} onClose={() => setTplName(null)} title="Save as template"
        footer={<Button full onClick={() => { saveAsTemplate(layout.id, tplName.name); setTplName(null); }}>Save template</Button>}>
        {tplName && <div className="space-y-3">
          <Field label="Template name" value={tplName.name} onChange={(v) => setTplName({ name: v })} />
          <p className="text-[12.5px] text-slate-500">Saves unit structure, capacities and rules. Attendee assignments are never saved.</p>
        </div>}
      </Sheet>

      {/* History */}
      <Sheet open={history} onClose={() => setHistory(false)} title="Placement history">
        <div className="space-y-2">
          {audit.length === 0 && <EmptyState title="No changes yet" />}
          {audit.map((a: any) => (
            <div key={a.id} className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <p className="text-[13.5px] text-slate-900 dark:text-white">{a.detail}</p>
              <p className="text-[12px] text-slate-500">{a.action} · {a.actor} · {relTime(a.createdAt)}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Confirm open={!!del} title="Delete this unit?" danger confirmLabel="Delete unit"
        body={`This unit contains ${del ? sel.occupancy(del.id) : 0} attendees. Deleting it will move them to Unassigned.`}
        onCancel={() => setDel(null)} onConfirm={() => { deleteUnit(del.id); setDel(null); toast('Unit deleted — occupants moved to Unassigned'); }} />
    </Screen>
  );
};
