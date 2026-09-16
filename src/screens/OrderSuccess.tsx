import React from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, Card, Button, Badge, Sheet } from '@/components/kit';
import { money, fmtDate } from '@/lib/helpers';
import { CheckCircle2 } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const { current, sel, db, setTab, resetTo, go } = useApp();
  const p = current.params || {};
  const event = sel.event(p.eventId);
  const order = db.orders.find((o: any) => o.id === p.orderId);
  const tickets = db.tickets.filter((t: any) => t.orderId === p.orderId);
  const [receipt, setReceipt] = React.useState(false);

  return (
    <Screen>
      <div className="px-5 pt-12 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 grid place-items-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-[22px] font-bold mt-4 text-slate-900 dark:text-white">You're going!</h1>
        <p className="text-[14px] text-slate-500 mt-1">Your order is confirmed and your tickets are ready.</p>
      </div>
      <div className="px-4 mt-6 space-y-3">
        <Card className="p-4 space-y-2 text-[13.5px]">
          <Row label="Event" value={event?.title} />
          <Row label="Date" value={event ? fmtDate(event.startDate) : '—'} />
          <Row label="Order number" value={p.number || order?.number} />
          <Row label="Transaction ID" value={p.transactionId || order?.transactionId} />
          <Row label="Tickets" value={`${p.count || tickets.length}`} />
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex justify-between font-bold text-[15px] text-slate-900 dark:text-white"><span>Total paid</span><span>{money(p.total ?? order?.total ?? 0)}</span></div>
          {order?.couponCode && <Badge tone="green">Coupon {order.couponCode} applied</Badge>}
        </Card>

        <div className="space-y-2">
          {tickets.map((t: any) => {
            const places = sel.placementsForTicket(t.id);
            return (
              <Card key={t.id} className="p-4 flex items-center justify-between" onClick={() => go('ticket', { id: t.id })}>
                <div>
                  <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{t.holderName}</p>
                  <p className="text-[12.5px] text-slate-500">{t.ticketTypeTitle} · {t.code}</p>
                  {places.map((pl: any) => <Badge key={pl.id} tone="indigo" className="mt-1 mr-1">{sel.unit(pl.unitId)?.label}</Badge>)}
                </div>
                <span className="text-[13px] font-semibold text-indigo-600">View</span>
              </Card>
            );
          })}
        </div>

        <Button full size="lg" onClick={() => setTab('tickets')}>View tickets</Button>
        <Button full variant="secondary" onClick={() => setReceipt(true)}>View receipt</Button>
        <Button full variant="ghost" onClick={() => setTab('explore')}>Return home</Button>
      </div>

      <Sheet open={receipt} onClose={() => setReceipt(false)} title="Receipt">
        <div className="space-y-2 text-[13.5px]">
          <Row label="Order" value={order?.number} />
          <Row label="Transaction" value={order?.transactionId} />
          <Row label="Method" value={order?.method || 'Card •••• 4242'} />
          <Row label="Subtotal" value={money(order?.subtotal || 0)} />
          {order?.discount > 0 && <Row label="Discount" value={`−${money(order.discount)}`} />}
          <Row label="Admin fee" value={money(order?.adminFee || 0)} />
          <Row label="Processing" value={money(order?.paymentFee || 0)} />
          <Row label="Total" value={money(order?.total || 0)} />
        </div>
      </Sheet>
    </Screen>
  );
};

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><span className="font-medium text-right text-slate-900 dark:text-white">{value || '—'}</span></div>
);

export default OrderSuccess;
