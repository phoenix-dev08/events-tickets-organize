import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Field, Select, Badge, Sheet } from '@/components/kit';
import { money } from '@/lib/helpers';
import { CreditCard, Building2, Apple, ShieldCheck, Lock } from 'lucide-react';

const METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'bank', label: 'Bank', icon: Building2 },
  { id: 'klarna', label: 'Klarna', icon: CreditCard },
  { id: 'link', label: 'Stripe Link', icon: CreditCard },
  { id: 'apple', label: 'Apple Pay', icon: Apple },
  { id: 'google', label: 'Google Pay', icon: CreditCard },
];

const Checkout: React.FC = () => {
  const { back, cart, sel, cartTotals, user, completePurchase, resetTo, toast, checkout, track } = useApp();
  const event = sel.event(cart[0]?.eventId);
  const [method, setMethod] = useState('card');
  const [form, setForm] = useState({ fullName: user?.name || '', country: 'United States', address: '', city: '', state: '', zip: '' });
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', exp: '12/28', cvc: '123' });
  const [errors, setErrors] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const [info, setInfo] = useState(false);

  React.useEffect(() => { track('checkout_started', { eventId: event?.id }); }, []); // eslint-disable-line

  const suggestions = ['747 Howard St, San Francisco, CA 94103', '1200 Market St, San Francisco, CA 94102', '55 Music Row, Nashville, TN 37203'];

  const pay = () => {
    const e: any = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.country) e.country = 'Required';
    if (method === 'card' && card.number.replace(/\s/g, '').length < 15) e.number = 'Use the demo card 4242 4242 4242 4242';
    setErrors(e);
    if (Object.keys(e).length) return;
    setProcessing(true);
    setTimeout(() => {
      const res = completePurchase({ fullName: form.fullName, address: form, method: method === 'card' ? 'Card •••• 4242' : METHODS.find((m) => m.id === method)?.label });
      setProcessing(false);
      resetTo('order-success', res);
    }, 1200);
  };

  if (!cart.length) { return <Screen><TopBar title="Checkout" onBack={back} /><div className="p-6 text-center text-slate-500">Your cart is empty.</div></Screen>; }

  return (
    <Screen>
      <TopBar title="Checkout" subtitle={event?.title} onBack={back} />
      <div className="px-4 pt-4 space-y-4">
        <Card className="p-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <p className="text-[12.5px] text-emerald-800 dark:text-emerald-200">Sandbox mode — no real charges are processed. Use card 4242 4242 4242 4242.</p>
        </Card>

        <Card className="p-4">
          <p className="font-semibold text-[14.5px] mb-3 text-slate-900 dark:text-white">Order summary</p>
          {cart.map((i: any) => {
            const tt = sel.ticketTypes(i.eventId).find((t: any) => t.id === i.ticketTypeId);
            return <div key={i.id} className="flex justify-between text-[13.5px] py-1"><span className="text-slate-600 dark:text-slate-300">{tt?.title} × {i.qty}</span><span>{money((tt?.price || 0) * i.qty)}</span></div>;
          })}
          {Object.values(checkout.placement).map((p: any, idx: number) => (
            <div key={idx} className="flex justify-between text-[13px] py-1 text-slate-500"><span>Placement · {p.label}</span><span>{p.priceAdjust ? money(p.priceAdjust) : 'Included'}</span></div>
          ))}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
          <div className="flex justify-between text-[13.5px] py-0.5"><span className="text-slate-600 dark:text-slate-300">Subtotal</span><span>{money(cartTotals.subtotal)}</span></div>
          {cartTotals.discount > 0 && <div className="flex justify-between text-[13.5px] py-0.5 text-emerald-600"><span>Discount</span><span>−{money(cartTotals.discount)}</span></div>}
          {!cartTotals.absorbed && <>
            <div className="flex justify-between text-[13.5px] py-0.5"><span className="text-slate-600 dark:text-slate-300">Admin fee</span><span>{money(cartTotals.adminFee)}</span></div>
            <div className="flex justify-between text-[13.5px] py-0.5"><span className="text-slate-600 dark:text-slate-300">Processing</span><span>{money(cartTotals.paymentFee)}</span></div>
          </>}
          <div className="flex justify-between font-bold text-[16px] mt-2 text-slate-900 dark:text-white"><span>Total</span><span>{money(cartTotals.total)}</span></div>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Billing details</p>
          <Field label="Full name" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} error={errors.fullName} required />
          <Select label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} options={['United States', 'Canada', 'United Kingdom', 'Nigeria', 'Australia']} error={errors.country} required />
          <Field label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} error={errors.address} required placeholder="Start typing your address" />
          {form.address.length > 2 && !suggestions.includes(form.address) && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.filter((s) => s.toLowerCase().includes(form.address.toLowerCase().slice(0, 4))).map((s) => (
                <button key={s} onClick={() => { const [a, c, st] = s.split(', '); setForm((f) => ({ ...f, address: s, city: c, state: st?.split(' ')[0] || '' })); }}
                  className="w-full text-left px-3 py-2.5 text-[13px] text-slate-600 dark:text-slate-300">{s}</button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="font-semibold text-[14.5px] mb-3 text-slate-900 dark:text-white">Payment method</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`h-16 rounded-xl border text-[12px] font-semibold flex flex-col items-center justify-center gap-1 ${method === m.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                <m.icon className="w-4 h-4" />{m.label}
              </button>
            ))}
          </div>
          {method === 'card' ? (
            <div className="space-y-3 mt-4">
              <Field label="Card number" value={card.number} onChange={(v) => setCard((c) => ({ ...c, number: v }))} error={errors.number} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" value={card.exp} onChange={(v) => setCard((c) => ({ ...c, exp: v }))} />
                <Field label="CVC" value={card.cvc} onChange={(v) => setCard((c) => ({ ...c, cvc: v }))} />
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[13px] text-slate-600 dark:text-slate-300">
              {METHODS.find((m) => m.id === method)?.label} is simulated in this sandbox. Tap Pay to complete an approved test transaction.
              <button onClick={() => setInfo(true)} className="block mt-1 text-indigo-600 font-medium">How sandbox payments work</button>
            </div>
          )}
        </Card>

        <Button full size="lg" disabled={processing} onClick={pay} icon={<Lock className="w-4 h-4" />}>
          {processing ? 'Processing payment…' : `Pay ${money(cartTotals.total)}`}
        </Button>
        <p className="text-center text-[11.5px] text-slate-400 pb-4">By paying you agree to the Terms of Use and Privacy Policy.</p>
      </div>

      <Sheet open={info} onClose={() => setInfo(false)} title="Sandbox payments">
        <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Redeemed Events routes live payments through Stripe Connect. In this demo the payment adapter is isolated and always returns an approved test authorization, so no card is charged and no real account is touched.
          Orders, payments, tickets and organizer revenue are still created exactly as they would be in production.
        </p>
      </Sheet>
    </Screen>
  );
};

export default Checkout;
