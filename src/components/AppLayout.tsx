import React from 'react';
import { AppStoreProvider, useApp } from '@/store/AppStore';
import { cx } from '@/lib/helpers';
import { Compass, Ticket, LayoutDashboard, User, ShoppingCart, Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react';

import Explore from '@/screens/Explore';
import Browse from '@/screens/Browse';
import EventDetail from '@/screens/EventDetail';
import Cart from '@/screens/Cart';
import Holders from '@/screens/Holders';
import Checkout from '@/screens/Checkout';
import OrderSuccess from '@/screens/OrderSuccess';
import Auth from '@/screens/Auth';
import Help from '@/screens/Help';
import { TicketsList, TicketDetail, WalletPass } from '@/screens/Tickets';
import { Profile, Notifications, Payments, Following, Legal } from '@/screens/Profile';
import Dashboard from '@/screens/organizer/Dashboard';
import EventEditor from '@/screens/organizer/EventEditor';
import { Orders, Roster } from '@/screens/organizer/Orders';
import CheckIn from '@/screens/organizer/CheckIn';
import { Layouts, LayoutBuilder } from '@/screens/organizer/Seating';
import { Coupons, Announcements, Enquiries, Followers, Payouts, Team, Marketing } from '@/screens/organizer/Comms';
import { Admin, DemoControls, DeepLinks, Analytics } from '@/screens/admin/Admin';

/* Every internal route in the Redeemed Events app */
const ROUTES: Record<string, React.FC> = {
  explore: Explore, browse: Browse, event: EventDetail, cart: Cart, holders: Holders, checkout: Checkout,
  'order-success': OrderSuccess, auth: Auth, help: Help,
  tickets: TicketsList, ticket: TicketDetail, wallet: WalletPass,
  profile: Profile, notifications: Notifications, payments: Payments, following: Following, legal: Legal,
  organize: Dashboard, 'event-editor': EventEditor, 'org-orders': Orders, 'org-roster': Roster, 'org-scan': CheckIn,
  'org-layouts': Layouts, 'org-layout': LayoutBuilder, 'org-coupons': Coupons, 'org-announcements': Announcements,
  'org-enquiries': Enquiries, 'org-followers': Followers, 'org-payouts': Payouts, 'org-team': Team, 'org-marketing': Marketing,
  admin: Admin, 'demo-controls': DemoControls, 'deep-links': DeepLinks, analytics: Analytics,
};

const Shell: React.FC = () => {
  const { current, tab, setTab, user, session, activeRole, cartCount, go, toasts, sel, booting, bootError, boot, syncing } = useApp();
  const ActiveScreen = ROUTES[current.route] || Explore;
  const showOrganize = !!user && (user.roles?.includes('organizer') || user.roles?.includes('team') || user.roles?.includes('admin'));
  const unread = session ? sel.notifications().filter((n: any) => !n.read).length : 0;

  const tabs = [
    { key: 'explore', label: 'Explore', icon: Compass },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
    ...(showOrganize ? [{ key: 'organize', label: 'Organize', icon: LayoutDashboard }] : []),
    ...(activeRole === 'admin' ? [{ key: 'admin', label: 'Admin', icon: Shield }] : []),
    { key: 'profile', label: 'Profile', icon: User },
  ];

  /* Connecting to the shared live database */
  if (booting || bootError) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold mx-auto">RE</div>
          <p className="mt-4 text-[17px] font-bold text-slate-900 dark:text-white">Redeemed Events</p>
          {bootError ? (
            <>
              <p className="mt-2 text-[13.5px] text-rose-600">{bootError}</p>
              <button onClick={boot} className="mt-4 h-11 px-5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Retry connection</button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[13.5px] text-slate-500">Syncing the live event database…</p>
              <div className="mt-4 h-1.5 w-40 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full w-1/2 bg-indigo-600 animate-pulse" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="md:flex">
        {/* Desktop / tablet navigation rail */}
        <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold text-[13px]">RE</div>
            <div><p className="font-bold text-[15px] leading-tight">Redeemed</p><p className="text-[11px] text-slate-500">Events</p></div>
          </div>
          <nav className="mt-4 space-y-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cx('w-full flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] font-medium transition',
                  tab === t.key ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800')}>
                <t.icon className="w-5 h-5" />{t.label}
              </button>
            ))}
            <button onClick={() => go('cart')} className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <ShoppingCart className="w-5 h-5" />Cart
              {cartCount > 0 && <span className="ml-auto bg-indigo-600 text-white text-[11px] rounded-full px-2 py-0.5">{cartCount}</span>}
            </button>
            {!session && <button onClick={() => go('auth')} className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] font-semibold text-indigo-600">Sign in</button>}
          </nav>
          {user && (
            <div className="mt-auto flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              <div className="min-w-0"><p className="text-[12.5px] font-medium truncate">{user.name}</p><p className="text-[11px] text-slate-500 capitalize">{activeRole}</p></div>
            </div>
          )}
        </aside>

        {/* Active screen */}
        <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full">
          <ActiveScreen key={current.route + JSON.stringify(current.params || {})} />
        </main>
      </div>

      {/* Live sync indicator — realtime updates from other devices */}
      {syncing && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-semibold shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />Live sync
        </div>
      )}


      {/* Floating cart (mobile) */}
      {cartCount > 0 && current.route !== 'cart' && current.route !== 'checkout' && (
        <button onClick={() => go('cart')} aria-label="Open cart"
          className="md:hidden fixed right-4 bottom-24 z-30 h-12 px-4 rounded-full bg-indigo-600 text-white shadow-lg flex items-center gap-2 text-[14px] font-semibold">
          <ShoppingCart className="w-4 h-4" />{cartCount}
        </button>
      )}

      {/* Bottom tab bar (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} aria-label={t.label}
              className={cx('flex-1 py-2.5 flex flex-col items-center gap-0.5 min-h-[56px] justify-center',
                tab === t.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
              <span className="relative">
                <t.icon className="w-5 h-5" />
                {t.key === 'profile' && unread > 0 && <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500" />}
              </span>
              <span className="text-[10.5px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Toasts */}
      <div className="fixed top-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t: any) => (
          <div key={t.id} className={cx('px-4 py-2.5 rounded-xl shadow-lg text-[13.5px] font-medium flex items-center gap-2 max-w-md',
            t.kind === 'error' ? 'bg-rose-600 text-white' : t.kind === 'info' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white')}>
            {t.kind === 'error' ? <AlertCircle className="w-4 h-4" /> : t.kind === 'info' ? <Info className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => (
  <AppStoreProvider>
    <Shell />
  </AppStoreProvider>
);

export default AppLayout;
