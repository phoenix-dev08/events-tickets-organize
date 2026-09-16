import React, { useEffect, useState } from 'react';
import { money } from '@/data/redeemed';
import { CTA, Divider, Icon, Label, Press } from '@/components/ui/kit';
import { Steps, TopBar } from '@/components/Chrome';
import { useDemo } from '@/contexts/DemoContext';

const Wallet: React.FC<{ kind: 'apple' | 'google'; active: boolean; onClick: () => void }> = ({ kind, active, onClick }) => (
  <Press onClick={onClick}
    className={`flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-2xl border-2 transition-colors ${active ? 'border-ink bg-ink text-ivory' : 'border-ink/12 bg-white text-ink'}`}>
    {kind === 'apple' ? (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7 1.4 0 1.8.8 3 .7 1.2 0 2-1.1 2.8-2.2.6-.9.9-1.7 1-1.8-.1 0-2.6-1-2.6-3.5zM14.6 5.9c.6-.8 1-1.8.9-2.9-1 0-2.1.6-2.8 1.5-.6.7-1 1.8-.9 2.8 1.1.1 2.2-.6 2.8-1.4z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 11v2.6h5.1c-.2 1.3-1.5 3.9-5.1 3.9-3 0-5.5-2.5-5.5-5.5S9 6.5 12 6.5c1.7 0 2.9.7 3.5 1.3l2-1.9C16.2 4.6 14.3 3.8 12 3.8 7.5 3.8 3.9 7.4 3.9 12s3.6 8.2 8.1 8.2c4.7 0 7.8-3.3 7.8-7.9 0-.5 0-.9-.1-1.3H12z" />
      </svg>
    )}
    <span className="text-[15px] font-bold">{kind === 'apple' ? 'Apple Pay' : 'Google Pay'}</span>
  </Press>
);

const SuccessBurst: React.FC = () => (
  <div className="relative grid h-28 w-28 place-items-center">
    <span className="absolute inset-0 rounded-full border border-sage/30" />
    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-sage/25" />
    <span className="grid h-20 w-20 place-items-center rounded-full bg-sage shadow-[0_18px_40px_-14px_rgba(63,125,98,0.9)]">
      <svg viewBox="0 0 48 48" className="h-9 w-9">
        <path d="M14 25l7 7 14-15" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="40" strokeDashoffset="40" className="animate-draw" />
      </svg>
    </span>
    {[0, 1, 2, 3, 4, 5].map(i => (
      <span key={i}
        className="absolute h-1.5 w-1.5 animate-float-up rounded-full bg-champagne"
        style={{ left: `${14 + i * 14}%`, bottom: '18%', animationDelay: `${i * 110}ms` }} />
    ))}
  </div>
);

const PaymentScreen: React.FC = () => {
  const { totals, order, activeEvent, go, setRoot, completePurchase } = useDemo();
  const [method, setMethod] = useState<'apple' | 'google' | 'card'>('apple');
  const [state, setState] = useState<'idle' | 'processing' | 'done'>('idle');


  useEffect(() => {
    if (state !== 'processing') return;
    const t = setTimeout(() => { completePurchase(); setState('done'); }, 1500);
    return () => clearTimeout(t);
  }, [state, completePurchase]);

  if (state === 'done') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-ink-900 px-6 py-16 text-center">
        <SuccessBurst />
        <h1 className="mt-8 font-display text-[32px] leading-tight text-ivory">You’re going</h1>
        <p className="mt-2 text-[13px] font-semibold text-champagne">Order RE-826194 · confirmed</p>

        <div className="mt-8 w-full rounded-[26px] border border-white/10 bg-white/[0.05] p-5 text-left">
          <Label className="text-champagne">{activeEvent.category}</Label>
          <p className="mt-1.5 font-display text-[22px] leading-tight text-ivory">{activeEvent.title}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label className="text-ivory/45">Dates</Label>
              <p className="mt-1 text-[13.5px] font-bold text-ivory">September 24–26</p>
            </div>
            <div>
              <Label className="text-ivory/45">Placement</Label>
              <p className="mt-1 text-[13.5px] font-bold text-ivory">Table {order.table ?? 7}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 w-full space-y-3">
          <CTA tone="gold" onClick={() => go({ k: 'ticket' })}>View Ticket</CTA>
          <div className="flex gap-3">
            <Press onClick={() => setRoot({ k: 'tickets' })}
              className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 text-[13.5px] font-bold text-ivory">
              <Icon.Wallet className="h-4 w-4" />Add to Wallet
            </Press>
            <Press onClick={() => setRoot({ k: 'explore' })}
              className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 text-[13.5px] font-bold text-ivory">
              <Icon.Share className="h-4 w-4" />Share Event
            </Press>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <TopBar title="Payment" sub={activeEvent.title} />
      <Steps steps={['Tickets', 'Placement', 'Payment']} active={2} />

      <div className="px-5 pt-7">
        <Label className="text-coral">Order summary</Label>
        <div className="mt-3 rounded-[24px] border border-ink/10 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14.5px] font-bold text-ink">{totals.tierName} Ticket × {order.qty || 1}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">{activeEvent.dateLabel.replace(', 2026', '')}</p>
            </div>
            <p className="text-[14.5px] font-bold text-ink">{money(totals.subtotal)}</p>
          </div>
          <Divider className="my-4" />
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-400">Service fee</span>
            <span className="font-bold text-ink">{money(totals.fee)}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[13px]">
            <span className="text-ink-400">Shipping</span>
            <span className="font-bold text-sage">Free</span>
          </div>
          <Divider className="my-4" />
          <div className="flex items-end justify-between">
            <span className="text-[11px] font-bold uppercase tracking-label text-ink-300">Total</span>
            <span className="font-display text-[28px] leading-none text-ink">{money(totals.total)}</span>
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-ivory-100 px-3.5 py-3">
            <Icon.Grid className="h-4 w-4 text-coral" />
            <span className="text-[12.5px] font-bold text-ink-600">Placement · Table {order.table ?? 7}</span>
            <Press onClick={() => go({ k: 'tables' })} className="ml-auto text-[11.5px] font-bold text-coral">Change</Press>
          </div>
        </div>
      </div>

      <div className="mt-8 px-5">
        <Label className="text-ink-300">Fast checkout</Label>
        <div className="mt-3 space-y-3">
          <Wallet kind="apple" active={method === 'apple'} onClick={() => setMethod('apple')} />
          <Wallet kind="google" active={method === 'google'} onClick={() => setMethod('google')} />
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-[11px] font-bold uppercase tracking-label text-ink-300">or pay another way</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <Press onClick={() => setMethod('card')}
          className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 transition-colors ${method === 'card' ? 'border-coral/50 bg-white' : 'border-ink/12 bg-white'}`}>
          <span className="grid h-10 w-14 place-items-center rounded-lg bg-ink/[0.06] text-ink">
            <Icon.Wallet className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-ink">Credit / Debit Card</span>
            <span className="mt-0.5 block text-[11.5px] text-ink-400">Visa, Mastercard, Amex</span>
          </span>
          <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${method === 'card' ? 'border-coral bg-coral text-white' : 'border-ink/20'}`}>
            {method === 'card' && <Icon.Check className="h-3 w-3" />}
          </span>
        </Press>

        {method === 'card' && (
          <div className="mt-3 animate-fade-in space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
            {[
              { l: 'Card number', v: '4242 4242 4242 4242' },
              { l: 'Expiry · CVC', v: '04 / 28   ·   123' },
            ].map(f => (
              <div key={f.l}>
                <span className="text-[11px] font-bold uppercase tracking-label text-ink-300">{f.l}</span>
                <div className="mt-1.5 flex h-[50px] items-center rounded-xl bg-ink/[0.04] px-4 font-mono text-[14px] text-ink-600">{f.v}</div>
              </div>
            ))}
            <p className="text-[11px] text-ink-300">Demo card pre-filled for presentation purposes.</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11.5px] font-semibold text-ink-400">
          <Icon.Check className="h-4 w-4 text-sage" />
          Secure payment powered by Stripe
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[72px] z-40 px-4 pb-4 pt-10"

        style={{ background: 'linear-gradient(to top, rgba(251,248,243,1) 45%, rgba(251,248,243,0))' }}>
        <CTA tone={method === 'card' ? 'coral' : 'ink'} disabled={state === 'processing'} onClick={() => setState('processing')}>
          {state === 'processing' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Processing
            </>
          ) : (
            <>Pay {money(totals.total)}</>
          )}
        </CTA>
      </div>
    </div>
  );
};

export default PaymentScreen;
