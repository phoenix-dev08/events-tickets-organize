import React, { useMemo, useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Segmented, Chip, EmptyState, Sheet, Confirm, Row } from '@/components/kit';
import { money, fmtDate, fmtTime, isFuture, uid } from '@/lib/helpers';
import {
  Plus, Users, DollarSign, CalendarDays, QrCode, Megaphone, Tag, Send, PencilLine, Trash2,
  ListChecks, LayoutGrid, Mail, UserPlus, Banknote, BarChart3, Inbox, Heart, Lock,
} from 'lucide-react';

const RANGES = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'Custom'];

const Dashboard: React.FC = () => {
  const { db, sel, go, user, myOrganizerId, myOrganizer, can, activeRole, deleteEvent, resendTickets, toast, teamMember } = useApp();
  const [range, setRange] = useState('This Month');
  const [chart, setChart] = useState('This Week');
  const [section, setSection] = useState('Upcoming');
  const [menu, setMenu] = useState<any>(null);
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [confirmResend, setConfirmResend] = useState<any>(null);

  const orgId = myOrganizerId;
  const events = orgId ? sel.orgEvents(orgId) : [];
  const orders = orgId ? sel.orgOrders(orgId).filter((o: any) => o.status === 'paid') : [];

  const rangeStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (range === 'Today') return d.getTime();
    if (range === 'Yesterday') return d.getTime() - 864e5;
    if (range === 'This Week') return d.getTime() - d.getDay() * 864e5;
    if (range === 'Last Week') return d.getTime() - (d.getDay() + 7) * 864e5;
    if (range === 'This Month') return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    if (range === 'Last Month') return new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    return 0;
  }, [range]);

  const scoped = orders.filter((o: any) => +new Date(o.createdAt) >= rangeStart);
  const revenue = scoped.reduce((s: number, o: any) => s + o.total, 0);
  const ticketsSold = db.tickets.filter((t: any) => events.some((e: any) => e.id === t.eventId) && t.status === 'valid').length;

  const chartData = useMemo(() => {
    const buckets = chart === 'This Week' ? 7 : chart === 'This Month' ? 6 : 12;
    const arr = Array.from({ length: buckets }, (_, i) => ({ label: '', value: 0 }));
    orders.forEach((o: any) => {
      const d = new Date(o.createdAt);
      let idx = -1;
      if (chart === 'This Week') { const diff = Math.floor((Date.now() - +d) / 864e5); if (diff < 7) idx = 6 - diff; }
      else if (chart === 'This Month') { const diff = Math.floor((Date.now() - +d) / (5 * 864e5)); if (diff < 6) idx = 5 - diff; }
      else { const diff = new Date().getMonth() - d.getMonth() + (new Date().getFullYear() - d.getFullYear()) * 12; if (diff >= 0 && diff < 12) idx = 11 - diff; }
      if (idx >= 0) arr[idx].value += o.total;
    });
    const labels = chart === 'This Week' ? ['6d', '5d', '4d', '3d', '2d', 'Yd', 'Td'] : chart === 'This Month' ? ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    return arr.map((a, i) => ({ ...a, label: labels[i] || '' }));
  }, [orders, chart]);
  const maxVal = Math.max(1, ...chartData.map((c) => c.value));

  if (!orgId) {
    return <Screen><TopBar title="Organize" /><EmptyState title="You're not an organizer yet" body="Create an organizer profile to publish events, sell tickets and build seating charts."
      action={<Button onClick={() => go('profile')}>Become an organizer</Button>} icon={<CalendarDays className="w-6 h-6" />} /></Screen>;
  }

  const filtered = events.filter((e: any) => section === 'Draft' ? e.status === 'draft' : e.status === 'published' && (section === 'Upcoming' ? isFuture(e.startDate) : !isFuture(e.startDate)));

  const quick = [
    { label: 'Orders', icon: ListChecks, route: 'org-orders', perm: 'attendees' },
    { label: 'Attendees', icon: Users, route: 'org-roster', perm: 'attendees' },
    { label: 'Scan', icon: QrCode, route: 'org-scan', perm: 'scan' },
    { label: 'Seating', icon: LayoutGrid, route: 'org-layouts', perm: 'editEvent' },
    { label: 'Coupons', icon: Tag, route: 'org-coupons', perm: 'coupon' },
    { label: 'Announce', icon: Megaphone, route: 'org-announcements', perm: 'announcements' },
    { label: 'Enquiries', icon: Inbox, route: 'org-enquiries', perm: 'attendees' },
    { label: 'Followers', icon: Heart, route: 'org-followers', perm: 'attendees' },
    { label: 'Payouts', icon: Banknote, route: 'org-payouts', perm: 'finances' },
    { label: 'Team', icon: UserPlus, route: 'org-team', perm: 'editEvent' },
    { label: 'Marketing', icon: Send, route: 'org-marketing', perm: 'announcements' },
    { label: 'Analytics', icon: BarChart3, route: 'analytics', perm: 'finances' },
  ];

  return (
    <Screen>
      <TopBar title={activeRole === 'team' ? 'Staff tools' : 'Organizer'} subtitle={myOrganizer?.name}
        right={can('editEvent') ? <button onClick={() => go('event-editor', { id: null })} aria-label="Create event" className="p-2 text-indigo-600"><Plus className="w-6 h-6" /></button> : undefined} />

      <div className="px-4 pt-4 space-y-4">
        {activeRole === 'team' && (
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-[12.5px] text-amber-800 dark:text-amber-200">Team member access. Enabled: {Object.entries(teamMember?.permissions || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}.</p>
          </Card>
        )}

        {can('finances') && (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {RANGES.map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}</Chip>)}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Kpi icon={CalendarDays} label="Events" value={String(events.length)} />
              <Kpi icon={Users} label="Tickets sold" value={String(ticketsSold)} />
              <Kpi icon={DollarSign} label="Revenue" value={money(revenue)} />
            </div>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Revenue</p>
                <Segmented className="w-52" options={['This Week', 'This Month', 'This Year']} value={chart} onChange={setChart} />
              </div>
              <div className="flex items-end gap-1.5 h-32">
                {chartData.map((c, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-indigo-500/90" style={{ height: `${Math.max(3, (c.value / maxVal) * 100)}%` }} title={money(c.value)} />
                    <span className="text-[10px] text-slate-400">{c.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        <Card className="p-3">
          <div className="grid grid-cols-4 gap-2">
            {quick.filter((q) => can(q.perm)).map((q) => (
              <button key={q.label} onClick={() => go(q.route)} className="py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5">
                <q.icon className="w-5 h-5 text-indigo-600" />
                <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-200">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {can('editEvent') && <Button full icon={<Plus className="w-4 h-4" />} onClick={() => go('event-editor', { id: null })}>Create new event</Button>}

        <Segmented options={['Upcoming', 'Past', 'Draft']} value={section} onChange={setSection} />
        <div className="space-y-3">
          {filtered.length === 0 && <EmptyState title={`No ${section.toLowerCase()} events`} body={section === 'Draft' ? 'Drafts autosave as you build an event.' : 'Create an event to get started.'}
            action={can('editEvent') ? <Button size="sm" onClick={() => go('event-editor', { id: null })}>Create event</Button> : undefined} icon={<CalendarDays className="w-6 h-6" />} />}
          {filtered.map((e: any) => (
            <Card key={e.id} className="p-4">
              <div className="flex gap-3">
                <img src={e.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14.5px] truncate text-slate-900 dark:text-white">{e.title}</p>
                  <p className="text-[12px] text-slate-500">{fmtDate(e.startDate)} · {fmtTime(e.startTime)}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge tone="indigo">{e.category}</Badge>
                    <Badge tone={e.status === 'draft' ? 'amber' : 'green'}>{e.status}</Badge>
                    <Badge tone="slate">{e.sold}/{e.capacity} sold</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setMenu(e)}>Manage</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => go('event', { id: e.id })}>Preview</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={!!menu} onClose={() => setMenu(null)} title={menu?.title}>
        <div className="-mx-1">
          {can('editEvent') && <Row icon={<PencilLine className="w-4 h-4" />} label="Edit event" onClick={() => { go('event-editor', { id: menu.id }); setMenu(null); }} />}
          {can('attendees') && <Row icon={<Users className="w-4 h-4" />} label="View attendees" onClick={() => { go('org-roster', { eventId: menu.id }); setMenu(null); }} />}
          {can('attendees') && <Row icon={<ListChecks className="w-4 h-4" />} label="Orders" onClick={() => { go('org-orders', { eventId: menu.id }); setMenu(null); }} />}
          {can('editEvent') && <Row icon={<LayoutGrid className="w-4 h-4" />} label="Seating & placement" onClick={() => { go('org-layouts', { eventId: menu.id }); setMenu(null); }} />}
          {can('scan') && <Row icon={<QrCode className="w-4 h-4" />} label="Scan tickets" onClick={() => { go('org-scan', { eventId: menu.id }); setMenu(null); }} />}
          {can('announcements') && <Row icon={<Megaphone className="w-4 h-4" />} label="Make announcement" onClick={() => { go('org-announcements', { eventId: menu.id, compose: true }); setMenu(null); }} />}
          {can('coupon') && <Row icon={<Tag className="w-4 h-4" />} label="Coupons" onClick={() => { go('org-coupons', { eventId: menu.id }); setMenu(null); }} />}
          {can('resend') && <Row icon={<Mail className="w-4 h-4" />} label="Resend tickets" onClick={() => { setConfirmResend(menu); setMenu(null); }} />}
          <Row icon={<Send className="w-4 h-4" />} label="Marketing" onClick={() => { go('org-marketing', { eventId: menu.id }); setMenu(null); }} />
          {can('deleteEvent') && <Row icon={<Trash2 className="w-4 h-4" />} label="Delete event" danger onClick={() => { setConfirmDel(menu); setMenu(null); }} />}
        </div>
      </Sheet>

      <Confirm open={!!confirmDel} title="Delete this event?" danger confirmLabel="Delete"
        body={`“${confirmDel?.title}” and its schedule will be removed. Existing tickets stay in attendee wallets until refunded.`}
        onCancel={() => setConfirmDel(null)} onConfirm={() => { deleteEvent(confirmDel.id); setConfirmDel(null); }} />
      <Confirm open={!!confirmResend} title="Resend all tickets?" confirmLabel="Resend"
        body="Every valid ticket holder for this event will receive their ticket email again."
        onCancel={() => setConfirmResend(null)} onConfirm={() => { resendTickets(confirmResend.id); setConfirmResend(null); }} />
    </Screen>
  );
};

const Kpi: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <Card className="p-3">
    <Icon className="w-4 h-4 text-indigo-600" />
    <p className="text-[17px] font-bold mt-1.5 text-slate-900 dark:text-white leading-tight">{value}</p>
    <p className="text-[11px] text-slate-500">{label}</p>
  </Card>
);

export default Dashboard;
