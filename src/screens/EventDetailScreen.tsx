import React, { useState } from 'react';
import { AGENDA, EVENTS, GUESTS } from '@/data/redeemed';
import { CTA, Divider, Icon, Label, Press } from '@/components/ui/kit';
import { FavButton, RailCard, SectionHead } from '@/components/EventCards';
import { useDemo } from '@/contexts/DemoContext';

const EventDetailScreen: React.FC = () => {
  const { activeEvent: ev, back, go, order, setQty, following, toggleFollow, showToast } = useDemo();
  const [tab, setTab] = useState<'About' | 'Agenda' | 'Venue'>('About');
  const isFollowing = following.includes(ev.organizer);
  const qtyFor = (id: string) => (order.tierId === id ? order.qty : 0);
  const selectedTier = ev.tickets.find(t => t.id === order.tierId);
  const related = EVENTS.filter(e => e.id !== ev.id).slice(0, 4);

  const bump = (tierId: string, delta: number) => {
    const current = qtyFor(tierId);
    setQty(tierId, current + delta);
  };

  return (
    <div className="pb-40">

      {/* Hero */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={ev.image} alt={ev.title} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 scrim-b" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Press onClick={back} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full glass-dark text-ivory">
            <Icon.Back className="h-5 w-5" />
          </Press>
          <div className="flex items-center gap-2">
            <Press
              onClick={() => showToast('Link copied to clipboard')}
              aria-label="Share"
              className="grid h-11 w-11 place-items-center rounded-full glass-dark text-ivory"
            >
              <Icon.Share className="h-[19px] w-[19px]" />
            </Press>
            <FavButton id={ev.id} light />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-champagne/50 px-2.5 py-1">
            <Label className="text-champagne">{ev.category}</Label>
          </div>
          <h1 className="mt-2.5 font-display text-[30px] leading-[1.02] tracking-[-0.015em] text-ivory">{ev.title}</h1>
          <p className="mt-2 text-[13px] font-medium text-ivory/80">{ev.tagline} · {ev.attending.toLocaleString()} going</p>
        </div>
      </div>

      {/* Key facts */}
      <div className="px-5 pt-6">
        <div className="space-y-4">
          {[
            { icon: <Icon.Calendar className="h-[18px] w-[18px]" />, main: ev.dateLabel, sub: ev.timeLabel },
            { icon: <Icon.Pin className="h-[18px] w-[18px]" />, main: ev.venue, sub: `${ev.address}, ${ev.city}` },
          ].map(r => (
            <div key={r.main} className="flex items-start gap-3.5">
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/[0.055] text-coral">{r.icon}</div>
              <div>
                <p className="text-[14.5px] font-bold text-ink">{r.main}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-400">{r.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { l: 'Add to Calendar', i: <Icon.Calendar className="h-4 w-4" />, t: 'Added to your calendar' },
            { l: 'Directions', i: <Icon.Pin className="h-4 w-4" />, t: 'Opening directions in Maps' },
            { l: 'Share', i: <Icon.Share className="h-4 w-4" />, t: 'Link copied to clipboard' },
          ].map(c => (
            <Press key={c.l} onClick={() => showToast(c.t)}
              className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border border-ink/12 px-4 text-[12.5px] font-bold text-ink-600">
              {c.i}{c.l}
            </Press>
          ))}
        </div>

        {/* Organizer */}
        <div className="mt-6 flex items-center gap-3.5 rounded-[22px] border border-ink/10 bg-white p-4 shadow-soft">
          <img src={ev.organizerImage} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-champagne/40" />
          <div className="min-w-0 flex-1">
            <Label className="text-ink-300">Hosted by</Label>
            <p className="mt-1 text-[14.5px] font-bold leading-tight text-ink">{ev.organizer}</p>
          </div>
          <Press
            onClick={() => { toggleFollow(ev.organizer); showToast(isFollowing ? 'Unfollowed' : `Following ${ev.organizer}`); }}
            className={`min-h-[40px] rounded-full px-4 text-[12.5px] font-bold ${isFollowing ? 'bg-ink/[0.06] text-ink-600' : 'bg-ink text-ivory'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Press>
        </div>
      </div>

      {/* Tickets */}
      <section className="mt-8">
        <SectionHead kicker="Choose your access" title="Tickets" />
        <div className="space-y-3.5 px-5">
          {ev.tickets.map(t => {
            const qty = qtyFor(t.id);
            const active = qty > 0;
            return (
              <div key={t.id}
                className={`overflow-hidden rounded-[24px] border transition-all duration-300 ${active ? 'border-coral/50 bg-white shadow-lift' : 'border-ink/10 bg-white shadow-soft'}`}>
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-ink-600">{t.name}</Label>
                      {t.badge && (
                        <span className="rounded-full bg-champagne/18 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-label text-champagne-dark">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-display text-[27px] leading-none text-ink">
                      {t.price === 0 ? 'Free' : `$${t.price}`}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {t.perks.map(p => (
                        <li key={p} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-400">
                          <Icon.Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1.5 rounded-full bg-ink/[0.05] p-1">
                      <Press onClick={() => bump(t.id, -1)} disabled={qty === 0} aria-label="Decrease"
                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink disabled:opacity-35">
                        <Icon.Minus className="h-4 w-4" />
                      </Press>
                      <span key={qty} className="animate-pop w-5 text-center text-[15px] font-extrabold text-ink">{qty}</span>
                      <Press onClick={() => bump(t.id, 1)} aria-label="Increase"
                        className="grid h-9 w-9 place-items-center rounded-full bg-ink text-ivory">
                        <Icon.Plus className="h-4 w-4" />
                      </Press>
                    </div>
                    <p className={`mt-2.5 text-[11px] font-bold ${t.remaining < 15 ? 'text-coral' : 'text-ink-300'}`}>
                      {t.remaining} left
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-ink/[0.06]">
                  <div className="h-full rounded-r-full bg-gradient-to-r from-champagne to-coral transition-all duration-700"
                    style={{ width: `${Math.max(6, 100 - Math.min(96, t.remaining / 3))}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-9 px-5">
        <div className="flex gap-6 border-b border-ink/10">
          {(['About', 'Agenda', 'Venue'] as const).map(t => (
            <Press key={t} onClick={() => setTab(t)}
              className={`relative min-h-[44px] pb-3 text-[13.5px] font-bold ${tab === t ? 'text-ink' : 'text-ink-300'}`}>
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-coral" />}
            </Press>
          ))}
        </div>

        {tab === 'About' && (
          <div className="animate-fade-in pt-5">
            <p className="text-[14px] leading-[1.65] text-ink-600">{ev.about}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ev.tags.map(t => (
                <span key={t} className="rounded-full bg-ink/[0.055] px-3 py-1.5 text-[11.5px] font-bold text-ink-600">{t}</span>
              ))}
            </div>
          </div>
        )}

        {tab === 'Agenda' && (
          <div className="animate-fade-in pt-5">
            <div className="relative pl-[86px]">
              <div className="absolute left-[70px] top-2 bottom-2 w-px bg-ink/12" />
              {AGENDA.map(a => (
                <div key={a.time} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[86px] top-0 w-[58px] text-right text-[11.5px] font-bold text-ink-400">{a.time}</span>
                  <span className={`absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ivory ${a.accent ? 'bg-coral' : 'bg-ink/25'}`} />
                  <p className={`text-[14.5px] font-bold leading-tight ${a.accent ? 'text-coral' : 'text-ink'}`}>{a.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-400">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Venue' && (
          <div className="animate-fade-in pt-5">
            <div className="overflow-hidden rounded-[22px] shadow-soft">
              <img src={ev.imageAlt} alt={ev.venue} className="aspect-[16/10] w-full object-cover" />
            </div>
            <p className="mt-3.5 text-[14.5px] font-bold text-ink">{ev.venue}</p>
            <p className="mt-1 text-[12.5px] text-ink-400">{ev.address}<br />{ev.city}</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {['Valet parking', 'Wheelchair access', 'Coat check'].map(f => (
                <div key={f} className="rounded-2xl bg-ink/[0.04] px-3 py-3 text-[11.5px] font-semibold leading-snug text-ink-600">{f}</div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Guests */}
      <section className="mt-9">
        <SectionHead kicker="On the stage" title="Featured guests" />
        <div className="flex gap-3.5 overflow-x-auto px-5 no-scrollbar">
          {GUESTS.map(g => (
            <div key={g.name} className="w-[132px] shrink-0">
              <div className="overflow-hidden rounded-[20px]">
                <img src={g.image} alt={g.name} className="aspect-[4/5] w-full object-cover" />
              </div>
              <p className="mt-2.5 text-[13px] font-bold leading-tight text-ink">{g.name}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">{g.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-9">
        <SectionHead kicker="You might also like" title="Related events" />
        <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 no-scrollbar">
          {related.map(e => (
            <RailCard key={e.id} event={e} onOpen={() => go({ k: 'event', id: e.id })} />
          ))}
        </div>
      </section>

      <Divider className="mt-10" />
      <p className="py-6 text-center text-[11.5px] text-ink-300">Ticket sales close 2 hours before doors.</p>

      {/* Sticky CTA */}
      {order.qty > 0 && (
        <div className="absolute inset-x-0 bottom-[72px] z-40 animate-rise px-4 pb-4 pt-10"

          style={{ background: 'linear-gradient(to top, rgba(251,248,243,1) 40%, rgba(251,248,243,0))' }}>
          <div className="mb-2.5 flex items-center justify-between px-1.5">
            <p className="text-[12.5px] font-bold text-ink-600">
              {order.qty} × {selectedTier?.name}
            </p>
            <p className="text-[12.5px] font-semibold text-ink-400">Held for 10:00</p>
          </div>
          <CTA onClick={() => go({ k: 'checkout' })}>
            Continue · ${(selectedTier?.price || 0) * order.qty}
          </CTA>
        </div>
      )}
    </div>
  );
};

export default EventDetailScreen;
