import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Segmented, EmptyState, Sheet, Field, QRCode, Confirm } from '@/components/kit';
import { PlacementChooser } from '@/components/PlacementPicker';
import { money, fmtDate, fmtTime, isFuture } from '@/lib/helpers';
import { Ticket as TicketIcon, Wallet, Sun, Share2, UserCog, ArrowLeftRight, MapPin } from 'lucide-react';

export const TicketsList: React.FC = () => {
  const { sel, go, session, db } = useApp();
  const [tab, setTab] = useState('Upcoming');
  if (!session) return <Screen><TopBar title="My Tickets" sticky={false} /><EmptyState title="Sign in to see your tickets" action={<Button onClick={() => go('auth')}>Sign in</Button>} icon={<TicketIcon className="w-6 h-6" />} /></Screen>;
  const mine = sel.myTickets();
  const list = mine.filter((t: any) => {
    const ev = sel.event(t.eventId);
    return tab === 'Upcoming' ? isFuture(ev?.startDate || '') : !isFuture(ev?.startDate || '');
  });

  return (
    <Screen>
      <TopBar title="My Tickets" subtitle={`${mine.length} total`} />
      <div className="px-4 pt-4"><Segmented options={['Upcoming', 'Past']} value={tab} onChange={setTab} /></div>
      <div className="px-4 mt-4 space-y-3">
        {list.length === 0 && <EmptyState title={`No ${tab.toLowerCase()} tickets`} body="When you buy tickets they'll appear here instantly." icon={<TicketIcon className="w-6 h-6" />} action={<Button onClick={() => go('browse')}>Browse events</Button>} />}
        {list.map((t: any) => {
          const ev = sel.event(t.eventId);
          const places = sel.placementsForTicket(t.id);
          const needsChoice = db.layouts.filter((l: any) => l.eventId === t.eventId && ['post', 'hybrid'].includes(l.mode) && !l.locked)
            .filter((l: any) => !places.some((p: any) => p.layoutId === l.id));
          return (
            <Card key={t.id} className="overflow-hidden" onClick={() => go('ticket', { id: t.id })}>
              <div className="flex">
                <img src={ev?.image} alt={ev?.title} className="w-24 h-full object-cover" />
                <div className="p-4 flex-1 min-w-0">
                  <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white truncate">{ev?.title}</p>
                  <p className="text-[12.5px] text-slate-500">{fmtDate(ev?.startDate)} · {fmtTime(ev?.startTime)}</p>
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1">{t.holderName} · {t.ticketTypeTitle}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge tone={t.status === 'valid' ? 'green' : 'rose'}>{t.status === 'valid' ? 'Valid' : 'Refunded'}</Badge>
                    {t.checkInStatus !== 'Not Checked In' && <Badge tone="blue">{t.checkInStatus}</Badge>}
                    {places.map((p: any) => <Badge key={p.id} tone="indigo">{sel.unit(p.unitId)?.label}</Badge>)}
                    {needsChoice.length > 0 && <Badge tone="amber">Choose your {needsChoice[0].name.toLowerCase()}</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
};

export const TicketDetail: React.FC = () => {
  const { current, back, db, sel, toast, updateTicket, go, holdSeconds, assignPlacement, joinWaitlist, user } = useApp();
  const ticket = db.tickets.find((t: any) => t.id === current.params?.id);
  const [bright, setBright] = useState(false);
  const [edit, setEdit] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [pick, setPick] = useState<any>(null);
  const [form, setForm] = useState({ name: ticket?.holderName || '', email: ticket?.holderEmail || '' });
  const [xfer, setXfer] = useState({ name: '', email: '' });
  const [share, setShare] = useState(false);

  if (!ticket) return <Screen><TopBar title="Ticket" onBack={back} /><EmptyState title="Ticket not found" /></Screen>;
  const ev = sel.event(ticket.eventId);
  const places = sel.placementsForTicket(ticket.id);
  const layouts = db.layouts.filter((l: any) => l.eventId === ticket.eventId);
  const choosable = layouts.filter((l: any) => ['post', 'hybrid'].includes(l.mode) && !l.locked && !places.some((p: any) => p.layoutId === l.id));

  return (
    <Screen className={bright ? 'bg-white' : ''}>
      <TopBar title="Your ticket" subtitle={ev?.title} onBack={back}
        right={<button onClick={() => { setBright(!bright); toast(bright ? 'Brightness restored' : 'Screen brightness boosted for scanning'); }} aria-label="Boost brightness" className="p-2"><Sun className={`w-5 h-5 ${bright ? 'text-amber-500' : ''}`} /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <Card className={`p-5 text-center ${bright ? 'bg-white' : ''}`}>
          <Badge tone={ticket.status === 'valid' ? 'green' : 'rose'}>{ticket.status === 'valid' ? 'Valid ticket' : 'Refunded — not valid for entry'}</Badge>
          <h2 className="text-[18px] font-bold mt-3 text-slate-900 dark:text-white">{ev?.title}</h2>
          <p className="text-[13px] text-slate-500">{fmtDate(ev?.startDate)} · {fmtTime(ev?.startTime)} · {ev?.timezone}</p>
          <div className="my-5 flex justify-center"><QRCode value={ticket.code} size={210} /></div>
          <p className="font-mono text-[13px] tracking-widest text-slate-700 dark:text-slate-200">{ticket.code}</p>
          <p className="text-[12px] text-slate-500 mt-1">Ticket ID {ticket.id.slice(-8).toUpperCase()}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-left text-[13px]">
            <Info label="Holder" value={ticket.holderName} />
            <Info label="Email" value={ticket.holderEmail} />
            <Info label="Type" value={ticket.ticketTypeTitle} />
            <Info label="Price" value={ticket.price === 0 ? 'Free' : money(ticket.price)} />
            <Info label="Check-in" value={ticket.checkInStatus} />
            <Info label="Venue" value={`${ev?.venue}, ${ev?.city}`} />
          </div>
          {Object.keys(ticket.answers || {}).length > 0 && (
            <div className="mt-3 text-left text-[12.5px] text-slate-500">
              {Object.entries(ticket.answers).map(([qid, v]: any) => {
                const q = db.questions.find((x: any) => x.id === qid);
                return <p key={qid}>{q?.question}: <span className="text-slate-700 dark:text-slate-200">{v}</span></p>;
              })}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="font-semibold text-[14px] mb-2 flex items-center gap-2 text-slate-900 dark:text-white"><MapPin className="w-4 h-4" />Your placement</p>
          {places.length === 0 && choosable.length === 0 && <p className="text-[13px] text-slate-500">No placement assigned for this event.</p>}
          {places.map((p: any) => {
            const u = sel.unit(p.unitId);
            const l = layouts.find((x: any) => x.id === p.layoutId);
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div><p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{l?.name}</p><p className="text-[12.5px] text-slate-500">{u?.label} · {u?.type}</p></div>
                {l?.locked ? <Badge tone="slate">Locked by organizer</Badge> : <Badge tone="green">Confirmed</Badge>}
              </div>
            );
          })}
          {choosable.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between py-2">
              <div><p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{l.name}</p><p className="text-[12.5px] text-amber-600">Selection open</p></div>
              <Button size="sm" onClick={() => setPick(l)}>Choose your {l.name.toLowerCase().includes('room') ? 'room' : 'table'}</Button>
            </div>
          ))}
          {layouts.some((l: any) => l.locked) && <p className="text-[12px] text-slate-500 mt-2">Some layouts are locked — contact the organizer to change your placement.</p>}
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => go('wallet', { id: ticket.id })} icon={<Wallet className="w-4 h-4" />}>Wallet pass</Button>
          <Button variant="secondary" onClick={() => setEdit(true)} icon={<UserCog className="w-4 h-4" />}>Edit holder</Button>
          <Button variant="secondary" onClick={() => setTransfer(true)} icon={<ArrowLeftRight className="w-4 h-4" />}>Transfer</Button>
          <Button variant="secondary" onClick={() => setShare(true)} icon={<Share2 className="w-4 h-4" />}>Share</Button>
        </div>
        <p className="text-[12px] text-slate-400 text-center pb-4">Ticket cached on device — viewable in offline mode.</p>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Edit ticket holder"
        footer={<Button full onClick={() => { updateTicket(ticket.id, { holderName: form.name, holderEmail: form.email }); setEdit(false); toast('Ticket holder updated'); }}>Save changes</Button>}>
        <div className="space-y-3">
          <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        </div>
      </Sheet>

      <Sheet open={transfer} onClose={() => setTransfer(false)} title="Transfer ticket"
        footer={<Button full disabled={!xfer.email.includes('@')} onClick={() => {
          updateTicket(ticket.id, { holderName: xfer.name || xfer.email, holderEmail: xfer.email });
          setTransfer(false); toast('Ticket transferred — the new holder has been notified');
        }}>Transfer ticket</Button>}>
        <div className="space-y-3">
          <p className="text-[13px] text-slate-500">The QR code stays the same; the ticket holder record and placement follow the new guest.</p>
          <Field label="Recipient name" value={xfer.name} onChange={(v) => setXfer((f) => ({ ...f, name: v }))} />
          <Field label="Recipient email" value={xfer.email} onChange={(v) => setXfer((f) => ({ ...f, email: v }))} />
        </div>
      </Sheet>

      <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? `Choose your ${pick.name}` : ''}>
        {pick && <PlacementChooser layoutId={pick.id} ticketTypeTitle={ticket.ticketTypeTitle}
          onSelect={async (u) => { if (await assignPlacement(pick.id, u.id, ticket, 'Attendee')) { toast(`You selected ${u.label}`); setPick(null); } }}

          onWaitlist={(u) => { joinWaitlist(u.id, ticket); setPick(null); }} />}
      </Sheet>

      <Sheet open={share} onClose={() => setShare(false)} title="Share ticket">
        <div className="grid grid-cols-3 gap-3">
          {['Messages', 'Email', 'Copy link'].map((s) => (
            <button key={s} onClick={() => { setShare(false); toast(s === 'Copy link' ? 'Ticket link copied' : `Shared via ${s}`); }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[12px] font-medium">{s}</button>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
};

export const WalletPass: React.FC = () => {
  const { current, back, db, sel, toast, updateTicket } = useApp();
  const ticket = db.tickets.find((t: any) => t.id === current.params?.id);
  if (!ticket) return <Screen><TopBar title="Wallet pass" onBack={back} /><EmptyState title="Ticket not found" /></Screen>;
  const ev = sel.event(ticket.eventId);
  const places = sel.placementsForTicket(ticket.id);

  return (
    <Screen>
      <TopBar title="Wallet pass" onBack={back} />
      <div className="px-4 pt-6">
        <div className="rounded-3xl overflow-hidden shadow-xl bg-slate-900 text-white">
          <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700">
            <p className="text-[11px] uppercase tracking-widest text-white/70">Redeemed Events</p>
            <p className="text-[17px] font-bold mt-1">{ev?.title}</p>
            <p className="text-[12.5px] text-white/80">{fmtDate(ev?.startDate)} · {fmtTime(ev?.startTime)}</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3 text-[12.5px]">
            <div><p className="text-white/50">Guest</p><p className="font-semibold">{ticket.holderName}</p></div>
            <div><p className="text-white/50">Ticket</p><p className="font-semibold">{ticket.ticketTypeTitle}</p></div>
            <div><p className="text-white/50">Venue</p><p className="font-semibold">{ev?.venue}</p></div>
            <div><p className="text-white/50">Placement</p><p className="font-semibold">{places.map((p: any) => sel.unit(p.unitId)?.label).join(' · ') || 'Unassigned'}</p></div>
          </div>
          <div className="bg-white p-4 flex justify-center"><QRCode value={ticket.code} size={150} /></div>
        </div>
        <div className="mt-4 space-y-2">
          <Button full onClick={() => { updateTicket(ticket.id, { walletAdded: true }); toast('Pass added to Apple Wallet (simulated)'); }}>Add to Apple Wallet</Button>
          <Button full variant="secondary" onClick={() => { updateTicket(ticket.id, { walletAdded: true }); toast('Pass added to Google Wallet (simulated)'); }}>Add to Google Wallet</Button>
          {ticket.walletAdded && <p className="text-center text-[12.5px] text-emerald-600">Pass installed — placement updates sync automatically.</p>}
          <p className="text-[12px] text-slate-500 text-center">Wallet signing certificates aren't available in the demo, so the pass is previewed here and kept in sync with your live placement.</p>
        </div>
      </div>
    </Screen>
  );
};

const Info: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div><p className="text-slate-400 text-[11.5px]">{label}</p><p className="font-medium text-slate-800 dark:text-slate-100 truncate">{value}</p></div>
);
