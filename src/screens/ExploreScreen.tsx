import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, EVENTS, ORGANIZERS, USER, featuredEvent } from '@/data/redeemed';
import { CTA, Icon, Label, Pill, Press, Skeleton } from '@/components/ui/kit';
import { FavButton, FeatureCard, RailCard, RowCard, SectionHead } from '@/components/EventCards';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';


const Greeting = () => {
  const { go } = useDemo();
  const { user, displayName } = useAuth();
  const firstName = user ? displayName.split(' ')[0] : USER.first;
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-3">
      <div>
        <p className="text-[12.5px] font-semibold text-ink-400">Good evening, {firstName}</p>

        <h1 className="mt-2 max-w-[280px] font-display text-[31px] leading-[1.06] tracking-[-0.01em] text-ink">
          Find something worth showing up for.
        </h1>
        <Press className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink/[0.055] px-3 py-2 text-[12.5px] font-bold text-ink-600">
          <Icon.Pin className="h-3.5 w-3.5 text-coral" />
          {USER.city}
          <Icon.Down className="h-3.5 w-3.5 text-ink-300" />
        </Press>
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-1">
        <Press
          onClick={() => go({ k: 'notifications' })}
          aria-label="Notifications"
          className="relative grid h-11 w-11 place-items-center rounded-full bg-ink/[0.055] text-ink"
        >
          <Icon.Bell className="h-[19px] w-[19px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-ivory" />
        </Press>
        <Press onClick={() => go({ k: 'profile' })} aria-label="Profile">
          <img src={USER.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-champagne/50" />
        </Press>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  const { go } = useDemo();
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.closest('[data-scroll]');
    if (!el) return;
    const onScroll = () => setOffset(Math.min(40, (el as HTMLElement).scrollTop * 0.16));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="px-5 pt-6">
      <div className="relative overflow-hidden rounded-[28px] shadow-lift">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={featuredEvent.image}
            alt={featuredEvent.title}
            className="h-[112%] w-full object-cover"
            style={{ transform: `translateY(${-offset * 0.5}px)` }}
          />
        </div>
        <div className="absolute inset-0 scrim-b" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex items-center gap-2 rounded-full glass-dark px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-coral" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
            </span>
            <Label className="text-ivory">Featured</Label>
          </div>
          <FavButton id={featuredEvent.id} light />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <Label className="text-champagne">{featuredEvent.tagline}</Label>
          <h2 className="mt-2 font-display text-[33px] leading-[0.98] tracking-[-0.015em] text-ivory">
            Redeem<br />Conference<br />2026
          </h2>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] font-medium text-ivory/85">
            <span className="flex items-center gap-1.5"><Icon.Calendar className="h-4 w-4 text-champagne" />September 24–26</span>
            <span className="flex items-center gap-1.5"><Icon.Pin className="h-4 w-4 text-champagne" />Atlanta Convention Center</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Press
              onClick={() => go({ k: 'event', id: featuredEvent.id })}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-coral text-[15px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(232,81,56,0.9)]"
            >
              Get Tickets
              <Icon.Chevron className="h-4 w-4" />
            </Press>
            <div className="flex h-[52px] items-center gap-2 rounded-2xl glass-dark px-4">
              <div className="flex -space-x-2">
                {ORGANIZERS.map(o => (
                  <img key={o.name} src={o.image} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-ink-900/70" />
                ))}
              </div>
              <span className="text-[11.5px] font-bold text-ivory">1.2k going</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreScreen: React.FC = () => {
  const { go } = useDemo();
  const [cat, setCat] = useState<string>('For You');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 620);
    return () => clearTimeout(t);
  }, []);

  const filtered = cat === 'For You' ? EVENTS : EVENTS.filter(e => e.category === cat);
  const trending = filtered.length ? filtered : EVENTS;
  const weekend = EVENTS.filter(e => ['gathering-atl', 'founders-table', 'light-sound', 'impact-dinner'].includes(e.id));

  const open = (id: string) => go({ k: 'event', id });

  return (
    <div className="pb-8">
      <Greeting />
      <Hero />

      {/* Category pills */}
      <div className="mt-7 flex gap-2 overflow-x-auto px-5 no-scrollbar">
        {CATEGORIES.map(c => (
          <Pill key={c} active={cat === c} onClick={() => setCat(c)}>
            {c === 'For You' && <Icon.Sparkle className="mr-1.5 h-3.5 w-3.5" />}
            {c}
          </Pill>
        ))}
      </div>

      {/* Trending rail */}
      <section className="mt-7">
        <SectionHead
          kicker={cat === 'For You' ? 'Curated for you' : `${cat} in Atlanta`}
          title="Trending near you"
          action="See all"
          onAction={() => go({ k: 'event', id: trending[0].id })}
        />
        {loading ? (
          <div className="flex gap-3.5 px-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-[232px] shrink-0">
                <Skeleton className="aspect-[4/5] rounded-[22px]" />
                <Skeleton className="mt-2.5 h-3.5 w-3/4 rounded-full" />
                <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 no-scrollbar">
            {trending.map((e, i) => (
              <RailCard key={e.id} event={e} delay={i * 70} onOpen={() => open(e.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Following feature */}
      <section className="mt-9">
        <div className="mb-3.5 flex items-center gap-3 px-5">
          <img src={EVENTS[1].organizerImage} alt="" className="h-11 w-11 rounded-full object-cover ring-1 ring-champagne/50" />
          <div>
            <Label className="text-ink-300">Because you follow</Label>
            <p className="font-display text-[20px] leading-tight text-ink">Redeemed Collective</p>
          </div>
        </div>
        <div className="px-5">
          <FeatureCard event={EVENTS[1]} caption="New this week" onOpen={() => open(EVENTS[1].id)} />
        </div>
      </section>

      {/* Dark editorial band */}
      <section className="mt-9 bg-ink-900 py-8">
        <div className="px-5">
          <Label className="text-champagne">The table experience</Label>
          <h2 className="mt-2 font-display text-[26px] leading-[1.08] text-ivory">
            Pick exactly where you’ll sit — before you arrive.
          </h2>
          <p className="mt-2.5 max-w-[300px] text-[13.5px] leading-relaxed text-ivory/65">
            Twelve round tables, ninety-six seats and a live floor plan. Choose your table at checkout and we’ll hold it for ten minutes.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { n: '12', l: 'Tables' },
              { n: '96', l: 'Seats' },
              { n: '14', l: 'Left' },
            ].map(s => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5">
                <p className="font-display text-[24px] leading-none text-champagne">{s.n}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-ivory/55">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <CTA tone="gold" onClick={() => open('impact-dinner')}>
              Explore the Celebration Dinner
              <Icon.Chevron className="h-4 w-4" />
            </CTA>
          </div>
        </div>
      </section>

      {/* Weekend mixed layout */}
      <section className="mt-9">
        <SectionHead kicker="Sep 19 – Sep 21" title="Discover this weekend" />
        <div className="px-5">
          <FeatureCard event={weekend[0]} caption="Free entry" onOpen={() => open(weekend[0].id)} />
        </div>
        <div className="mt-5 space-y-5 px-5">
          {weekend.slice(1).map(e => (
            <RowCard key={e.id} event={e} onOpen={() => open(e.id)} />
          ))}
        </div>
      </section>

      {/* Organizers */}
      <section className="mt-9">
        <SectionHead kicker="Hosts worth following" title="Organizers in Atlanta" />
        <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar">
          {ORGANIZERS.map(o => (
            <div key={o.name} className="w-[168px] shrink-0 rounded-[22px] border border-ink/10 bg-white p-4 shadow-soft">
              <img src={o.image} alt="" className="h-12 w-12 rounded-full object-cover" />
              <p className="mt-3 text-[13.5px] font-bold leading-tight text-ink">{o.name}</p>
              <p className="mt-1 text-[11.5px] text-ink-400">{o.followers} followers · {o.events} events</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 px-5 text-center font-display text-[15px] text-ink-300">
        Redeemed Events · Atlanta, GA
      </p>
    </div>
  );
};

export default ExploreScreen;
