import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Field, Select, Badge, Sheet, Toggle, CheckRow, Confirm, EmptyState } from '@/components/kit';
import { uid, money, computeFees, daysFromNow, CATEGORIES } from '@/lib/helpers';
import { IMAGES } from '@/data/seed';
import { Plus, Trash2, ChevronUp, ChevronDown, LayoutGrid } from 'lucide-react';

const STEPS = ['Basics', 'Date & Venue', 'Tickets', 'Placement', 'Options', 'Review'];

const EventEditor: React.FC = () => {
  const { current, back, sel, db, saveEvent, publishEvent, myOrganizerId, toast, go, saveTicketType, deleteTicketType, saveQuestion, deleteQuestion, deleteEvent } = useApp();
  const editingId = current.params?.id;
  const existing = editingId ? sel.event(editingId) : null;
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [ticketSheet, setTicketSheet] = useState<any>(null);
  const [qSheet, setQSheet] = useState<any>(null);
  const [guestSheet, setGuestSheet] = useState<any>(null);
  const [agendaSheet, setAgendaSheet] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [ev, setEv] = useState<any>(() => existing || {
    id: uid('evt'), organizerId: myOrganizerId, title: '', category: '', image: IMAGES.conf[1], gallery: [], capacity: 100, sold: 0,
    status: 'draft', description: '', startDate: daysFromNow(30).slice(0, 10), endDate: daysFromNow(30).slice(0, 10), startTime: '18:00', endTime: '21:00',
    timezone: 'America/Los_Angeles', address: '', city: '', state: '', zip: '', venue: '', externalLink: '', videos: [], socials: {},
    guests: [], agenda: [], createdAt: new Date().toISOString(),
  });

  const tts = db.ticketTypes.filter((t: any) => t.eventId === ev.id).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const questions = db.questions.filter((q: any) => q.eventId === ev.id);
  const layouts = db.layouts.filter((l: any) => l.eventId === ev.id);

  const set = (k: string, v: any) => setEv((s: any) => ({ ...s, [k]: v }));

  // autosave draft after each step change
  useEffect(() => { if (ev.title) { saveEvent({ ...ev, startDate: new Date(ev.startDate).toISOString(), endDate: new Date(ev.endDate).toISOString() }); } }, [step]); // eslint-disable-line

  const validateStep = () => {
    const e: any = {};
    if (step === 0) {
      if (!ev.title.trim()) e.title = 'Event title is required';
      if (!ev.category) e.category = 'Choose a category';
      if (!ev.capacity || Number(ev.capacity) < 1) e.capacity = 'Capacity must be at least 1';
      if (!ev.description.trim()) e.description = 'Add a short description';
    }
    if (step === 1) {
      if (!ev.startDate) e.startDate = 'Required';
      if (!ev.address.trim()) e.address = 'Required';
      if (!ev.city.trim()) e.city = 'Required';
    }
    if (step === 2 && tts.length === 0) e.tickets = 'Add at least one ticket type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) { setStep(step + 1); saveEvent({ ...ev, startDate: new Date(ev.startDate).toISOString(), endDate: new Date(ev.endDate).toISOString() }); toast('Draft saved', 'info'); }
  };

  const publish = () => {
    if (!validateStep()) return;
    saveEvent({ ...ev, status: 'published', startDate: new Date(ev.startDate).toISOString(), endDate: new Date(ev.endDate).toISOString() });
    publishEvent(ev.id);
    go('org-layouts', { eventId: ev.id });
  };

  return (
    <Screen>
      <TopBar title={existing ? 'Edit event' : 'Create event'} subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`} onBack={back}
        right={<button onClick={() => { saveEvent({ ...ev, startDate: new Date(ev.startDate).toISOString(), endDate: new Date(ev.endDate).toISOString() }); toast('Draft saved'); }} className="text-[13px] font-semibold text-indigo-600 px-2">Save draft</button>} />

      <div className="px-4 pt-3">
        <div className="flex gap-1">
          {STEPS.map((s, i) => <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />)}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {step === 0 && (
          <Card className="p-4 space-y-3">
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Event photo</p>
            <img src={ev.image} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[...IMAGES.conf, ...IMAGES.music, ...IMAGES.community].map((img) => (
                <button key={img} onClick={() => set('image', img)} className={`shrink-0 ${ev.image === img ? 'ring-2 ring-indigo-600 rounded-lg' : ''}`}>
                  <img src={img} alt="" className="w-20 h-14 object-cover rounded-lg" />
                </button>
              ))}
            </div>
            <Field label="Event title" value={ev.title} onChange={(v) => set('title', v)} error={errors.title} required />
            <Select label="Category" value={ev.category} onChange={(v) => set('category', v)} options={[...CATEGORIES]} error={errors.category} required />
            <Field label="Total capacity" type="number" value={ev.capacity} onChange={(v) => set('capacity', Number(v))} error={errors.capacity} required />
            <Field label="About this event" multiline value={ev.description} onChange={(v) => set('description', v)} error={errors.description} required />
            <Field label="External link" value={ev.externalLink} onChange={(v) => set('externalLink', v)} placeholder="https://" />
            <Field label="YouTube links (comma separated)" value={(ev.videos || []).join(', ')} onChange={(v) => set('videos', v.split(',').map((s) => s.trim()).filter(Boolean))} />
            <Field label="Instagram" value={ev.socials?.instagram || ''} onChange={(v) => set('socials', { ...ev.socials, instagram: v })} />
            <Field label="Facebook" value={ev.socials?.facebook || ''} onChange={(v) => set('socials', { ...ev.socials, facebook: v })} />
          </Card>
        )}

        {step === 1 && (
          <>
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" type="date" value={String(ev.startDate).slice(0, 10)} onChange={(v) => set('startDate', v)} error={errors.startDate} required />
                <Field label="End date" type="date" value={String(ev.endDate).slice(0, 10)} onChange={(v) => set('endDate', v)} />
                <Field label="Start time" type="time" value={ev.startTime} onChange={(v) => set('startTime', v)} />
                <Field label="End time" type="time" value={ev.endTime} onChange={(v) => set('endTime', v)} />
              </div>
              <Select label="Timezone" value={ev.timezone} onChange={(v) => set('timezone', v)}
                options={['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'Europe/London', 'Africa/Lagos']} />
              <Field label="Venue name" value={ev.venue} onChange={(v) => set('venue', v)} />
              <Field label="Address" value={ev.address} onChange={(v) => set('address', v)} error={errors.address} required />
              <div className="grid grid-cols-3 gap-3">
                <Field label="City" value={ev.city} onChange={(v) => set('city', v)} error={errors.city} required />
                <Field label="State" value={ev.state} onChange={(v) => set('state', v)} />
                <Field label="ZIP" value={ev.zip} onChange={(v) => set('zip', v)} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Featured guests</p>
                <Button size="sm" variant="ghost" icon={<Plus className="w-4 h-4" />} onClick={() => setGuestSheet({ id: uid('g'), name: '', about: '', social: '', photo: '' })}>Add</Button>
              </div>
              {(ev.guests || []).length === 0 && <p className="text-[12.5px] text-slate-500">No guests added yet.</p>}
              {(ev.guests || []).map((g: any) => (
                <div key={g.id} className="flex items-center gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1"><p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{g.name}</p><p className="text-[12px] text-slate-500 line-clamp-1">{g.about}</p></div>
                  <button onClick={() => set('guests', ev.guests.filter((x: any) => x.id !== g.id))} className="p-2 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Agenda</p>
                <Button size="sm" variant="ghost" icon={<Plus className="w-4 h-4" />} onClick={() => setAgendaSheet({ id: uid('ag'), title: '', guest: '', startDate: ev.startDate, endDate: ev.endDate, startTime: '09:00', endTime: '10:00', description: '' })}>Add</Button>
              </div>
              {(ev.agenda || []).length === 0 && <p className="text-[12.5px] text-slate-500">No agenda items yet.</p>}
              {(ev.agenda || []).map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1"><p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{a.title}</p><p className="text-[12px] text-slate-500">{a.startTime}–{a.endTime} · {a.guest}</p></div>
                  <button onClick={() => set('agenda', ev.agenda.filter((x: any) => x.id !== a.id))} className="p-2 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            {errors.tickets && <p className="text-[13px] text-rose-600">{errors.tickets}</p>}
            {tts.map((t: any, i: number) => {
              const fees = computeFees(t.price, { absorbFees: t.absorbFees });
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[12.5px] text-slate-500">{t.price === 0 ? 'Free' : money(t.price)} · {t.quantity} available</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <Badge tone={t.available ? 'green' : 'slate'}>{t.available ? 'On sale' : 'Not available'}</Badge>
                        {t.absorbFees && <Badge tone="blue">Fees absorbed</Badge>}
                        {t.price > 0 && <Badge tone="slate">Guest pays {money(t.price + (t.absorbFees ? 0 : fees.adminFee + fees.paymentFee))}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button disabled={i === 0} onClick={() => { saveTicketType({ ...t, sortOrder: t.sortOrder - 1 }); saveTicketType({ ...tts[i - 1], sortOrder: tts[i - 1].sortOrder + 1 }); }} className="p-1 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <button disabled={i === tts.length - 1} onClick={() => { saveTicketType({ ...t, sortOrder: t.sortOrder + 1 }); saveTicketType({ ...tts[i + 1], sortOrder: tts[i + 1].sortOrder - 1 }); }} className="p-1 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setTicketSheet(t)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => { deleteTicketType(t.id); toast('Ticket type removed'); }}>Delete</Button>
                  </div>
                </Card>
              );
            })}
            <Button full variant="secondary" icon={<Plus className="w-4 h-4" />}
              onClick={() => setTicketSheet({ id: uid('tt'), eventId: ev.id, title: '', price: 0, quantity: 50, sold: 0, available: true, absorbFees: false, salesStart: new Date().toISOString().slice(0, 10), salesStartTime: '09:00', deadline: String(ev.startDate).slice(0, 10), deadlineTime: '23:59', description: '', sortOrder: tts.length })}>
              Add ticket type
            </Button>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Ticket questions</p>
                <Button size="sm" variant="ghost" icon={<Plus className="w-4 h-4" />} onClick={() => setQSheet({ id: uid('q'), eventId: ev.id, type: 'Text', question: '', options: [], required: false, applyToAll: false })}>Add</Button>
              </div>
              {questions.length === 0 && <p className="text-[12.5px] text-slate-500">No questions. Attendees will only provide name and email.</p>}
              {questions.map((q: any) => (
                <div key={q.id} className="flex items-center gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-slate-900 dark:text-white truncate">{q.question}</p>
                    <p className="text-[12px] text-slate-500">{q.type}{q.required ? ' · required' : ''}{q.applyToAll ? ' · applies to all tickets' : ''}</p>
                  </div>
                  <button onClick={() => setQSheet(q)} className="text-[12.5px] text-indigo-600 font-medium px-2">Edit</button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </Card>
          </>
        )}

        {step === 3 && (
          <Card className="p-4">
            <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Seating & placement</p>
            <p className="text-[12.5px] text-slate-500 mt-1">Create tables, rooms, sections or groups for this event. You can also do this after publishing.</p>
            <div className="mt-3 space-y-2">
              {layouts.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div><p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{l.name}</p><p className="text-[12px] text-slate-500">{sel.units(l.id).length} units</p></div>
                  <Button size="sm" variant="secondary" onClick={() => go('org-layout', { layoutId: l.id })}>Open</Button>
                </div>
              ))}
              {layouts.length === 0 && <EmptyState title="No layouts yet" body="Add a dinner seating chart, breakout rooms or bus assignments." icon={<LayoutGrid className="w-6 h-6" />} />}
            </div>
            <Button full variant="secondary" className="mt-3" onClick={() => { saveEvent({ ...ev, startDate: new Date(ev.startDate).toISOString(), endDate: new Date(ev.endDate).toISOString() }); go('org-layouts', { eventId: ev.id }); }}>Open placement builder</Button>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-4">
            <Toggle checked={ev.status === 'published'} onChange={(v) => set('status', v ? 'published' : 'draft')} label="Publish immediately" description="Draft events are only visible to your team" />
            <Toggle checked={!!ev.allowWaitlist} onChange={(v) => set('allowWaitlist', v)} label="Enable waitlists" description="Let attendees join a waitlist for full placements" />
            <Toggle checked={!!ev.privateEvent} onChange={(v) => set('privateEvent', v)} label="Unlisted event" description="Hide from Explore; shareable by direct link" />
          </Card>
        )}

        {step === 5 && (
          <>
            <Card className="p-4">
              <img src={ev.image} alt="" className="w-full h-36 object-cover rounded-xl" />
              <p className="font-bold text-[17px] mt-3 text-slate-900 dark:text-white">{ev.title || 'Untitled event'}</p>
              <p className="text-[12.5px] text-slate-500">{ev.category} · capacity {ev.capacity}</p>
              <p className="text-[13px] mt-2 text-slate-600 dark:text-slate-300">{String(ev.startDate).slice(0, 10)} {ev.startTime} – {String(ev.endDate).slice(0, 10)} {ev.endTime} ({ev.timezone})</p>
              <p className="text-[13px] text-slate-600 dark:text-slate-300">{[ev.venue, ev.address, ev.city, ev.state, ev.zip].filter(Boolean).join(', ')}</p>
              <div className="mt-3 space-y-1">
                {tts.map((t: any) => <div key={t.id} className="flex justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300">{t.title}</span><span>{t.price === 0 ? 'Free' : money(t.price)} × {t.quantity}</span></div>)}
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <Badge tone="slate">{questions.length} questions</Badge>
                <Badge tone="slate">{layouts.length} layouts</Badge>
                <Badge tone="slate">{(ev.guests || []).length} guests</Badge>
                <Badge tone="slate">{(ev.agenda || []).length} agenda items</Badge>
              </div>
            </Card>
            <Button full size="lg" onClick={publish}>Publish event</Button>
            {existing?.status === 'draft' && <Button full variant="outline" onClick={() => setConfirmDelete(true)}>Delete draft</Button>}
          </>
        )}

        <div className="flex gap-3 pb-6">
          {step > 0 && <Button variant="secondary" full onClick={() => setStep(step - 1)}>Back</Button>}
          {step < STEPS.length - 1 && <Button full onClick={next}>Continue</Button>}
        </div>
      </div>

      {/* Ticket type sheet */}
      <Sheet open={!!ticketSheet} onClose={() => setTicketSheet(null)} title="Ticket type"
        footer={<Button full onClick={() => {
          if (!ticketSheet.title.trim()) { toast('Give the ticket a title', 'error'); return; }
          saveTicketType({ ...ticketSheet, price: Number(ticketSheet.price), quantity: Number(ticketSheet.quantity) });
          setTicketSheet(null); toast('Ticket type saved');
        }}>Save ticket type</Button>}>
        {ticketSheet && (
          <div className="space-y-3">
            <Toggle checked={ticketSheet.available} onChange={(v) => setTicketSheet({ ...ticketSheet, available: v })} label="Available for sale" />
            <Field label="Title" value={ticketSheet.title} onChange={(v) => setTicketSheet({ ...ticketSheet, title: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (cents)" type="number" value={ticketSheet.price} onChange={(v) => setTicketSheet({ ...ticketSheet, price: v })} hint={money(Number(ticketSheet.price) || 0)} />
              <Field label="Quantity" type="number" value={ticketSheet.quantity} onChange={(v) => setTicketSheet({ ...ticketSheet, quantity: v })} />
              <Field label="Sales start" type="date" value={String(ticketSheet.salesStart).slice(0, 10)} onChange={(v) => setTicketSheet({ ...ticketSheet, salesStart: v })} />
              <Field label="Start time" type="time" value={ticketSheet.salesStartTime} onChange={(v) => setTicketSheet({ ...ticketSheet, salesStartTime: v })} />
              <Field label="Registration deadline" type="date" value={String(ticketSheet.deadline).slice(0, 10)} onChange={(v) => setTicketSheet({ ...ticketSheet, deadline: v })} />
              <Field label="End time" type="time" value={ticketSheet.deadlineTime} onChange={(v) => setTicketSheet({ ...ticketSheet, deadlineTime: v })} />
            </div>
            <Toggle checked={ticketSheet.absorbFees} onChange={(v) => setTicketSheet({ ...ticketSheet, absorbFees: v })} label="Absorb fees" description="You pay the service fees instead of the attendee" />
            <Field label="Description" multiline value={ticketSheet.description} onChange={(v) => setTicketSheet({ ...ticketSheet, description: v })} />
            <Card className="p-3 text-[12.5px] space-y-1 bg-slate-50 dark:bg-slate-800">
              {(() => { const f = computeFees(Number(ticketSheet.price) || 0, { absorbFees: ticketSheet.absorbFees }); return (
                <>
                  <div className="flex justify-between"><span>Ticket price</span><span>{money(Number(ticketSheet.price) || 0)}</span></div>
                  <div className="flex justify-between"><span>Admin fee 3.5%</span><span>{money(f.adminFee)}</span></div>
                  <div className="flex justify-between"><span>Processing 2.9% + $0.30</span><span>{money(f.paymentFee)}</span></div>
                  <div className="flex justify-between font-semibold"><span>{ticketSheet.absorbFees ? 'Attendee pays' : 'Attendee pays'}</span><span>{money(f.total)}</span></div>
                  <div className="flex justify-between font-semibold text-emerald-600"><span>You receive</span><span>{money(ticketSheet.absorbFees ? Math.max(0, (Number(ticketSheet.price) || 0) - computeFees(Number(ticketSheet.price) || 0).adminFee - computeFees(Number(ticketSheet.price) || 0).paymentFee) : Number(ticketSheet.price) || 0)}</span></div>
                </>
              ); })()}
            </Card>
          </div>
        )}
      </Sheet>

      {/* Question sheet */}
      <Sheet open={!!qSheet} onClose={() => setQSheet(null)} title="Ticket question"
        footer={<Button full onClick={() => { if (!qSheet.question.trim()) { toast('Enter a question', 'error'); return; } saveQuestion(qSheet); setQSheet(null); toast('Question saved'); }}>Save question</Button>}>
        {qSheet && (
          <div className="space-y-3">
            <Select label="Type" value={qSheet.type} onChange={(v) => setQSheet({ ...qSheet, type: v })} options={['Text', 'Multiple Choice', 'Dropdown']} />
            <Field label="Question" value={qSheet.question} onChange={(v) => setQSheet({ ...qSheet, question: v })} required />
            {qSheet.type !== 'Text' && <Field label="Options (comma separated)" value={(qSheet.options || []).join(', ')} onChange={(v) => setQSheet({ ...qSheet, options: v.split(',').map((s: string) => s.trim()).filter(Boolean) })} />}
            <CheckRow checked={qSheet.required} onChange={(v) => setQSheet({ ...qSheet, required: v })} label="Required" />
            <CheckRow checked={qSheet.applyToAll} onChange={(v) => setQSheet({ ...qSheet, applyToAll: v })} label="Apply answer to all tickets in the order" />
          </div>
        )}
      </Sheet>

      {/* Guest sheet */}
      <Sheet open={!!guestSheet} onClose={() => setGuestSheet(null)} title="Featured guest"
        footer={<Button full onClick={() => {
          if (!guestSheet.name.trim()) { toast('Enter a name', 'error'); return; }
          set('guests', [...(ev.guests || []), { ...guestSheet, photo: guestSheet.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestSheet.name)}&backgroundColor=4f46e5` }]);
          setGuestSheet(null);
        }}>Add guest</Button>}>
        {guestSheet && (
          <div className="space-y-3">
            <Field label="Name" value={guestSheet.name} onChange={(v) => setGuestSheet({ ...guestSheet, name: v })} required />
            <Field label="About" multiline value={guestSheet.about} onChange={(v) => setGuestSheet({ ...guestSheet, about: v })} />
            <Field label="Social link" value={guestSheet.social} onChange={(v) => setGuestSheet({ ...guestSheet, social: v })} />
          </div>
        )}
      </Sheet>

      {/* Agenda sheet */}
      <Sheet open={!!agendaSheet} onClose={() => setAgendaSheet(null)} title="Agenda item"
        footer={<Button full onClick={() => { if (!agendaSheet.title.trim()) { toast('Enter a title', 'error'); return; } set('agenda', [...(ev.agenda || []), agendaSheet]); setAgendaSheet(null); }}>Add item</Button>}>
        {agendaSheet && (
          <div className="space-y-3">
            <Field label="Title" value={agendaSheet.title} onChange={(v) => setAgendaSheet({ ...agendaSheet, title: v })} required />
            <Select label="Featured guest / speaker" value={agendaSheet.guest} onChange={(v) => setAgendaSheet({ ...agendaSheet, guest: v })} options={[...(ev.guests || []).map((g: any) => g.name), 'Multiple', 'TBA']} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" type="date" value={String(agendaSheet.startDate).slice(0, 10)} onChange={(v) => setAgendaSheet({ ...agendaSheet, startDate: v })} />
              <Field label="End date" type="date" value={String(agendaSheet.endDate).slice(0, 10)} onChange={(v) => setAgendaSheet({ ...agendaSheet, endDate: v })} />
              <Field label="Start time" type="time" value={agendaSheet.startTime} onChange={(v) => setAgendaSheet({ ...agendaSheet, startTime: v })} />
              <Field label="End time" type="time" value={agendaSheet.endTime} onChange={(v) => setAgendaSheet({ ...agendaSheet, endTime: v })} />
            </div>
            <Field label="Description" multiline value={agendaSheet.description} onChange={(v) => setAgendaSheet({ ...agendaSheet, description: v })} />
          </div>
        )}
      </Sheet>

      <Confirm open={confirmDelete} title="Delete draft?" danger confirmLabel="Delete draft" body="This draft event will be permanently removed."
        onCancel={() => setConfirmDelete(false)} onConfirm={() => { deleteEvent(ev.id); setConfirmDelete(false); back(); }} />
    </Screen>
  );
};

export default EventEditor;
