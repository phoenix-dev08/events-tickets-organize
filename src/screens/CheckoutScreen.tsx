import React, { useEffect, useState } from 'react';
import { USER, money } from '@/data/redeemed';
import { CTA, Divider, Icon, Label, Press } from '@/components/ui/kit';
import { Steps, TopBar } from '@/components/Chrome';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';


const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string }> = ({
  label, value, onChange, type = 'text', hint,
}) => (
  <label className="block">
    <span className="text-[11px] font-bold uppercase tracking-label text-ink-300">{label}</span>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="mt-1.5 h-[52px] w-full rounded-2xl border border-ink/12 bg-white px-4 text-[14.5px] font-semibold text-ink outline-none transition-colors focus:border-coral/60"
    />
    {hint && <span className="mt-1.5 block text-[11px] text-ink-300">{hint}</span>}
  </label>
);

const CheckoutScreen: React.FC = () => {
  const { activeEvent, order, totals, go, showToast, requireAuth, isAuthed } = useDemo();
  const { user, displayName } = useAuth();
  const [name, setName] = useState(displayName !== 'Guest' ? displayName : USER.name);
  const [email, setEmail] = useState(user?.email || USER.email);
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [applyAll, setApplyAll] = useState(true);
  const [diet, setDiet] = useState('No restrictions');
  const [firstTime, setFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (displayName && displayName !== 'Guest') setName(displayName);
  }, [user, displayName]);

  const proceed = () => {
    fetch('https://famous.ai/api/crm/6aaaff412da03efcb2cca2ff/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, name, phone: phone || undefined, sms_opt_in: smsOptIn === true,
        source: 'checkout', tags: ['customer', 'redeem-conference'],
      }),
    }).catch(() => {});
    go({ k: 'tables' });
  };

  const next = () => {
    if (!name.trim() || !email.includes('@')) {
      showToast('Add your name and a valid email');
      return;
    }
    const ok = requireAuth({
      headline: 'Almost there',
      sub: 'Create an account so your ticket, table and receipt are saved to you — on any device.',
      then: proceed,
    });
    if (ok) proceed();
  };


  return (
    <div className="pb-40">
      <TopBar title="Checkout" sub={activeEvent.title} />
      <Steps steps={['Tickets', 'Placement', 'Payment']} active={0} />

      {/* Selected ticket */}
      <div className="px-5 pt-7">
        <Label className="text-coral">Your order</Label>
        <div className="mt-3 flex items-center gap-3.5 rounded-[24px] border border-ink/10 bg-white p-4 shadow-soft">
          <img src={activeEvent.image} alt="" className="h-[68px] w-[56px] rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold leading-tight text-ink">
              {order.qty} × {totals.tierName}
            </p>
            <p className="mt-1 text-[12px] text-ink-400">{activeEvent.dateLabel.replace(', 2026', '')} · {activeEvent.venue}</p>
            <p className="mt-1.5 text-[11.5px] font-bold text-sage">Free shipping · instant digital delivery</p>
          </div>
          <p className="shrink-0 font-display text-[21px] text-ink">{money(totals.subtotal)}</p>
        </div>
      </div>

      {/* Attendee info */}
      <div className="mt-8 px-5">
        <div className="flex items-end justify-between">
          <div>
            <Label className="text-coral">Step one</Label>
            <h2 className="mt-1 font-display text-[23px] leading-tight text-ink">Attendee information</h2>
          </div>
          {order.qty > 1 && (
            <Press onClick={() => setApplyAll(v => !v)}
              className={`flex min-h-[40px] items-center gap-2 rounded-full px-3 text-[11.5px] font-bold ${applyAll ? 'bg-ink text-ivory' : 'bg-ink/[0.06] text-ink-600'}`}>
              <Icon.Check className="h-3.5 w-3.5" />
              Apply to all {order.qty}
            </Press>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} type="email" hint="Your ticket and QR code are sent here." />
          <Field label="Phone number (optional)" value={phone} onChange={setPhone} type="tel" />
          <Press onClick={() => setSmsOptIn(v => !v)} className="flex items-start gap-3">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${smsOptIn ? 'border-coral bg-coral text-white' : 'border-ink/25'}`}>
              {smsOptIn && <Icon.Check className="h-3.5 w-3.5" />}
            </span>
            <span className="text-[12px] leading-snug text-ink-400">
              Text me event updates and check-in reminders. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
            </span>
          </Press>
        </div>
      </div>

      {/* Ticket questions */}
      <div className="mt-8 px-5">
        <Label className="text-ink-300">Ticket questions</Label>
        <div className="mt-3 rounded-[24px] border border-ink/10 bg-white p-4">
          <p className="text-[13.5px] font-bold text-ink">Dinner preference</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['No restrictions', 'Vegetarian', 'Gluten-free', 'Pescatarian'].map(d => (
              <Press key={d} onClick={() => setDiet(d)}
                className={`min-h-[40px] rounded-full px-3.5 text-[12px] font-bold ${diet === d ? 'bg-ink text-ivory' : 'bg-ink/[0.05] text-ink-600'}`}>
                {d}
              </Press>
            ))}
          </div>
          <Divider className="my-4" />
          <p className="text-[13.5px] font-bold text-ink">Is this your first Redeem Conference?</p>
          <div className="mt-3 flex gap-2">
            {[true, false].map(v => (
              <Press key={String(v)} onClick={() => setFirstTime(v)}
                className={`min-h-[40px] flex-1 rounded-xl text-center text-[12.5px] font-bold ${firstTime === v ? 'bg-coral text-white' : 'bg-ink/[0.05] text-ink-600'}`}>
                {v ? 'Yes, first time' : 'I’ve been before'}
              </Press>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 px-5">
        <div className="rounded-[24px] bg-ink-900 p-5 text-ivory">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ivory/65">Subtotal</span>
            <span className="font-bold">{money(totals.subtotal)}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[13px]">
            <span className="text-ivory/65">Service fee</span>
            <span className="font-bold">{money(totals.fee)}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[13px]">
            <span className="text-ivory/65">Shipping</span>
            <span className="font-bold text-champagne">Free</span>
          </div>
          <div className="my-4 h-px bg-white/12" />
          <div className="flex items-end justify-between">
            <span className="text-[11px] font-bold uppercase tracking-label text-ivory/55">Total due</span>
            <span className="font-display text-[27px] leading-none text-champagne">{money(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[72px] z-40 px-4 pb-4 pt-10"
        style={{ background: 'linear-gradient(to top, rgba(251,248,243,1) 45%, rgba(251,248,243,0))' }}>
        {!isAuthed && (
          <p className="mb-2.5 text-center text-[11.5px] font-semibold text-ink-400">
            You’ll create a free account next so your ticket is saved to you.
          </p>
        )}
        <CTA onClick={next}>
          Continue to placement
          <Icon.Chevron className="h-4 w-4" />
        </CTA>
      </div>

    </div>
  );
};

export default CheckoutScreen;
