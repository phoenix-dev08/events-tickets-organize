import React from 'react';
import { NOTIFICATIONS, ORGANIZERS, PAYMENT_HISTORY, PORTRAITS, USER, money } from '@/data/redeemed';
import { CTA, Divider, Icon, Label, Press } from '@/components/ui/kit';
import { TopBar } from '@/components/Chrome';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { switchMode, go, showToast, favorites, following, requireAuth, myTickets } = useDemo();
  const { user, profile, displayName, signOut, loading } = useAuth();
  const signedIn = !!user;

  const rows: { label: string; icon: React.ReactNode; meta?: string; action: () => void }[] = [
    { label: 'Account', icon: <Icon.User className="h-[18px] w-[18px]" />, meta: signedIn ? 'Verified' : 'Guest', action: () => (signedIn ? showToast('Account settings') : requireAuth({})) },
    { label: 'Payment History', icon: <Icon.Wallet className="h-[18px] w-[18px]" />, meta: `${signedIn ? myTickets.length : PAYMENT_HISTORY.length} orders`, action: () => showToast(signedIn ? `${myTickets.length} saved orders` : 'Sign in to see your orders') },
    { label: 'Following', icon: <Icon.Users className="h-[18px] w-[18px]" />, meta: `${following.length}`, action: () => showToast(following.join(', ')) },
    { label: 'Notification Preferences', icon: <Icon.Bell className="h-[18px] w-[18px]" />, action: () => go({ k: 'notifications' }) },
    { label: 'Help & Support', icon: <Icon.Sparkle className="h-[18px] w-[18px]" />, action: () => showToast('Support chat opens in 30s') },
    { label: 'Privacy', icon: <Icon.Settings className="h-[18px] w-[18px]" />, action: () => showToast('Privacy policy') },
    { label: 'Terms', icon: <Icon.Settings className="h-[18px] w-[18px]" />, action: () => showToast('Terms of service') },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative overflow-hidden bg-ink-900 px-5 pb-8 pt-7">
        <div className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(circle at 80% 0%, rgba(201,165,87,0.5), transparent 60%)' }} />

        {signedIn ? (
          <>
            <div className="relative flex items-center gap-4">
              <img src={PORTRAITS[0]} alt="" className="h-[74px] w-[74px] rounded-full object-cover ring-2 ring-champagne/60" />
              <div className="min-w-0">
                <h1 className="font-display text-[25px] leading-tight text-ivory">{displayName}</h1>
                <p className="mt-1 truncate text-[12.5px] text-ivory/65">{user?.email}</p>
                {profile?.phone && <p className="text-[12.5px] text-ivory/65">{profile.phone}</p>}
              </div>
            </div>
            <div className="relative mt-6 grid grid-cols-3 gap-2.5">
              {[
                { n: String(myTickets.length), l: 'Tickets' },
                { n: String(favorites.length), l: 'Saved' },
                { n: 'Gold', l: 'Member tier' },
              ].map(s => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3">
                  <p className="font-display text-[20px] leading-none text-champagne">{s.n}</p>
                  <p className="mt-1.5 text-[10.5px] font-semibold leading-tight text-ivory/55">{s.l}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="relative">
            <Label className="text-champagne">Your account</Label>
            <h1 className="mt-2 max-w-[270px] font-display text-[27px] leading-[1.08] text-ivory">
              Keep every ticket and table in one place.
            </h1>
            <p className="mt-2.5 max-w-[290px] text-[13px] leading-relaxed text-ivory/60">
              Sign in to sync favorites, purchases and your seat assignment across every device you use.
            </p>
            <div className="mt-5">
              <CTA tone="gold" disabled={loading}
                onClick={() => requireAuth({ headline: 'Welcome to Redeemed', sub: 'Create an account or sign in to sync your tickets, favorites and table.' })}>
                <Icon.User className="h-4 w-4" />
                {loading ? 'Loading…' : 'Sign in or create account'}
              </CTA>
            </div>
          </div>
        )}
      </div>

      {/* Saved tickets */}
      {signedIn && myTickets.length > 0 && (
        <div className="px-5 pt-6">
          <Label className="text-coral">Saved to your account</Label>
          <div className="mt-3 space-y-2.5">
            {myTickets.slice(0, 3).map(t => (
              <Press key={t.id} onClick={() => go({ k: 'ticket' })}
                className="flex w-full items-center gap-3.5 rounded-[22px] border border-ink/10 bg-white p-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-900 text-champagne">
                  <Icon.Ticket className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold text-ink">{t.tier_name} × {t.quantity}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-400">
                    {t.table_number ? `Table ${t.table_number} · ` : ''}{t.ticket_code}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-extrabold text-ink">{money(t.total_cents / 100)}</span>
              </Press>
            ))}
          </div>
        </div>
      )}

      {/* Organizer switch */}
      <div className="px-5 pt-6">
        <Press onClick={() => switchMode('organizer')}
          className="flex w-full items-center gap-3.5 rounded-[24px] border border-champagne/40 bg-champagne/[0.09] p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-champagne text-ink-900">
            <Icon.Swap className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-bold text-ink">Switch to Organizer</span>
            <span className="mt-0.5 block text-[12px] text-ink-400">Redeemed Collective · 3 live events</span>
          </span>
          <Icon.Chevron className="h-4 w-4 shrink-0 text-ink-400" />
        </Press>
      </div>

      {/* Payment history */}
      <div className="mt-7 px-5">
        <Label className="text-coral">Recent orders</Label>
        <div className="mt-3 overflow-hidden rounded-[24px] border border-ink/10 bg-white">
          {PAYMENT_HISTORY.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold leading-tight text-ink line-clamp-1">{p.event}</p>
                  <p className="mt-1 text-[11.5px] text-ink-400">{p.date} · {p.method}</p>
                </div>
                <p className="shrink-0 text-[13.5px] font-extrabold text-ink">{money(p.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Following */}
      <div className="mt-7 px-5">
        <Label className="text-coral">Following</Label>
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {ORGANIZERS.map(o => (
            <div key={o.name} className="flex w-[150px] shrink-0 flex-col items-center rounded-[22px] border border-ink/10 bg-white p-4 text-center">
              <img src={o.image} alt="" className="h-12 w-12 rounded-full object-cover" />
              <p className="mt-2.5 text-[12.5px] font-bold leading-tight text-ink">{o.name}</p>
              <p className="mt-1 text-[11px] text-ink-300">{o.followers} followers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings rows */}
      <div className="mt-7 px-5">
        <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-white">
          {rows.map((r, i) => (
            <div key={r.label}>
              {i > 0 && <Divider />}
              <Press onClick={r.action} className="flex w-full items-center gap-3.5 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink/[0.05] text-ink-600">{r.icon}</span>
                <span className="flex-1 text-[14px] font-semibold text-ink">{r.label}</span>
                {r.meta && <span className="text-[11.5px] font-bold text-ink-300">{r.meta}</span>}
                <Icon.Chevron className="h-4 w-4 shrink-0 text-ink-300" />
              </Press>
            </div>
          ))}
        </div>

        {signedIn ? (
          <Press onClick={async () => { await signOut(); showToast('Signed out'); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-ink/12 py-4 text-[13.5px] font-bold text-coral">
            <Icon.Logout className="h-4 w-4" />Sign Out
          </Press>
        ) : (
          <Press onClick={() => requireAuth({})}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-ink py-4 text-[13.5px] font-bold text-ivory">
            <Icon.User className="h-4 w-4" />Sign in
          </Press>
        )}

        <p className="mt-6 text-center text-[11px] text-ink-300">
          Redeemed Events · Demo build 2.4.0{signedIn ? ` · ${USER.city}` : ''}
        </p>
      </div>
    </div>
  );
};

export const NotificationsScreen: React.FC = () => {
  const { go, showToast } = useDemo();
  const iconFor = (kind: string) =>
    kind === 'seat' ? <Icon.Grid className="h-[18px] w-[18px]" />
      : kind === 'reminder' ? <Icon.Clock className="h-[18px] w-[18px]" />
        : kind === 'wallet' ? <Icon.Wallet className="h-[18px] w-[18px]" />
          : <Icon.Sparkle className="h-[18px] w-[18px]" />;

  return (
    <div className="pb-10">
      <TopBar title="Notifications" sub="2 unread"
        right={<Press onClick={() => showToast('All caught up')} className="text-[12px] font-bold text-coral">Mark all read</Press>} />
      <div className="px-5 pt-5">
        <h1 className="font-display text-[27px] leading-tight text-ink">Your inbox</h1>
        <div className="mt-5 space-y-2.5">
          {NOTIFICATIONS.map(n => (
            <Press key={n.id} onClick={() => go({ k: 'ticket' })}
              className={`flex w-full items-start gap-3.5 rounded-[22px] border p-4 ${n.unread ? 'border-coral/25 bg-white shadow-soft' : 'border-ink/8 bg-ink/[0.025]'}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.unread ? 'bg-coral/10 text-coral' : 'bg-ink/[0.06] text-ink-400'}`}>
                {iconFor(n.kind)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-ink">{n.title}</span>
                  {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />}
                </span>
                <span className="mt-1 block text-[12.5px] leading-snug text-ink-400">{n.body}</span>
                <span className="mt-1.5 block text-[11px] font-semibold text-ink-300">{n.time}</span>
              </span>
            </Press>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-ink/10 bg-white p-5">
          <Label className="text-ink-300">Preferences</Label>
          {[
            { l: 'Event reminders', on: true },
            { l: 'Table & placement updates', on: true },
            { l: 'New events from hosts you follow', on: true },
            { l: 'Marketing & offers', on: false },
          ].map((p, i) => (
            <div key={p.l} className={`flex items-center justify-between ${i === 0 ? 'mt-3' : 'mt-4'}`}>
              <span className="text-[13.5px] font-semibold text-ink">{p.l}</span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${p.on ? 'bg-sage' : 'bg-ink/15'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.on ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
