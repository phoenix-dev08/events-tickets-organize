import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Button, Card, Badge, Section, Stepper, Sheet, Field, EmptyState } from '@/components/kit';
import EventCard from '@/components/EventCard';
import { money, fmtDate, fmtTime, isFuture, computeFees } from '@/lib/helpers';
import { MapPin, CalendarPlus, Share2, Navigation, Youtube, Link2, Heart, Mail, Users, Clock, Info } from 'lucide-react';

const EventDetail: React.FC = () => {
  const { current, back, sel, db, addToCart, cart, go, toggleFollow, toast, user, session, createEnquiry, track } = useApp();
  const event = sel.event(current.params?.id);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [contact, setContact] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<any>({});
  const [share, setShare] = useState(false);

  React.useEffect(() => { if (event) track('event_view', { eventId: event.id }); }, [event?.id]); // eslint-disable-line

  if (!event) return <Screen><TopBar title="Event" onBack={back} /><EmptyState title="Event not found" body="It may have been removed by the organizer." /></Screen>;

  const org = sel.organizer(event.organizerId);
  const tts = sel.ticketTypes(event.id);
  const layouts = sel.layouts(event.id);
  const following = sel.isFollowing(event.organizerId);
  const total = Object.values(qty).reduce((s, n) => s + n, 0);
  const subtotal = tts.reduce((s: number, t: any) => s + (qty[t.id] || 0) * t.price, 0);
  const past = !isFuture(event.startDate);
  const related = db.events.filter((e: any) => e.id !== event.id && e.category === event.category && e.status === 'published').slice(0, 4);
  const address = [event.address, event.city, event.state, event.zip].filter(Boolean).join(', ');

  const proceed = () => {
    if (!session) { go('auth'); return; }
    if (cart.length && cart[0].eventId !== event.id) { toast('Your cart contains tickets for another event. Clearing it first.', 'info'); }
    tts.forEach((t: any) => { if (qty[t.id]) addToCart(event.id, t.id, qty[t.id]); });
    track('ticket_selected', { eventId: event.id, count: total });
    go('cart');
  };

  const submitEnquiry = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.message.trim().length < 5) e.message = 'Tell the organizer a little more';
    setErrors(e);
    if (Object.keys(e).length) return;
    createEnquiry({ ...form, eventId: event.id });
    setContact(false); setForm({ name: '', email: '', message: '' }); setErrors({});
  };

  return (
    <Screen>
      <div className="relative">
        <img src={event.image} alt={event.title} className="w-full h-64 sm:h-80 object-cover" />
        <button onClick={back} aria-label="Back" className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/45 text-white grid place-items-center backdrop-blur">←</button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setShare(true)} aria-label="Share" className="w-10 h-10 rounded-full bg-black/45 text-white grid place-items-center backdrop-blur"><Share2 className="w-4 h-4" /></button>
          <button onClick={() => toggleFollow(event.organizerId)} aria-label="Follow organizer" className="w-10 h-10 rounded-full bg-black/45 text-white grid place-items-center backdrop-blur">
            <Heart className={`w-4 h-4 ${following ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 relative">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-2">
            <Badge tone="indigo">{event.category}</Badge>
            {past ? <Badge tone="slate">Past event</Badge> : event.sold >= event.capacity ? <Badge tone="rose">Sold out</Badge> : <Badge tone="green">On sale</Badge>}
          </div>
          <h1 className="text-[21px] font-bold mt-2 leading-tight text-slate-900 dark:text-white">{event.title}</h1>
          <div className="mt-3 space-y-2 text-[13.5px] text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600" />{fmtDate(event.startDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {fmtTime(event.startTime)} – {fmtTime(event.endTime)}</p>
            <p className="flex items-center gap-2 pl-6 text-[12.5px] text-slate-500">Ends {fmtDate(event.endDate)} · Timezone {event.timezone}</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-600" />{event.venue ? `${event.venue} · ` : ''}{address}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button size="sm" variant="secondary" onClick={() => toast('Added to your calendar (simulated .ics)')} icon={<CalendarPlus className="w-4 h-4" />}>Calendar</Button>
            <Button size="sm" variant="secondary" onClick={() => { window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank'); }} icon={<Navigation className="w-4 h-4" />}>Directions</Button>
            <Button size="sm" variant="secondary" onClick={() => setShare(true)} icon={<Share2 className="w-4 h-4" />}>Share</Button>
          </div>
        </Card>
      </div>

      {/* organizer */}
      <Section>
        <Card className="p-4 flex items-center gap-3">
          <img src={org?.avatar} alt={org?.name} className="w-11 h-11 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white truncate">{org?.name}</p>
            <p className="text-[12px] text-slate-500">{sel.followerCount(event.organizerId)} followers</p>
          </div>
          <Button size="sm" variant={following ? 'secondary' : 'primary'} onClick={() => toggleFollow(event.organizerId)}>{following ? 'Following' : 'Follow'}</Button>
        </Card>
        <Button variant="outline" full className="mt-2" icon={<Mail className="w-4 h-4" />} onClick={() => { setForm({ name: user?.name || '', email: user?.email || '', message: '' }); setContact(true); }}>Contact organizer</Button>
      </Section>

      {/* tickets */}
      <Section title="Tickets">
        <div className="space-y-3">
          {tts.map((t: any) => {
            const left = sel.ticketAvailable(t);
            const closed = !t.available || left <= 0 || past || !isFuture(t.deadline);
            const fees = computeFees(t.price, { absorbFees: t.absorbFees });
            return (
              <Card key={t.id} className="p-4">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{t.title}</p>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {closed ? <Badge tone="rose">{left <= 0 ? 'Sold out' : 'Sales closed'}</Badge> : <Badge tone="green">{left} available</Badge>}
                      <Badge tone="slate">Sales end {fmtDate(t.deadline)}</Badge>
                      {t.absorbFees && <Badge tone="blue">Fees absorbed</Badge>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[16px] text-slate-900 dark:text-white">{t.price === 0 ? 'Free' : money(t.price)}</p>
                    {!t.absorbFees && t.price > 0 && <p className="text-[11px] text-slate-500">+{money(fees.adminFee + fees.paymentFee)} fees</p>}
                    <div className="mt-2"><Stepper value={qty[t.id] || 0} max={closed ? 0 : Math.min(10, left)} onChange={(v) => setQty((s) => ({ ...s, [t.id]: v }))} label={t.title} /></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card className="p-4 mt-3">
          <div className="flex justify-between text-[14px]"><span className="text-slate-600 dark:text-slate-300">Subtotal</span><span className="font-bold text-slate-900 dark:text-white">{money(subtotal)}</span></div>
          <Button full size="lg" className="mt-3" disabled={total === 0} onClick={proceed}>Buy now{total > 0 ? ` · ${total} ticket${total > 1 ? 's' : ''}` : ''}</Button>
          {total === 0 && <p className="text-[12.5px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1"><Info className="w-3.5 h-3.5" />Select at least one ticket to continue.</p>}
        </Card>
      </Section>

      {/* seating preview */}
      {layouts.length > 0 && (
        <Section title="Seating & placement">
          <div className="space-y-2">
            {layouts.map((l: any) => {
              const units = sel.units(l.id);
              const cap = units.reduce((s: number, u: any) => s + u.capacity, 0);
              const occ = units.reduce((s: number, u: any) => s + sel.occupancy(u.id), 0);
              return (
                <Card key={l.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{l.name}</p>
                      <p className="text-[12px] text-slate-500">{units.length} {units[0]?.type || 'unit'}s · {occ}/{cap} filled</p>
                    </div>
                    <Badge tone={l.mode === 'organizer' ? 'slate' : 'indigo'}>
                      {l.mode === 'organizer' ? 'Organizer assigns' : l.mode === 'checkout' ? 'Choose at checkout' : l.mode === 'post' ? 'Choose after purchase' : 'Hybrid'}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {units.slice(0, 12).map((u: any) => {
                      const o = sel.occupancy(u.id);
                      const tone = u.locked ? 'bg-slate-300 dark:bg-slate-700' : o >= u.capacity ? 'bg-rose-400' : o / u.capacity > 0.75 ? 'bg-amber-400' : 'bg-emerald-400';
                      return <span key={u.id} title={`${u.label} ${o}/${u.capacity}`} className={`w-7 h-7 rounded-md ${tone} text-[9px] text-white grid place-items-center font-bold`}>{u.label.replace(/[^0-9A-Z]/gi, '').slice(-2)}</span>;
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="About this event">
        <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{event.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {event.externalLink && <Button size="sm" variant="outline" icon={<Link2 className="w-4 h-4" />} onClick={() => window.open(event.externalLink, '_blank')}>Event website</Button>}
          {(event.videos || []).map((v: string) => <Button key={v} size="sm" variant="outline" icon={<Youtube className="w-4 h-4" />} onClick={() => toast('Opening video (demo link)', 'info')}>Watch trailer</Button>)}
          {Object.entries(event.socials || {}).map(([k, v]: any) => <Button key={k} size="sm" variant="outline" onClick={() => toast(`${k}: ${v}`, 'info')}>{k}</Button>)}
        </div>
      </Section>

      {(event.guests || []).length > 0 && (
        <Section title="Featured guests">
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
            {event.guests.map((g: any) => (
              <Card key={g.id} className="p-4 w-56 shrink-0 text-center">
                <img src={g.photo} alt={g.name} className="w-14 h-14 rounded-full mx-auto" />
                <p className="font-semibold text-[13.5px] mt-2 text-slate-900 dark:text-white">{g.name}</p>
                <p className="text-[12px] text-slate-500 mt-1 line-clamp-3">{g.about}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {(event.agenda || []).length > 0 && (
        <Section title="Agenda">
          <div className="space-y-2">
            {event.agenda.map((a: any) => (
              <Card key={a.id} className="p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-[12.5px] text-slate-500">{a.guest}</p>
                    <p className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1">{a.description}</p>
                  </div>
                  <span className="text-[12px] text-slate-500 whitespace-nowrap">{fmtTime(a.startTime)}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section title="Related events">
          <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
            {related.map((e: any) => <EventCard key={e.id} event={e} variant="mini" />)}
          </div>
        </Section>
      )}

      <Sheet open={contact} onClose={() => setContact(false)} title="Contact organizer"
        footer={<Button full onClick={submitEnquiry}>Send message</Button>}>
        <div className="space-y-4">
          <p className="text-[13px] text-slate-500">Your message goes to {org?.name} ({org?.email}).</p>
          <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} required />
          <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} error={errors.email} required />
          <Field label="Message" multiline value={form.message} onChange={(v) => setForm((f) => ({ ...f, message: v }))} error={errors.message} required />
        </div>
      </Sheet>

      <Sheet open={share} onClose={() => setShare(false)} title="Share this event">
        <div className="grid grid-cols-4 gap-3">
          {['Messages', 'WhatsApp', 'Email', 'Copy link'].map((s) => (
            <button key={s} onClick={() => { setShare(false); toast(s === 'Copy link' ? 'Link copied: redeemedevents.app/e/' + event.id : `Shared via ${s}`); }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[12px] font-medium">{s}</button>
          ))}
        </div>
        <p className="text-[12px] text-slate-500 mt-4">Native share sheets aren't available in this preview, so sharing is simulated.</p>
      </Sheet>
    </Screen>
  );
};

export default EventDetail;
