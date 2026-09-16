import React from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, Section, Button, Card, Badge, PullToRefresh } from '@/components/kit';
import EventCard from '@/components/EventCard';
import { isFuture, money, fmtDate } from '@/lib/helpers';
import { Bell, Music, Users, Presentation, Sparkles, ShieldCheck, TrendingUp, Quote } from 'lucide-react';

const CAT_ICON: any = { Music: Music, Community: Users, Conference: Presentation };

const Explore: React.FC = () => {
  const { db, go, sel, user, session, toast, setTab, refresh } = useApp();

  const published = db.events.filter((e: any) => e.status === 'published');
  const upcoming = published.filter((e: any) => isFuture(e.startDate)).sort((a: any, b: any) => +new Date(a.startDate) - +new Date(b.startDate));
  const featured = db.events.find((e: any) => e.id === db.showcaseEventId) || upcoming[0];
  const trending = upcoming.slice(0, 8);
  const unread = session ? sel.notifications().filter((n: any) => !n.read).length : 0;

  return (
    <Screen>
      <PullToRefresh onRefresh={async () => { await refresh(); toast('Synced with the live database'); }}>

        {/* header */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500">{user ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome to'}</p>
            <p className="text-[20px] font-bold text-slate-900 dark:text-white">Redeemed Events</p>
          </div>
          <button onClick={() => (session ? go('notifications') : go('auth'))} aria-label="Notifications"
            className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{unread}</span>}
          </button>
        </div>

        {/* hero */}
        {featured && (
          <div className="px-4 mt-4">
            <div className="relative rounded-3xl overflow-hidden">
              <img src={featured.image} alt={featured.title} className="w-full h-64 sm:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <Badge tone="indigo" className="mb-2">Featured event</Badge>
                <h2 className="text-white text-[22px] font-bold leading-tight">{featured.title}</h2>
                <p className="text-white/80 text-[13px] mt-1">{fmtDate(featured.startDate)} · {featured.venue}, {featured.city}</p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => go('event', { id: featured.id })}>Get Tickets</Button>
                  <Button variant="outline" className="bg-white/10 text-white border-white/40 backdrop-blur"
                    onClick={() => (session ? setTab('organize') : go('auth'))}>Create Your Event</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* categories */}
        <Section title="Browse by category" action={<button onClick={() => go('browse')} className="text-[13px] font-semibold text-indigo-600">See all</button>}>
          <div className="grid grid-cols-3 gap-3">
            {['Music', 'Community', 'Conference'].map((c) => {
              const Icon = CAT_ICON[c];
              const count = upcoming.filter((e: any) => e.category === c).length;
              return (
                <Card key={c} className="p-4 text-center" onClick={() => go('browse', { category: c })}>
                  <Icon className="w-6 h-6 mx-auto text-indigo-600" />
                  <p className="text-[13.5px] font-semibold mt-2 text-slate-900 dark:text-white">{c}</p>
                  <p className="text-[11.5px] text-slate-500">{count} events</p>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* trending */}
        <Section title="Trending now" action={<button onClick={() => go('browse')} className="text-[13px] font-semibold text-indigo-600">View all</button>}>
          <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
            {trending.map((e: any) => <EventCard key={e.id} event={e} variant="mini" />)}
          </div>
        </Section>

        {/* happening soon */}
        <Section title="Happening soon">
          <div className="space-y-3">
            {upcoming.slice(0, 4).map((e: any) => <EventCard key={e.id} event={e} />)}
          </div>
          <Button variant="secondary" full className="mt-3" onClick={() => go('browse')}>Browse all events</Button>
        </Section>

        {/* why */}
        <Section title="Why choose Redeemed Events">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, t: 'Trusted checkout', d: 'Secure payments, instant QR tickets and receipts.' },
              { icon: Sparkles, t: 'Seating that works', d: 'Tables, rooms and groups with live capacity control.' },
              { icon: TrendingUp, t: 'Grow your community', d: 'Followers, announcements and repeat attendance.' },
            ].map((f) => (
              <Card key={f.t} className="p-4">
                <f.icon className="w-5 h-5 text-indigo-600" />
                <p className="font-semibold text-[14px] mt-2 text-slate-900 dark:text-white">{f.t}</p>
                <p className="text-[12.5px] text-slate-500 mt-1">{f.d}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* host CTA */}
        <Section title="Host events with ease">
          <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-600 border-0 text-white">
            <p className="text-[17px] font-bold">Everything you need to run the room</p>
            <p className="text-[13px] text-white/85 mt-1">Create an event in minutes, build your seating chart, scan guests in at the door and get paid out automatically.</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="bg-white text-indigo-700 border-white" onClick={() => (session ? setTab('organize') : go('auth'))}>Start organizing</Button>
              <Button variant="ghost" className="text-white" onClick={() => go('help', { type: 'Organizer Inquiry' })}>Talk to us</Button>
            </div>
          </Card>
        </Section>

        {/* testimonials */}
        <Section title="Loved by organizers">
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
            {[
              { n: 'Pastor Andre King', r: 'Harbor City', q: 'We seated 600 guests across 75 tables without a single spreadsheet.' },
              { n: 'Dana Ruiz', r: 'City Serve', q: 'Check-in took 12 minutes. Our volunteers loved the scanner.' },
              { n: 'Michael Owens', r: 'Summit Leaders', q: 'Refunds, coupons and payouts all in one place. Finally.' },
            ].map((t) => (
              <Card key={t.n} className="p-4 w-72 shrink-0">
                <Quote className="w-5 h-5 text-indigo-400" />
                <p className="text-[13.5px] mt-2 text-slate-700 dark:text-slate-200">“{t.q}”</p>
                <p className="text-[12px] font-semibold mt-3 text-slate-900 dark:text-white">{t.n}</p>
                <p className="text-[11.5px] text-slate-500">{t.r}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-slate-900 dark:text-white">Need help?</p>
              <p className="text-[12.5px] text-slate-500">Contact support, an organizer, or join our mailing list.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => go('help')}>Help</Button>
          </Card>
        </Section>
      </PullToRefresh>
    </Screen>
  );
};

export default Explore;
