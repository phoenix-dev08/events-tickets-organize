import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, SearchInput, Chip, EmptyState, Sheet, Confirm, Select } from '@/components/kit';
import { money, fmtDate } from '@/lib/helpers';
import { ListChecks, Download, Users } from 'lucide-react';

export const Orders: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, refundOrder, deleteOrder, can } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [eventId, setEventId] = useState(current.params?.eventId || 'All');
  const [detail, setDetail] = useState<any>(null);
  const [refund, setRefund] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const events = sel.orgEvents(myOrganizerId);

  if (!can('attendees')) return <PermissionBlock title="Orders" />;

  const orders = sel.orgOrders(myOrganizerId).filter((o: any) => {
    const ev = sel.event(o.eventId);
    const s = q.toLowerCase();
    const match = !q || o.buyerName?.toLowerCase().includes(s) || o.buyerEmail?.toLowerCase().includes(s) || o.transactionId.toLowerCase().includes(s) || ev?.title.toLowerCase().includes(s) || o.number?.toLowerCase().includes(s);
    return match && (status === 'All' || o.status === status.toLowerCase()) && (eventId === 'All' || o.eventId === eventId);
  });

  return (
    <Screen>
      <TopBar title="Orders" subtitle={`${orders.length} orders`} onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search attendee, email, transaction ID" />
        <Select value={eventId} onChange={setEventId} options={[{ value: 'All', label: 'All events' }, ...events.map((e: any) => ({ value: e.id, label: e.title }))]} />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Paid', 'Refunded'].map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}
        </div>
        {orders.length === 0 && <EmptyState title="No orders match your filters" icon={<ListChecks className="w-6 h-6" />} action={<Button size="sm" onClick={() => { setQ(''); setStatus('All'); setEventId('All'); }}>Clear filters</Button>} />}
        {orders.map((o: any) => {
          const ev = sel.event(o.eventId);
          const items = db.tickets.filter((t: any) => t.orderId === o.id);
          return (
            <Card key={o.id} className="p-4" onClick={() => setDetail(o)}>
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{o.buyerName}</p>
                  <p className="text-[12px] text-slate-500 truncate">{o.buyerEmail}</p>
                  <p className="text-[12px] text-slate-500 truncate">{ev?.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge tone={o.status === 'paid' ? 'green' : 'rose'}>{o.status}</Badge>
                    <Badge tone="slate">{items.length} tickets</Badge>
                    <Badge tone="slate">{o.transactionId}</Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[15px] text-slate-900 dark:text-white">{money(o.total)}</p>
                  <p className="text-[11.5px] text-slate-500">{fmtDate(o.createdAt)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Sheet open={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.number || ''}`}
        footer={<div className="flex gap-2">
          {detail?.status === 'paid' && can('finances') && <Button variant="outline" full onClick={() => { setRefund(detail); setDetail(null); }}>Refund</Button>}
          <Button variant="danger" full onClick={() => { setDel(detail); setDetail(null); }}>Delete</Button>
        </div>}>
        {detail && (
          <div className="space-y-3 text-[13.5px]">
            <KV k="Attendee" v={detail.buyerName} /><KV k="Email" v={detail.buyerEmail} />
            <KV k="Event" v={sel.event(detail.eventId)?.title} />
            <KV k="Transaction ID" v={detail.transactionId} />
            <KV k="Date" v={fmtDate(detail.createdAt)} />
            <KV k="Status" v={detail.status} />
            <KV k="Subtotal" v={money(detail.subtotal)} />
            {detail.discount > 0 && <KV k="Discount" v={`−${money(detail.discount)}`} />}
            <KV k="Fees" v={money(detail.adminFee + detail.paymentFee)} />
            <KV k="Total" v={money(detail.total)} />
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="font-semibold mb-1 text-slate-900 dark:text-white">Tickets</p>
              {db.tickets.filter((t: any) => t.orderId === detail.id).map((t: any) => {
                const places = sel.placementsForTicket(t.id);
                return (
                  <div key={t.id} className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">{t.holderName} · {t.ticketTypeTitle}</span>
                    <span className="text-slate-500">{places.map((p: any) => sel.unit(p.unitId)?.label).join(', ') || 'Unassigned'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Sheet>

      <Confirm open={!!refund} title="Refund this order?" danger confirmLabel="Refund order"
        body="The sandbox payment will be reversed, tickets invalidated, placements released and the attendee notified."
        onCancel={() => setRefund(null)} onConfirm={() => { refundOrder(refund.id); setRefund(null); }} />
      <Confirm open={!!del} title="Delete this order?" danger confirmLabel="Delete"
        body="This permanently removes the order, its tickets and payment record."
        onCancel={() => setDel(null)} onConfirm={() => { deleteOrder(del.id); setDel(null); }} />
    </Screen>
  );
};

export const Roster: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, toast, can, go } = useApp();
  const events = sel.orgEvents(myOrganizerId);
  const [eventId, setEventId] = useState(current.params?.eventId || db.showcaseEventId);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');

  if (!can('attendees')) return <PermissionBlock title="Attendee list" />;

  const tickets = db.tickets.filter((t: any) => t.eventId === eventId).filter((t: any) => {
    const s = q.toLowerCase();
    const match = !q || t.holderName.toLowerCase().includes(s) || t.holderEmail.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
    if (!match) return false;
    if (filter === 'Checked In') return t.checkInStatus === 'Checked In';
    if (filter === 'Not Checked In') return t.checkInStatus !== 'Checked In';
    if (filter === 'Unassigned') return sel.placementsForTicket(t.id).length === 0;
    return true;
  });

  const exportCsv = () => {
    const rows = [['Attendee', 'Email', 'Ticket Type', 'Ticket Code', 'Check-In', 'Placements']];
    tickets.forEach((t: any) => rows.push([t.holderName, t.holderEmail, t.ticketTypeTitle, t.code, t.checkInStatus,
    sel.placementsForTicket(t.id).map((p: any) => `${db.layouts.find((l: any) => l.id === p.layoutId)?.name}: ${sel.unit(p.unitId)?.label}`).join(' | ')]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'attendees.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported with placement columns');
  };

  return (
    <Screen>
      <TopBar title="Attendees" subtitle={`${tickets.length} tickets`} onBack={back}
        right={<button onClick={exportCsv} aria-label="Export CSV" className="p-2 text-indigo-600"><Download className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <Select value={eventId} onChange={setEventId} options={events.map((e: any) => ({ value: e.id, label: e.title }))} />
        <SearchInput value={q} onChange={setQ} placeholder="Search attendee, email or code" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Checked In', 'Not Checked In', 'Unassigned'].map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
        </div>
        {tickets.length === 0 && <EmptyState title="No attendees match filters" icon={<Users className="w-6 h-6" />} />}
        {tickets.slice(0, 120).map((t: any) => {
          const places = sel.placementsForTicket(t.id);
          return (
            <Card key={t.id} className="p-3.5">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[14px] text-slate-900 dark:text-white truncate">{t.holderName}</p>
                  <p className="text-[12px] text-slate-500 truncate">{t.holderEmail}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge tone="indigo">{t.ticketTypeTitle}</Badge>
                    <Badge tone={t.checkInStatus === 'Checked In' ? 'green' : t.checkInStatus === 'Checked Out' ? 'amber' : 'slate'}>{t.checkInStatus}</Badge>
                    {places.map((p: any) => <Badge key={p.id} tone="blue">{sel.unit(p.unitId)?.label}</Badge>)}
                    {places.length === 0 && <Badge tone="amber">Unassigned</Badge>}
                    {t.status === 'refunded' && <Badge tone="rose">Refunded</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {tickets.length > 120 && <p className="text-center text-[12.5px] text-slate-500">Showing first 120 of {tickets.length}</p>}
      </div>
    </Screen>
  );
};

export const PermissionBlock: React.FC<{ title: string }> = ({ title }) => {
  const { back } = useApp();
  return (
    <Screen>
      <TopBar title={title} onBack={back} />
      <EmptyState title="You don't have permission" body="Your organizer hasn't granted access to this area. Ask them to enable it in Team Members." />
    </Screen>
  );
};

const KV: React.FC<{ k: string; v: any }> = ({ k, v }) => (
  <div className="flex justify-between gap-3"><span className="text-slate-500">{k}</span><span className="font-medium text-right text-slate-900 dark:text-white">{v || '—'}</span></div>
);
