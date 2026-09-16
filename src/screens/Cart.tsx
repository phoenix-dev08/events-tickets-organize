import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Field, EmptyState, Confirm, Badge, Sheet } from '@/components/kit';
import { money } from '@/lib/helpers';
import { ShoppingCart, Trash2, Tag } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, db, sel, removeFromCart, cartTotals, go, back, checkout, applyCoupon, removeCoupon, setTab } = useApp();
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [showCodes, setShowCodes] = useState(false);
  const eventId = cart[0]?.eventId;
  const event = eventId ? sel.event(eventId) : null;
  const coupons = eventId ? sel.coupons(eventId).filter((c: any) => c.active) : [];

  if (!cart.length) {
    return (
      <Screen>
        <TopBar title="Cart" onBack={back} />
        <EmptyState title="Your cart is empty" body="Browse events and add tickets to get started."
          icon={<ShoppingCart className="w-6 h-6" />} action={<Button onClick={() => setTab('explore')}>Explore events</Button>} />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Cart" subtitle={event?.title} onBack={back} />
      <div className="px-4 pt-4 space-y-3">
        {cart.map((item: any) => {
          const tt = db.ticketTypes.find((t: any) => t.id === item.ticketTypeId);
          return (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{tt?.title}</p>
                  <p className="text-[12.5px] text-slate-500">{event?.title}</p>
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1">{item.qty} × {money(tt?.price || 0)}</p>
                  {tt?.absorbFees && <Badge tone="blue" className="mt-2">Organizer absorbs fees</Badge>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[15px] text-slate-900 dark:text-white">{money((tt?.price || 0) * item.qty)}</p>
                  <button onClick={() => setConfirm(item)} aria-label="Remove ticket" className="mt-3 text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          );
        })}

        <Card className="p-4">
          <p className="text-[13.5px] font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white"><Tag className="w-4 h-4" />Coupon</p>
          {checkout.coupon ? (
            <div className="flex items-center justify-between">
              <div><Badge tone="green">{checkout.coupon.code}</Badge><span className="text-[12.5px] text-slate-500 ml-2">−{money(cartTotals.discount)}</span></div>
              <Button size="sm" variant="ghost" onClick={removeCoupon}>Remove</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Field value={code} onChange={setCode} placeholder="Enter code" className="flex-1" />
              <Button onClick={() => { if (applyCoupon(code)) setCode(''); }}>Apply</Button>
            </div>
          )}
          {coupons.length > 0 && !checkout.coupon && (
            <button onClick={() => setShowCodes(true)} className="text-[12.5px] text-indigo-600 font-medium mt-2">View available codes</button>
          )}
        </Card>

        <Card className="p-4 space-y-2 text-[14px]">
          <Line label="Subtotal" value={money(cartTotals.subtotal)} />
          {cartTotals.discount > 0 && <Line label="Discount" value={`−${money(cartTotals.discount)}`} tone="text-emerald-600" />}
          {cartTotals.placementAdjust !== 0 && <Line label="Placement adjustment" value={money(cartTotals.placementAdjust)} />}
          {cartTotals.absorbed ? (
            <p className="text-[12.5px] text-emerald-600">Service fees absorbed by the organizer</p>
          ) : (
            <>
              <Line label="Admin fee (3.5%)" value={money(cartTotals.adminFee)} />
              <Line label="Payment processing (2.9% + $0.30)" value={money(cartTotals.paymentFee)} />
            </>
          )}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <div className="flex justify-between font-bold text-[16px] text-slate-900 dark:text-white"><span>Total</span><span>{money(cartTotals.total)}</span></div>
        </Card>

        <Button full size="lg" onClick={() => go('holders')}>Continue</Button>
      </div>

      <Confirm open={!!confirm} title="Remove tickets?" body="These tickets will be removed from your cart." danger confirmLabel="Remove"
        onCancel={() => setConfirm(null)} onConfirm={() => { removeFromCart(confirm.ticketTypeId); setConfirm(null); }} />

      <Sheet open={showCodes} onClose={() => setShowCodes(false)} title="Available coupon codes">
        <div className="space-y-2">
          {coupons.map((c: any) => (
            <Card key={c.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-slate-900 dark:text-white">{c.code}</p>
                <p className="text-[12px] text-slate-500">{c.percent}% off · max {money(c.maxDiscount)}</p>
              </div>
              <Button size="sm" onClick={() => { applyCoupon(c.code); setShowCodes(false); }}>Apply</Button>
            </Card>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
};

const Line: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">{label}</span><span className={tone || 'text-slate-900 dark:text-white'}>{value}</span></div>
);

export default Cart;
