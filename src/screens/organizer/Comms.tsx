import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Field, Select, SearchInput, EmptyState, Sheet, Confirm, Chip, Toggle } from '@/components/kit';
import { PermissionBlock } from '@/screens/organizer/Orders';
import { money, fmtDate, relTime, uid } from '@/lib/helpers';
import { Megaphone, Tag, Inbox, Heart, Send, Trash2, Download, Mail, Banknote, ExternalLink, UserPlus, BarChart3 } from 'lucide-react';

/* ------------------------------- Coupons ------------------------------- */
export const Coupons: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, saveCoupon, deleteCoupon, can, toast } = useApp();
  const events = sel.orgEvents(myOrganizerId);
  const [eventId, setEventId] = useState(current.params?.eventId || db.showcaseEventId);
  const [sheet, setSheet] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  if (!can('coupon')) return <PermissionBlock title="Coupons" />;
  const list = sel.coupons(eventId);

  return (
    <Screen>
      <TopBar title="Coupons" subtitle={sel.event(eventId)?.title} onBack={back}
        right={<button onClick={() => setSheet({ id: uid('cp'), eventId, code: '', description: '', percent: 10, maxDiscount: 2000, totalUsers: 100, active: true })} className="p-2 text-indigo-600 text-[22px] leading-none">+</button>} />
      <div className="px-4 pt-4 space-y-3">
        <Select value={eventId} onChange={setEventId} options={events.map((e: any) => ({ value: e.id, label: e.title }))} />
        {list.length === 0 && <EmptyState title="No coupon codes" body="Create a code to reward early birds or partners." icon={<Tag className="w-6 h-6" />}
          action={<Button size="sm" onClick={() => setSheet({ id: uid('cp'), eventId, code: '', description: '', percent: 10, maxDiscount: 2000, totalUsers: 100, active: true })}>Create coupon</Button>} />}
        {list.map((c: any) => (
          <Card key={c.id} className="p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-[15px] text-slate-900 dark:text-white">{c.code}</p>
                <p className="text-[12.5px] text-slate-500">{c.description}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge tone="indigo">{c.percent}% off</Badge>
                  <Badge tone="slate">Max {money(c.maxDiscount)}</Badge>
                  <Badge tone="slate">{c.used}/{c.totalUsers} used</Badge>
                  <Badge tone={c.active ? 'green' : 'rose'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setSheet(c)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { saveCoupon({ ...c, active: !c.active }); toast(c.active ? 'Coupon deactivated' : 'Coupon activated'); }}>{c.active ? 'Disable' : 'Enable'}</Button>
                <Button size="sm" variant="outline" onClick={() => setDel(c)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Sheet open={!!sheet} onClose={() => setSheet(null)} title="Coupon"
        footer={<Button full onClick={() => { if (!sheet.code.trim()) { toast('Enter a code', 'error'); return; } saveCoupon({ ...sheet, code: sheet.code.toUpperCase(), percent: Number(sheet.percent), maxDiscount: Number(sheet.maxDiscount), totalUsers: Number(sheet.totalUsers) }); setSheet(null); toast('Coupon saved'); }}>Save coupon</Button>}>
        {sheet && (
          <div className="space-y-3">
            <Field label="Code" value={sheet.code} onChange={(v) => setSheet({ ...sheet, code: v.toUpperCase() })} required />
            <Field label="Description" value={sheet.description} onChange={(v) => setSheet({ ...sheet, description: v })} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Discount %" type="number" value={sheet.percent} onChange={(v) => setSheet({ ...sheet, percent: v })} />
              <Field label="Max $ (cents)" type="number" value={sheet.maxDiscount} onChange={(v) => setSheet({ ...sheet, maxDiscount: v })} />
              <Field label="Total users" type="number" value={sheet.totalUsers} onChange={(v) => setSheet({ ...sheet, totalUsers: v })} />
            </div>
            <Toggle checked={sheet.active} onChange={(v) => setSheet({ ...sheet, active: v })} label="Active" />
          </div>
        )}
      </Sheet>
      <Confirm open={!!del} title="Delete coupon?" danger confirmLabel="Delete" body={`${del?.code} will stop working immediately.`}
        onCancel={() => setDel(null)} onConfirm={() => { deleteCoupon(del.id); setDel(null); toast('Coupon deleted'); }} />
    </Screen>
  );
};

/* ---------------------------- Announcements ---------------------------- */
export const Announcements: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, sendAnnouncement, deleteAnnouncement, can, toast } = useApp();
  const events = sel.orgEvents(myOrganizerId);
  const [compose, setCompose] = useState<any>(current.params?.compose ? { eventId: current.params.eventId || db.showcaseEventId, subject: '', message: '', audience: 'All Attendees', audienceValue: '', scheduledFor: '' } : null);
  const [touched, setTouched] = useState(false);
  const [del, setDel] = useState<any>(null);
  if (!can('announcements')) return <PermissionBlock title="Announcements" />;
  const list = db.announcements.filter((a: any) => a.organizerId === myOrganizerId || events.some((e: any) => e.id === a.eventId));
  const units = compose ? db.layouts.filter((l: any) => l.eventId === compose.eventId).flatMap((l: any) => sel.units(l.id)) : [];

  const errs = touched && compose ? {
    subject: !compose.subject.trim() ? 'Subject is required' : '',
    message: compose.message.trim().length < 5 ? 'Write a message' : '',
  } : { subject: '', message: '' };

  return (
    <Screen>
      <TopBar title="Announcements" onBack={back}
        right={<button onClick={() => { setTouched(false); setCompose({ eventId: db.showcaseEventId, subject: '', message: '', audience: 'All Attendees', audienceValue: '', scheduledFor: '' }); }} className="p-2 text-indigo-600 text-[22px] leading-none">+</button>} />
      <div className="px-4 pt-4 space-y-3">
        {list.length === 0 && <EmptyState title="No announcements yet" body="Keep attendees informed about parking, schedule changes and more." icon={<Megaphone className="w-6 h-6" />} />}
        {list.map((a: any) => (
          <Card key={a.id} className="p-4">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{a.subject}</p>
              <Badge tone={a.status === 'Sent' ? 'green' : 'amber'}>{a.status}</Badge>
            </div>
            <p className="text-[12.5px] text-slate-500 mt-0.5">{sel.event(a.eventId)?.title}</p>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-2">{a.message}</p>
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-1.5"><Badge tone="slate">{a.audience}{a.audienceValue ? `: ${a.audienceValue}` : ''}</Badge><Badge tone="slate">{a.recipients} recipients</Badge></div>
              <button onClick={() => setDel(a)} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!compose} onClose={() => setCompose(null)} title="New announcement"
        footer={<Button full onClick={() => {
          setTouched(true);
          if (!compose.subject.trim() || compose.message.trim().length < 5) return;
          sendAnnouncement({ ...compose, organizerId: myOrganizerId, scheduledFor: compose.scheduledFor || null });
          setCompose(null); setTouched(false);
        }} icon={<Send className="w-4 h-4" />}>{compose?.scheduledFor ? 'Schedule' : 'Send now'}</Button>}>
        {compose && (
          <div className="space-y-3">
            <Select label="Event" value={compose.eventId} onChange={(v) => setCompose({ ...compose, eventId: v })} options={events.map((e: any) => ({ value: e.id, label: e.title }))} />
            <Field label="Subject" value={compose.subject} onChange={(v) => setCompose({ ...compose, subject: v })} error={errs.subject} required />
            <Field label="Message" multiline value={compose.message} onChange={(v) => setCompose({ ...compose, message: v })} error={errs.message} required hint="Basic formatting supported: **bold**, _italic_" />
            <Select label="Audience" value={compose.audience} onChange={(v) => setCompose({ ...compose, audience: v, audienceValue: '' })} options={['All Attendees', 'Ticket Type', 'Placement']} />
            {compose.audience === 'Ticket Type' && <Select label="Ticket type" value={compose.audienceValue} onChange={(v) => setCompose({ ...compose, audienceValue: v })} options={sel.ticketTypes(compose.eventId).map((t: any) => t.title)} />}
            {compose.audience === 'Placement' && <Select label="Placement" value={compose.audienceValue} onChange={(v) => setCompose({ ...compose, audienceValue: v })} options={units.map((u: any) => u.label)} />}
            <Field label="Schedule for later (optional)" type="date" value={compose.scheduledFor} onChange={(v) => setCompose({ ...compose, scheduledFor: v })} />
          </div>
        )}
      </Sheet>
      <Confirm open={!!del} title="Delete announcement?" danger confirmLabel="Delete" body="This removes the announcement from your history."
        onCancel={() => setDel(null)} onConfirm={() => { deleteAnnouncement(del.id); setDel(null); toast('Announcement deleted'); }} />
    </Screen>
  );
};

/* ------------------------------ Enquiries ------------------------------ */
export const Enquiries: React.FC = () => {
  const { db, sel, back, myOrganizerId, updateEnquiry, replyEnquiry, deleteEnquiry, can, toast } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [del, setDel] = useState<any>(null);
  if (!can('attendees')) return <PermissionBlock title="Enquiries" />;
  const list = db.enquiries.filter((e: any) => e.organizerId === myOrganizerId)
    .filter((e: any) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase()) || e.message.toLowerCase().includes(q.toLowerCase()));

  return (
    <Screen>
      <TopBar title="Enquiries" subtitle={`${list.filter((e: any) => !e.read).length} unread`} onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, email or message" />
        {list.length === 0 && <EmptyState title="No enquiries" body="Messages from the Contact Organizer form arrive here." icon={<Inbox className="w-6 h-6" />} />}
        {list.map((e: any) => (
          <Card key={e.id} className={`p-4 ${!e.read ? 'border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`} onClick={() => { setOpen(e); setReply(''); updateEnquiry(e.id, { read: true }); }}>
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{e.name}</p>
              <span className="text-[11.5px] text-slate-400">{relTime(e.createdAt)}</span>
            </div>
            <p className="text-[12px] text-slate-500">{e.email} · {sel.event(e.eventId)?.title}</p>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">{e.message}</p>
            <div className="flex gap-1.5 mt-2">
              <Badge tone={e.read ? 'slate' : 'indigo'}>{e.read ? 'Read' : 'Unread'}</Badge>
              {e.replies.length > 0 && <Badge tone="green">{e.replies.length} replies</Badge>}
            </div>
          </Card>
        ))}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title="Enquiry"
        footer={<div className="flex gap-2">
          <Button variant="secondary" onClick={() => { updateEnquiry(open.id, { read: !open.read }); toast(open.read ? 'Marked unread' : 'Marked read'); setOpen(null); }}>{open?.read ? 'Unread' : 'Read'}</Button>
          <Button variant="danger" onClick={() => { setDel(open); setOpen(null); }}>Delete</Button>
          <Button full onClick={() => { if (reply.trim().length < 2) { toast('Write a reply', 'error'); return; } replyEnquiry(open.id, reply); setOpen(null); toast('Reply sent'); }}>Reply</Button>
        </div>}>
        {open && (
          <div className="space-y-3">
            <p className="text-[13px] text-slate-500">{open.name} · {open.email}</p>
            <p className="text-[14px] text-slate-700 dark:text-slate-200">{open.message}</p>
            {open.replies.map((r: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-[13px] text-indigo-900 dark:text-indigo-200">{r.body}<span className="block text-[11px] opacity-60 mt-1">{relTime(r.at)}</span></div>
            ))}
            <Field label="Reply" multiline value={reply} onChange={setReply} />
          </div>
        )}
      </Sheet>
      <Confirm open={!!del} title="Delete enquiry?" danger confirmLabel="Delete" body="This removes the message permanently."
        onCancel={() => setDel(null)} onConfirm={() => { deleteEnquiry(del.id); setDel(null); toast('Enquiry deleted'); }} />
    </Screen>
  );
};

/* ------------------------------ Followers ------------------------------ */
export const Followers: React.FC = () => {
  const { sel, back, myOrganizerId, can, toast } = useApp();
  const [q, setQ] = useState('');
  if (!can('attendees')) return <PermissionBlock title="Followers" />;
  const list = sel.followers(myOrganizerId).filter((u: any) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen>
      <TopBar title="Followers" subtitle={`${list.length} people`} onBack={back}
        right={<button onClick={() => toast('Follower list exported (CSV)')} className="p-2 text-indigo-600"><Download className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search followers" />
        {list.length === 0 && <EmptyState title="No followers yet" body="Publish events and share your organizer page to grow your audience." icon={<Heart className="w-6 h-6" />} />}
        {list.map((u: any) => (
          <Card key={u.id} className="p-3 flex items-center gap-3">
            <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium truncate text-slate-900 dark:text-white">{u.name}</p>
              <p className="text-[12px] text-slate-500 truncate">{u.email} · {u.phone}</p>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  );
};

/* ------------------------------- Payouts ------------------------------- */
export const Payouts: React.FC = () => {
  const { db, back, myOrganizer, can, toast } = useApp();
  if (!can('finances')) return <PermissionBlock title="Payouts" />;
  const list = db.payouts.filter((p: any) => p.organizerId === myOrganizer?.id);
  const s = myOrganizer?.stripe || {};
  return (
    <Screen>
      <TopBar title="Payouts" subtitle="Stripe Connect (sandbox)" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{s.accountEmail || 'No account connected'}</p>
              <p className="text-[12.5px] text-slate-500">Payout schedule: {s.schedule}</p>
            </div>
            <Badge tone={s.connected ? 'green' : 'amber'}>{s.verification}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Card className="p-3"><p className="text-[11px] text-slate-500">Available</p><p className="text-[17px] font-bold text-slate-900 dark:text-white">{money(s.available || 0)}</p></Card>
            <Card className="p-3"><p className="text-[11px] text-slate-500">Pending</p><p className="text-[17px] font-bold text-slate-900 dark:text-white">{money(s.pending || 0)}</p></Card>
          </div>
          <Button full variant="secondary" className="mt-3" icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => toast('Stripe Express dashboard opens in production. Demo shows sandbox data only.', 'info')}>Open Stripe Express dashboard</Button>
        </Card>
        <Card className="p-4">
          <p className="font-semibold text-[14px] mb-2 text-slate-900 dark:text-white">Payout history</p>
          {list.length === 0 && <p className="text-[12.5px] text-slate-500">No payouts yet.</p>}
          {list.map((p: any) => (
            <div key={p.id} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div><p className="text-[13.5px] text-slate-900 dark:text-white">{money(p.amount)}</p><p className="text-[12px] text-slate-500">{p.destination} · {fmtDate(p.arrival)}</p></div>
              <Badge tone={p.status === 'Paid' ? 'green' : 'amber'}>{p.status}</Badge>
            </div>
          ))}
        </Card>
        <p className="text-[11.5px] text-slate-400 text-center">Sandbox data. No real financial account is connected or modified.</p>
      </div>
    </Screen>
  );
};

/* -------------------------------- Team -------------------------------- */
export const Team: React.FC = () => {
  const { db, back, myOrganizerId, saveTeamMember, deleteTeamMember, can, toast } = useApp();
  const [sheet, setSheet] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  if (!can('editEvent')) return <PermissionBlock title="Team members" />;
  const list = db.teamMembers.filter((m: any) => m.organizerId === myOrganizerId);
  const PERMS = [['scan', 'Scan Tickets'], ['finances', 'Finances'], ['attendees', 'Attendee List'], ['announcements', 'Announcements'], ['editEvent', 'Edit Event'], ['deleteEvent', 'Delete Event'], ['coupon', 'Coupon'], ['resend', 'Resend Ticket']];

  return (
    <Screen>
      <TopBar title="Team members" onBack={back}
        right={<button onClick={() => setSheet({ id: uid('tm'), organizerId: myOrganizerId, name: '', email: '', phone: '', status: 'Invited', permissions: { scan: true, finances: false, attendees: true, announcements: false, editEvent: false, deleteEvent: false, coupon: false, resend: false } })} className="p-2 text-indigo-600"><UserPlus className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        {list.length === 0 && <EmptyState title="No team members" body="Invite staff and volunteers with scoped permissions." icon={<UserPlus className="w-6 h-6" />} />}
        {list.map((m: any) => (
          <Card key={m.id} className="p-4">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{m.name}</p>
                <p className="text-[12px] text-slate-500 truncate">{m.email} · {m.phone}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {PERMS.filter(([k]) => m.permissions[k]).map(([k, l]) => <Badge key={k} tone="green">{l}</Badge>)}
                  {PERMS.every(([k]) => !m.permissions[k]) && <Badge tone="slate">No permissions</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Badge tone={m.status === 'Active' ? 'green' : 'amber'}>{m.status}</Badge>
                <Button size="sm" variant="secondary" onClick={() => setSheet({ ...m })}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => setDel(m)}>Remove</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Sheet open={!!sheet} onClose={() => setSheet(null)} title="Team member"
        footer={<Button full onClick={() => { if (!sheet.name.trim() || !sheet.email.includes('@')) { toast('Name and valid email required', 'error'); return; } saveTeamMember(sheet); setSheet(null); toast('Team member saved — permissions enforced immediately'); }}>Save member</Button>}>
        {sheet && (
          <div className="space-y-3">
            <Field label="Full name" value={sheet.name} onChange={(v) => setSheet({ ...sheet, name: v })} required />
            <Field label="Email" value={sheet.email} onChange={(v) => setSheet({ ...sheet, email: v })} required />
            <Field label="Phone" value={sheet.phone} onChange={(v) => setSheet({ ...sheet, phone: v })} />
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Permissions</p>
                <button onClick={() => { const all = PERMS.every(([k]) => sheet.permissions[k]); setSheet({ ...sheet, permissions: Object.fromEntries(PERMS.map(([k]) => [k, !all])) }); }} className="text-[12.5px] text-indigo-600 font-medium">Select all</button>
              </div>
              {PERMS.map(([k, l]) => (
                <Toggle key={k} checked={!!sheet.permissions[k]} onChange={(v) => setSheet({ ...sheet, permissions: { ...sheet.permissions, [k]: v } })} label={l} />
              ))}
            </div>
          </div>
        )}
      </Sheet>
      <Confirm open={!!del} title="Remove team member?" danger confirmLabel="Remove" body={`${del?.name} will immediately lose access to your events.`}
        onCancel={() => setDel(null)} onConfirm={() => { deleteTeamMember(del.id); setDel(null); toast('Team member removed'); }} />
    </Screen>
  );
};

/* ------------------------------ Marketing ------------------------------ */
export const Marketing: React.FC = () => {
  const { back, go, toast, db, myOrganizerId, sel } = useApp();
  const followers = sel.followerCount(myOrganizerId);
  return (
    <Screen>
      <TopBar title="Marketing" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-0">
          <p className="text-[17px] font-bold">Fill your next room</p>
          <p className="text-[13px] text-white/85 mt-1">Reach your {followers} followers, run discount campaigns and share deep links to your event page.</p>
        </Card>
        {[
          { t: 'Announce to attendees', d: 'Push + in-app message to everyone holding a ticket.', a: () => go('org-announcements') },
          { t: 'Create a promo code', d: 'Percentage discounts with usage caps.', a: () => go('org-coupons') },
          { t: 'Share event link', d: 'Copy a deep link for socials and email.', a: () => toast('Link copied: redeemedevents.app/e/' + db.showcaseEventId) },
          { t: 'Email your followers', d: 'Delivery runs through the sandbox email adapter.', a: () => toast('Campaign queued to the sandbox email adapter') },
        ].map((c) => (
          <Card key={c.t} className="p-4 flex items-center justify-between" onClick={c.a}>
            <div><p className="font-semibold text-[14px] text-slate-900 dark:text-white">{c.t}</p><p className="text-[12.5px] text-slate-500">{c.d}</p></div>
            <Send className="w-4 h-4 text-indigo-600" />
          </Card>
        ))}
      </div>
    </Screen>
  );
};
