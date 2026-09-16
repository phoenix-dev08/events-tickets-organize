import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Segmented, SearchInput, EmptyState, Sheet, Field, Row } from '@/components/kit';
import { money, fmtDate, relTime } from '@/lib/helpers';
import {
  Shield, Users, CalendarDays, ListChecks, LayoutGrid, Bell, Inbox, BarChart3, Wand2, Link2, RefreshCw, WifiOff, Timer,
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { db, sel, go, setModeration, toast } = useApp();
  const [tab, setTab] = useState('Overview');
  const [q, setQ] = useState('');

  const revenue = db.orders.filter((o: any) => o.status === 'paid').reduce((s: number, o: any) => s + o.total, 0);
  const stats = [
    { label: 'Users', value: db.users.length, icon: Users },
    { label: 'Organizers', value: db.organizers.length, icon: Shield },
    { label: 'Events', value: db.events.length, icon: CalendarDays },
    { label: 'Orders', value: db.orders.length, icon: ListChecks },
    { label: 'Tickets', value: db.tickets.length, icon: ListChecks },
    { label: 'GMV', value: money(revenue), icon: BarChart3 },
  ];

  return (
    <Screen>
      <TopBar title="Platform admin" subtitle="Redeemed Events" right={<button onClick={() => go('demo-controls')} className="p-2 text-indigo-600"><Wand2 className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Overview', 'Organizers', 'Events', 'Orders', 'Seating', 'Support', 'Campaigns'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3.5 h-9 rounded-full text-[13px] font-medium whitespace-nowrap border ${tab === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <Card key={s.label} className="p-3">
                  <s.icon className="w-4 h-4 text-indigo-600" />
                  <p className="text-[16px] font-bold mt-1.5 text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                </Card>
              ))}
            </div>
            <Card><Row icon={<Wand2 className="w-4 h-4" />} label="Demo controls" onClick={() => go('demo-controls')} />
              <Row icon={<Link2 className="w-4 h-4" />} label="Deep link tester" onClick={() => go('deep-links')} />
              <Row icon={<BarChart3 className="w-4 h-4" />} label="Analytics events" onClick={() => go('analytics')} />
            </Card>
          </>
        )}

        {tab === 'Organizers' && db.organizers.map((o: any) => (
          <Card key={o.id} className="p-4 flex items-center gap-3">
            <img src={o.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{o.name}</p>
              <p className="text-[12px] text-slate-500 truncate">{o.email} · {sel.orgEvents(o.id).length} events</p>
              <Badge tone={o.stripe?.connected ? 'green' : 'amber'} className="mt-1">{o.stripe?.verification}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setModeration('organizers', o.id, o.status === 'Active' ? 'Suspended' : 'Active'); toast(`${o.name} ${o.status === 'Active' ? 'suspended' : 'reactivated'}`); }}>{o.status === 'Active' ? 'Suspend' : 'Activate'}</Button>
          </Card>
        ))}

        {tab === 'Events' && (
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search events" />
            {db.events.filter((e: any) => !q || e.title.toLowerCase().includes(q.toLowerCase())).map((e: any) => (
              <Card key={e.id} className="p-3 flex items-center gap-3">
                <img src={e.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13.5px] truncate text-slate-900 dark:text-white">{e.title}</p>
                  <p className="text-[12px] text-slate-500">{sel.organizer(e.organizerId)?.name} · {e.sold}/{e.capacity}</p>
                </div>
                <Badge tone={e.status === 'published' ? 'green' : e.status === 'draft' ? 'amber' : 'rose'}>{e.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setModeration('events', e.id, e.status === 'published' ? 'archived' : 'published')}>{e.status === 'published' ? 'Suspend' : 'Publish'}</Button>
              </Card>
            ))}
          </>
        )}

        {tab === 'Orders' && db.orders.slice(0, 40).map((o: any) => (
          <Card key={o.id} className="p-3 flex justify-between">
            <div className="min-w-0"><p className="text-[13.5px] font-medium truncate text-slate-900 dark:text-white">{o.buyerName}</p><p className="text-[12px] text-slate-500 truncate">{sel.event(o.eventId)?.title} · {o.transactionId}</p></div>
            <div className="text-right"><p className="font-semibold text-[13.5px]">{money(o.total)}</p><Badge tone={o.status === 'paid' ? 'green' : 'rose'}>{o.status}</Badge></div>
          </Card>
        ))}

        {tab === 'Seating' && db.layouts.map((l: any) => {
          const units = sel.units(l.id);
          const over = units.filter((u: any) => sel.occupancy(u.id) > u.capacity);
          return (
            <Card key={l.id} className="p-4">
              <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{l.name}</p>
              <p className="text-[12px] text-slate-500">{sel.event(l.eventId)?.title} · {units.length} units</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge tone={over.length ? 'rose' : 'green'}>{over.length ? `${over.length} conflicts` : 'No conflicts'}</Badge>
                <Badge tone="slate">{db.placements.filter((p: any) => p.layoutId === l.id).length} placements</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {db.audit.filter((a: any) => a.layoutId === l.id).slice(0, 3).map((a: any) => (
                  <p key={a.id} className="text-[12px] text-slate-500">{a.detail} · {relTime(a.createdAt)}</p>
                ))}
              </div>
            </Card>
          );
        })}

        {tab === 'Support' && (
          <>
            {db.supportTickets.map((s: any) => (
              <Card key={s.id} className="p-4">
                <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{s.subject}</p>
                <p className="text-[12px] text-slate-500">{s.type} · {s.issueType} · {s.email}</p>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1">{s.description}</p>
                <Badge tone="amber" className="mt-2">{s.status}</Badge>
              </Card>
            ))}
            {db.enquiries.map((e: any) => (
              <Card key={e.id} className="p-3">
                <p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{e.name} → {sel.organizer(e.organizerId)?.name}</p>
                <p className="text-[12px] text-slate-500 line-clamp-2">{e.message}</p>
              </Card>
            ))}
            {db.mailingList.map((m: any) => (
              <Card key={m.id} className="p-3"><p className="text-[13px] text-slate-900 dark:text-white">{m.firstName} {m.lastName} · {m.email}</p><p className="text-[12px] text-slate-500">Mailing list · {m.role}</p></Card>
            ))}
          </>
        )}

        {tab === 'Campaigns' && (
          <>
            {db.announcements.map((a: any) => (
              <Card key={a.id} className="p-4">
                <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{a.subject}</p>
                <p className="text-[12px] text-slate-500">{sel.event(a.eventId)?.title} · {a.recipients} recipients · {a.status}</p>
              </Card>
            ))}
            {db.deliveries.slice(0, 10).map((d: any) => (
              <Card key={d.id} className="p-3"><p className="text-[13px] text-slate-900 dark:text-white">{d.type}</p><p className="text-[12px] text-slate-500">{d.to} · {relTime(d.at)}</p></Card>
            ))}
            {db.deliveries.length === 0 && db.announcements.length === 0 && <EmptyState title="No campaigns yet" icon={<Bell className="w-6 h-6" />} />}
          </>
        )}
      </div>
    </Screen>
  );
};

export const DemoControls: React.FC = () => {
  const { back, resetDemo, simulateNewOrder, simulateConflict, simulateReminder, simulatePayout, simulateWaitlistOpen, offline, setOffline, holdSeconds, setHoldSeconds, toast, activeRole, syncQueue, queue } = useApp();
  if (activeRole !== 'admin') return <Screen><TopBar title="Demo controls" onBack={back} /><EmptyState title="Admin only" body="These controls are hidden from attendees and organizers." /></Screen>;
  const items = [
    { t: 'Reset demo data', d: 'Restore the original seeded database', a: resetDemo, icon: RefreshCw },
    { t: 'Simulate new order', d: 'Creates a paid order on the showcase event', a: simulateNewOrder, icon: ListChecks },
    { t: 'Simulate placement conflict', d: 'Fills a table to capacity − 1', a: simulateConflict, icon: LayoutGrid },
    { t: 'Simulate event reminder', d: 'Sends a reminder notification to you', a: simulateReminder, icon: Bell },
    { t: 'Simulate payout sent', d: 'Adds a paid payout + organizer notification', a: simulatePayout, icon: BarChart3 },
    { t: 'Simulate waitlist opening', d: 'Frees a seat and promotes the next person', a: simulateWaitlistOpen, icon: Users },
  ];
  return (
    <Screen>
      <TopBar title="Demo controls" subtitle="Admin only" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        {items.map((i) => (
          <Card key={i.t} className="p-4 flex items-center justify-between" onClick={i.a}>
            <div className="flex items-center gap-3">
              <i.icon className="w-5 h-5 text-indigo-600" />
              <div><p className="font-semibold text-[14px] text-slate-900 dark:text-white">{i.t}</p><p className="text-[12px] text-slate-500">{i.d}</p></div>
            </div>
            <Button size="sm" variant="secondary">Run</Button>
          </Card>
        ))}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-indigo-600" />
            <div><p className="font-semibold text-[14px] text-slate-900 dark:text-white">Offline mode</p><p className="text-[12px] text-slate-500">{queue.length} queued actions</p></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={offline ? 'primary' : 'secondary'} onClick={() => { setOffline(!offline); toast(offline ? 'Back online' : 'Offline mode enabled'); }}>{offline ? 'On' : 'Off'}</Button>
            <Button size="sm" variant="outline" onClick={syncQueue}>Sync</Button>
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-indigo-600" />
            <div><p className="font-semibold text-[14px] text-slate-900 dark:text-white">Placement hold timer</p><p className="text-[12px] text-slate-500">Currently {holdSeconds}s</p></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setHoldSeconds(600); toast('Hold timer set to 10 minutes'); }}>10m</Button>
            <Button size="sm" variant="secondary" onClick={() => { setHoldSeconds(20); toast('Hold timer accelerated to 20 seconds'); }}>20s</Button>
          </div>
        </Card>
      </div>
    </Screen>
  );
};

export const DeepLinks: React.FC = () => {
  const { back, db, go, toast } = useApp();
  const [value, setValue] = useState(`redeemed://event/${db.showcaseEventId}`);
  const links = [
    { l: `redeemed://event/${db.showcaseEventId}`, d: 'Open showcase event' },
    { l: `redeemed://ticket/${db.tickets[0]?.id}`, d: 'Open a ticket' },
    { l: `redeemed://order/${db.orders[0]?.id}`, d: 'Open an order (organizer)' },
    { l: `redeemed://placement/lay_dinner`, d: 'Open dinner seating layout' },
    { l: 'redeemed://organizer/org_1', d: 'Open organizer dashboard' },
  ];
  const open = (link: string) => {
    const [, path] = link.split('redeemed://');
    const [kind, id] = (path || '').split('/');
    if (kind === 'event') go('event', { id });
    else if (kind === 'ticket') go('ticket', { id });
    else if (kind === 'order') go('org-orders', {});
    else if (kind === 'placement') go('org-layout', { layoutId: id });
    else if (kind === 'organizer') go('organize');
    else toast('Unknown deep link pattern', 'error');
  };
  return (
    <Screen>
      <TopBar title="Deep link tester" onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <Card className="p-4 space-y-3">
          <Field label="Deep link URL" value={value} onChange={setValue} />
          <Button full onClick={() => open(value)}>Open link</Button>
        </Card>
        {links.map((l) => (
          <Card key={l.l} className="p-3 flex items-center justify-between" onClick={() => open(l.l)}>
            <div className="min-w-0"><p className="text-[13px] font-mono truncate text-slate-900 dark:text-white">{l.l}</p><p className="text-[12px] text-slate-500">{l.d}</p></div>
            <Link2 className="w-4 h-4 text-indigo-600" />
          </Card>
        ))}
        <p className="text-[12px] text-slate-500">Universal Links require signed app association files, so the demo routes these patterns internally.</p>
      </div>
    </Screen>
  );
};

export const Analytics: React.FC = () => {
  const { db, back } = useApp();
  const counts: Record<string, number> = {};
  db.analytics.forEach((a: any) => { counts[a.name] = (counts[a.name] || 0) + 1; });
  const max = Math.max(1, ...Object.values(counts));
  return (
    <Screen>
      <TopBar title="Analytics" subtitle={`${db.analytics.length} events tracked`} onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <Card className="p-4 space-y-2">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[12.5px] text-slate-600 dark:text-slate-300"><span>{k}</span><span>{v}</span></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-1"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
          {Object.keys(counts).length === 0 && <EmptyState title="No analytics yet" body="Browse events and buy a ticket to generate events." />}
        </Card>
        <Card className="p-4">
          <p className="font-semibold text-[14px] mb-2 text-slate-900 dark:text-white">Recent events</p>
          {db.analytics.slice(0, 20).map((a: any) => (
            <div key={a.id} className="flex justify-between py-1.5 text-[12.5px] border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-700 dark:text-slate-200">{a.name}</span>
              <span className="text-slate-400">{relTime(a.at)}</span>
            </div>
          ))}
        </Card>
      </div>
    </Screen>
  );
};
