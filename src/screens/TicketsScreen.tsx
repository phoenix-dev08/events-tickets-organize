import React, { useState } from 'react';
import { EVENTS, USER, dinnerEvent, featuredEvent, money } from '@/data/redeemed';
import { CTA, Icon, Label, Press, QRCode } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';

const eventFor = (id: string) => EVENTS.find(e => e.id === id) || featuredEvent;

export const TicketsScreen: React.FC = () => {
  const { go, myTickets, openTicket, isAuthed, requireAuth } = useDemo();
  const [tab, setTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const past = [EVENTS[2], EVENTS[3]];
  const hero = myTickets[0];
  const heroEvent = hero ? eventFor(hero.event_id) : featuredEvent;

  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <Label className="text-coral">Redeemed Events</Label>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink">Your tickets</h1>
        <div className="mt-5 flex gap-6 border-b border-ink/10">
          {(['Upcoming', 'Past'] as const).map(t => (
            <Press key={t} onClick={() => setTab(t)}
              className={`relative min-h-[44px] pb-3 text-[13.5px] font-bold ${tab === t ? 'text-ink' : 'text-ink-300'}`}>
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-coral" />}
            </Press>
          ))}
        </div>
      </div>

      {tab === 'Upcoming' ? (
        <div className="animate-fade-in px-5 pt-6">
          {!isAuthed && (
            <Press onClick={() => requireAuth({ headline: 'Find your tickets', sub: 'Sign in and every ticket you buy appears here — on any device.' })}
              className="mb-5 flex w-full items-center gap-3.5 rounded-[22px] border border-champagne/45 bg-champagne/[0.1] p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champagne text-ink-900">
                <Icon.User className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-ink">Sign in to see your tickets</span>
                <span className="mt-0.5 block text-[11.5px] text-ink-400">Purchases sync to your account automatically.</span>
              </span>
              <Icon.Chevron className="h-4 w-4 shrink-0 text-ink-400" />
            </Press>
          )}

          <Press onClick={() => { openTicket(hero || null); go({ k: 'ticket' }); }}
            className="relative block w-full overflow-hidden rounded-[26px] shadow-lift">
            <img src={heroEvent.imageAlt} alt="" className="aspect-[16/11] w-full object-cover" />
            <div className="absolute inset-0 scrim-b" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <span className="rounded-full bg-sage px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-label text-white">Next up · 8 days</span>
              <span className="rounded-full glass-dark px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-label text-ivory">
                Table {hero?.table_number ?? 7}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-[25px] leading-tight text-ivory">{heroEvent.title}</p>
              <p className="mt-1.5 text-[12.5px] font-medium text-ivory/80">
                {heroEvent.dayShort} {heroEvent.dayNum} · {heroEvent.timeLabel.split('–')[0].trim()} · {heroEvent.venue}
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                <span className="flex items-center gap-2 rounded-full bg-ivory px-3.5 py-2 text-[12.5px] font-bold text-ink">
                  <Icon.Qr className="h-4 w-4" />Open ticket
                </span>
                <span className="rounded-full glass-dark px-3 py-2 text-[12px] font-bold text-ivory">{hero?.tier_name || 'Premium'}</span>
              </div>
            </div>
          </Press>

          {/* Saved tickets from the account */}
          {myTickets.length > 0 && (
            <div className="mt-6">
              <Label className="text-ink-300">Saved to your account</Label>
              <div className="mt-3 space-y-3">
                {myTickets.map(t => {
                  const ev = eventFor(t.event_id);
                  return (
                    <Press key={t.id} onClick={() => { openTicket(t); go({ k: 'ticket' }); }}
                      className="flex w-full items-center gap-3.5 rounded-[22px] border border-ink/10 bg-white p-3.5 shadow-soft">
                      <div className="grid h-[58px] w-[52px] shrink-0 place-items-center rounded-2xl bg-ink-900">
                        <span className="text-center leading-none">
                          <span className="block text-[9px] font-bold tracking-label text-champagne">{ev.dayShort}</span>
                          <span className="mt-1 block text-[18px] font-extrabold text-ivory">{ev.dayNum}</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold leading-tight text-ink line-clamp-1">{ev.title}</p>
                        <p className="mt-1 text-[11.5px] text-ink-400 line-clamp-1">
                          {t.tier_name} × {t.quantity}{t.table_number ? ` · Table ${t.table_number}` : ''}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                          <span className="text-[10.5px] font-bold text-sage">{t.ticket_code} · {money(t.total_cents / 100)}</span>
                        </div>
                      </div>
                      <Icon.Chevron className="h-4 w-4 shrink-0 text-ink-300" />
                    </Press>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {[dinnerEvent, EVENTS[1]].map(e => (
              <Press key={e.id} onClick={() => go({ k: 'event', id: e.id })}
                className="flex w-full items-center gap-3.5 rounded-[22px] border border-ink/10 bg-white p-3.5 shadow-soft">
                <div className="grid h-[58px] w-[52px] shrink-0 place-items-center rounded-2xl bg-ink/[0.05]">
                  <span className="text-center leading-none">
                    <span className="block text-[9px] font-bold tracking-label text-ink-400">{e.dayShort}</span>
                    <span className="mt-1 block text-[18px] font-extrabold text-ink">{e.dayNum}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold leading-tight text-ink line-clamp-1">{e.title}</p>
                  <p className="mt-1 text-[11.5px] text-ink-400 line-clamp-1">{e.timeLabel} · {e.venue}</p>
                  <p className="mt-1.5 text-[10.5px] font-bold text-coral">From ${e.fromPrice}</p>
                </div>
                <Icon.Chevron className="h-4 w-4 shrink-0 text-ink-300" />
              </Press>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-dashed border-ink/15 p-5 text-center">
            <Icon.Sparkle className="mx-auto h-5 w-5 text-champagne" />
            <p className="mt-2.5 text-[13.5px] font-bold text-ink">Looking for something else?</p>
            <p className="mt-1 text-[12px] text-ink-400">Events you buy appear here the moment payment clears.</p>
            <Press onClick={() => go({ k: 'explore' })} className="mt-3.5 inline-flex min-h-[44px] items-center rounded-full bg-ink px-5 text-[12.5px] font-bold text-ivory">
              Browse events
            </Press>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in px-5 pt-6">
          {past.map(e => (
            <div key={e.id} className="mb-3 flex items-center gap-3.5 rounded-[22px] bg-ink/[0.035] p-3.5">
              <img src={e.image} alt="" className="h-[58px] w-[52px] rounded-2xl object-cover opacity-70 grayscale" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-tight text-ink-600 line-clamp-1">{e.title}</p>
                <p className="mt-1 text-[11.5px] text-ink-300">Attended · {e.dateLabel.replace(', 2026', '')}</p>
              </div>
              <Press className="shrink-0 rounded-full border border-ink/15 px-3 py-2 text-[11.5px] font-bold text-ink-400">Receipt</Press>
            </div>
          ))}
          <p className="mt-6 text-center text-[11.5px] text-ink-300">Past tickets stay available for 12 months.</p>
        </div>
      )}
    </div>
  );
};

export const TicketDetailScreen: React.FC = () => {
  const { back, order, showToast, activeTicket, myTickets } = useDemo();
  const { displayName, user } = useAuth();
  const ticket = activeTicket || myTickets[0] || null;
  const ev = ticket ? eventFor(ticket.event_id) : featuredEvent;
  const table = ticket?.table_number ?? order.table ?? 7;
  const code = ticket?.ticket_code || 'RE-826194';
  const tier = ticket?.tier_name || 'Premium';
  const attendee = ticket?.attendee_name || (user ? displayName : USER.name);

  return (
    <div className="min-h-full bg-white pb-8">
      <div className="relative z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Press onClick={back} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06] text-ink">
            <Icon.Close className="h-5 w-5" />
          </Press>
          <div className="flex items-center gap-1.5 rounded-full bg-champagne/15 px-3 py-1.5">
            <Icon.Sparkle className="h-3.5 w-3.5 text-champagne-dark" />
            <span className="text-[10.5px] font-bold uppercase tracking-label text-champagne-dark">Brightness boosted</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="px-4">
          <div className="overflow-hidden rounded-[28px] border border-ink/10 shadow-lift">
            <div className="relative bg-ink-900 px-5 pb-6 pt-5 text-ivory">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/50">
                    <span className="font-display text-[15px] leading-none text-champagne">R</span>
                  </span>
                  <span className="text-[10.5px] font-bold uppercase tracking-label text-ivory/70">Redeemed Events</span>
                </div>
                <span className="rounded-full bg-champagne/20 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-label text-champagne">{tier}</span>
              </div>

              <p className="mt-5 font-display text-[26px] leading-[1.05]">{ev.title}</p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">Date</p>
                  <p className="mt-1 font-display text-[20px] leading-none text-champagne">{ev.dayShort}</p>
                  <p className="text-[22px] font-extrabold leading-tight">{ev.dayNum}</p>
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">Doors</p>
                  <p className="mt-1.5 text-[14px] font-bold">{ev.timeLabel.split('–')[0].trim()}</p>
                  <p className="mt-0.5 text-[11px] text-ivory/60">Hall entry B</p>
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">Venue</p>
                  <p className="mt-1.5 text-[12.5px] font-bold leading-snug">{ev.venue}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">Attendee</p>
                  <p className="mt-1 truncate text-[14px] font-bold">{attendee}</p>
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">Ticket</p>
                  <p className="mt-1 text-[14px] font-bold">{tier}</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between bg-coral px-5 py-4 text-white">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-label text-white/70">Your placement</p>
                <p className="mt-0.5 font-display text-[28px] leading-none">TABLE {table}</p>
              </div>
              <div className="text-right">
                <p className="text-[9.5px] font-bold uppercase tracking-label text-white/70">Seats</p>
                <p className="mt-1 text-[13px] font-bold">Near stage</p>
              </div>
              <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
              <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
            </div>

            <div className="bg-white px-5 pb-6 pt-6">
              <div className="mx-auto w-[210px] rounded-2xl border border-ink/10 p-3">
                <QRCode seed={`${code}-T${table}`} className="w-full" />
              </div>
              <p className="mt-4 text-center font-mono text-[13px] font-semibold tracking-wider text-ink">{code}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span className="text-[11px] font-bold text-sage">Available offline</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <CTA tone="ink" onClick={() => showToast('Pass added to your wallet')}>
              <Icon.Wallet className="h-4 w-4" />Add to Wallet
            </CTA>
            <div className="flex gap-3">
              <Press onClick={() => showToast('Transfer link sent')}
                className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-ink/15 text-[13.5px] font-bold text-ink">
                <Icon.Share className="h-4 w-4" />Transfer
              </Press>
              <Press onClick={() => showToast(`${tier} · Table ${table} · Order ${code}`)}
                className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-ink/15 text-[13.5px] font-bold text-ink">
                <Icon.Ticket className="h-4 w-4" />Details
              </Press>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-300">
            Present this code at Hall entry B. Screenshots are not accepted —<br />your code refreshes every 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};
