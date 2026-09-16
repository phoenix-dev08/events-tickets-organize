import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Row, Field, Sheet, EmptyState, Toggle, Confirm, SearchInput, Segmented } from '@/components/kit';
import { money, fmtDate, relTime } from '@/lib/helpers';
import { User, Bell, Moon, Shield, HelpCircle, FileText, LogOut, Trash2, Repeat, Heart, Receipt, ChevronRight, Building2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, session, go, logout, updateUser, deleteAccount, theme, setTheme, activeRole, switchRole, sel, db, becomeOrganizer, offline, setOffline, toast } = useApp();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [org, setOrg] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [orgForm, setOrgForm] = useState({ name: '', bio: '', website: '' });
  const [notif, setNotif] = useState({ push: true, email: true, sms: false });

  if (!session) return (
    <Screen><TopBar title="Profile" sticky={false} />
      <EmptyState title="Sign in to Redeemed Events" body="Access your tickets, orders and organizer tools." icon={<User className="w-6 h-6" />} action={<Button onClick={() => go('auth')}>Sign in</Button>} />
    </Screen>
  );

  const roles = user.roles || [];
  const unread = sel.notifications().filter((n: any) => !n.read).length;

  return (
    <Screen>
      <TopBar title="Profile" />
      <div className="px-4 pt-4 space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[16px] text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-[12.5px] text-slate-500 truncate">{user.email}</p>
            <div className="flex gap-1.5 mt-1.5">{roles.map((r: string) => <Badge key={r} tone={r === activeRole ? 'indigo' : 'slate'}>{r}</Badge>)}</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => { setForm({ name: user.name, phone: user.phone }); setEdit(true); }}>Edit</Button>
        </Card>

        <Card>
          <Row icon={<Bell className="w-4 h-4" />} label="Notifications" value={unread ? `${unread} new` : ''} onClick={() => go('notifications')} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
          <Row icon={<Receipt className="w-4 h-4" />} label="Payment history" onClick={() => go('payments')} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
          <Row icon={<Heart className="w-4 h-4" />} label="Following" value={`${db.follows.filter((f: any) => f.userId === user.id).length}`} onClick={() => go('following')} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
        </Card>

        <Card className="px-4 py-1">
          <Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Dark appearance" description="Match your late-night event ops" />
          <Toggle checked={notif.push} onChange={(v) => setNotif((n) => ({ ...n, push: v }))} label="Push notifications" description="Order updates, reminders, placement changes" />
          <Toggle checked={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} label="Email notifications" />
          <Toggle checked={offline} onChange={(v) => { setOffline(v); toast(v ? 'Offline mode enabled — actions will queue' : 'Back online'); }} label="Offline mode (demo)" description="Simulate poor venue connectivity" />
        </Card>

        <Card>
          <p className="px-4 pt-3 pb-1 text-[12px] font-semibold uppercase tracking-wide text-slate-400">Switch role</p>
          {['attendee', ...(roles.includes('organizer') ? ['organizer'] : []), ...(roles.includes('team') ? ['team'] : []), ...(roles.includes('admin') ? ['admin'] : [])].map((r) => (
            <Row key={r} icon={<Repeat className="w-4 h-4" />} label={`${r.charAt(0).toUpperCase() + r.slice(1)} view`} value={activeRole === r ? 'Active' : ''} onClick={() => switchRole(r)} />
          ))}
          {!roles.includes('organizer') && <Row icon={<Building2 className="w-4 h-4" />} label="Become an organizer" onClick={() => setOrg(true)} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />}
        </Card>

        <Card>
          <Row icon={<HelpCircle className="w-4 h-4" />} label="Help & contact us" onClick={() => go('help')} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
          <Row icon={<Shield className="w-4 h-4" />} label="Privacy Policy" onClick={() => go('legal', { doc: 'privacy' })} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
          <Row icon={<FileText className="w-4 h-4" />} label="Terms of Use" onClick={() => go('legal', { doc: 'terms' })} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
          <Row icon={<User className="w-4 h-4" />} label="About us" onClick={() => go('legal', { doc: 'about' })} right={<ChevronRight className="w-4 h-4 text-slate-300" />} />
        </Card>

        <Card>
          <Row icon={<LogOut className="w-4 h-4" />} label="Log out" onClick={logout} />
          <Row icon={<Trash2 className="w-4 h-4" />} label="Delete account" danger onClick={() => setDel(true)} />
        </Card>
        <p className="text-center text-[11.5px] text-slate-400 pb-6">Redeemed Events · Demo build v1.0</p>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Edit profile"
        footer={<Button full onClick={() => { updateUser({ name: form.name, phone: form.phone }); setEdit(false); toast('Profile updated'); }}>Save</Button>}>
        <div className="space-y-3">
          <div className="flex justify-center"><img src={user.avatar} alt="" className="w-20 h-20 rounded-full" /></div>
          <Button variant="secondary" full size="sm" onClick={() => toast('Photo picker simulated in demo', 'info')}>Change photo</Button>
          <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Field label="Email" value={user.email} onChange={() => { }} disabled hint="Email cannot be changed" />
        </div>
      </Sheet>

      <Sheet open={org} onClose={() => setOrg(false)} title="Become an organizer"
        footer={<Button full disabled={!orgForm.name.trim()} onClick={() => { becomeOrganizer(orgForm); setOrg(false); }}>Create organizer account</Button>}>
        <div className="space-y-3">
          <p className="text-[13px] text-slate-500">Set up your public organizer profile. You can switch between attendee and organizer any time.</p>
          <Field label="Organization name" value={orgForm.name} onChange={(v) => setOrgForm((f) => ({ ...f, name: v }))} required />
          <Field label="About" multiline value={orgForm.bio} onChange={(v) => setOrgForm((f) => ({ ...f, bio: v }))} />
          <Field label="Website" value={orgForm.website} onChange={(v) => setOrgForm((f) => ({ ...f, website: v }))} />
        </div>
      </Sheet>

      <Confirm open={del} title="Delete your account?" danger confirmLabel="Delete account"
        body="This permanently removes your profile, tickets and order history from the demo database."
        onCancel={() => setDel(false)} onConfirm={() => { setDel(false); deleteAccount(); }} />
    </Screen>
  );
};

export const Notifications: React.FC = () => {
  const { sel, back, markNotificationRead, markAllRead, go } = useApp();
  const list = sel.notifications();
  return (
    <Screen>
      <TopBar title="Notifications" onBack={back} right={<button onClick={markAllRead} className="text-[13px] font-semibold text-indigo-600 px-2">Mark all read</button>} />
      <div className="px-4 pt-4 space-y-2">
        {list.length === 0 && <EmptyState title="No notifications yet" body="Order updates, reminders and placement changes land here." icon={<Bell className="w-6 h-6" />} />}
        {list.map((n: any) => (
          <Card key={n.id} className={`p-4 ${!n.read ? 'border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
            onClick={() => { markNotificationRead(n.id); if (n.route) go(n.route, n.params || {}); }}>
            <div className="flex justify-between gap-2">
              <Badge tone={n.read ? 'slate' : 'indigo'}>{n.type}</Badge>
              <span className="text-[11.5px] text-slate-400">{relTime(n.createdAt)}</span>
            </div>
            <p className="font-semibold text-[14px] mt-2 text-slate-900 dark:text-white">{n.title}</p>
            <p className="text-[12.5px] text-slate-500 mt-0.5">{n.body}</p>
          </Card>
        ))}
      </div>
    </Screen>
  );
};

export const Payments: React.FC = () => {
  const { sel, back, db, toast } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [receipt, setReceipt] = useState<any>(null);
  const list = sel.myPayments().filter((p: any) => {
    const ev = sel.event(p.eventId);
    const match = !q || ev?.title.toLowerCase().includes(q.toLowerCase()) || p.transactionId.toLowerCase().includes(q.toLowerCase());
    return match && (status === 'All' || p.status === status);
  });
  return (
    <Screen>
      <TopBar title="Payment history" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search event or transaction ID" />
        <Segmented options={['All', 'Succeeded', 'Refunded']} value={status} onChange={setStatus} />
        {list.length === 0 && <EmptyState title="No payments found" body="Purchases you make will show here with receipts." icon={<Receipt className="w-6 h-6" />} />}
        {list.map((p: any) => {
          const ev = sel.event(p.eventId);
          const order = db.orders.find((o: any) => o.id === p.orderId);
          return (
            <Card key={p.id} className="p-4" onClick={() => setReceipt({ p, order, ev })}>
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[14px] truncate text-slate-900 dark:text-white">{ev?.title}</p>
                  <p className="text-[12px] text-slate-500">{fmtDate(p.createdAt)} · {p.transactionId}</p>
                  <Badge tone={p.status === 'Succeeded' ? 'green' : 'rose'} className="mt-1.5">{p.status}</Badge>
                </div>
                <p className="font-bold text-[15px] text-slate-900 dark:text-white">{money(p.amount)}</p>
              </div>
            </Card>
          );
        })}
      </div>
      <Sheet open={!!receipt} onClose={() => setReceipt(null)} title="Receipt"
        footer={<Button full variant="secondary" onClick={() => { toast('Receipt shared (simulated)'); setReceipt(null); }}>Share receipt</Button>}>
        {receipt && (
          <div className="space-y-2 text-[13.5px]">
            <RowKV k="Event" v={receipt.ev?.title} />
            <RowKV k="Order" v={receipt.order?.number} />
            <RowKV k="Transaction ID" v={receipt.p.transactionId} />
            <RowKV k="Date" v={fmtDate(receipt.p.createdAt)} />
            <RowKV k="Method" v={receipt.p.method} />
            <RowKV k="Status" v={receipt.p.status} />
            <RowKV k="Subtotal" v={money(receipt.order?.subtotal || 0)} />
            <RowKV k="Fees" v={money((receipt.order?.adminFee || 0) + (receipt.order?.paymentFee || 0))} />
            <RowKV k="Total" v={money(receipt.p.amount)} />
          </div>
        )}
      </Sheet>
    </Screen>
  );
};

export const Following: React.FC = () => {
  const { db, sel, back, go, toggleFollow, user } = useApp();
  const follows = db.follows.filter((f: any) => f.userId === user?.id);
  return (
    <Screen>
      <TopBar title="Following" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        {follows.length === 0 && <EmptyState title="You're not following anyone yet" body="Follow organizers to get their new events first." icon={<Heart className="w-6 h-6" />} action={<Button onClick={() => go('browse')}>Discover organizers</Button>} />}
        {follows.map((f: any) => {
          const org = sel.organizer(f.organizerId);
          const events = db.events.filter((e: any) => e.organizerId === f.organizerId && e.status === 'published').slice(0, 3);
          return (
            <Card key={f.id} className="p-4">
              <div className="flex items-center gap-3">
                <img src={org?.avatar} alt="" className="w-11 h-11 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{org?.name}</p>
                  <p className="text-[12px] text-slate-500">{sel.followerCount(f.organizerId)} followers</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => toggleFollow(f.organizerId)}>Unfollow</Button>
              </div>
              <div className="mt-3 space-y-1.5">
                {events.map((e: any) => (
                  <button key={e.id} onClick={() => go('event', { id: e.id })} className="w-full flex items-center gap-2 text-left">
                    <img src={e.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0"><p className="text-[13px] font-medium truncate text-slate-800 dark:text-slate-100">{e.title}</p><p className="text-[11.5px] text-slate-500">{fmtDate(e.startDate)}</p></div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
};

export const Legal: React.FC = () => {
  const { current, back } = useApp();
  const doc = current.params?.doc || 'about';
  const copy: any = {
    about: { t: 'About us', b: 'Redeemed Events exists to help communities gather well. We build ticketing, seating and check-in tools for conferences, worship nights and outreach events — so organizers can focus on people, not spreadsheets. Founded in 2023, we now power thousands of gatherings across the country.' },
    terms: { t: 'Terms of Use', b: 'By using Redeemed Events you agree to purchase tickets for personal use, to present a valid ticket for entry, and to follow venue policies. Organizers are responsible for event delivery and refund policies. Redeemed Events provides the platform, payment processing and support tooling. This demo build processes no real payments.' },
    privacy: { t: 'Privacy Policy', b: 'We collect the information you provide when creating an account, buying tickets or contacting an organizer. Ticket holder details are shared with the event organizer so they can manage entry, seating and communication. We never sell personal data. You may request deletion of your account at any time from Profile → Delete account.' },
  };
  const d = copy[doc];
  return (
    <Screen>
      <TopBar title={d.t} onBack={back} />
      <div className="px-5 pt-5">
        <p className="text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-300">{d.b}</p>
        <p className="text-[12px] text-slate-400 mt-6">Last updated {fmtDate(new Date().toISOString())}</p>
      </div>
    </Screen>
  );
};

const RowKV: React.FC<{ k: string; v: any }> = ({ k, v }) => (
  <div className="flex justify-between gap-3"><span className="text-slate-500">{k}</span><span className="font-medium text-right text-slate-900 dark:text-white">{v || '—'}</span></div>
);
