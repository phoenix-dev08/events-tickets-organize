import React, { useEffect, useRef } from 'react';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { BottomNav, OrgNav, RoleTransition } from '@/components/Chrome';
import { Toast } from '@/components/ui/kit';
import AuthSheet from '@/components/AuthSheet';

import ExploreScreen from '@/screens/ExploreScreen';
import EventDetailScreen from '@/screens/EventDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import TablePickerScreen from '@/screens/TablePickerScreen';
import PaymentScreen from '@/screens/PaymentScreen';
import { TicketsScreen, TicketDetailScreen } from '@/screens/TicketsScreen';
import { ProfileScreen, NotificationsScreen } from '@/screens/ProfileScreen';
import OrganizerDashboard from '@/screens/OrganizerDashboard';
import AttendeesScreen from '@/screens/AttendeesScreen';
import SeatingBuilder from '@/screens/SeatingBuilder';
import ScannerScreen from '@/screens/ScannerScreen';
import CreateEventFlow from '@/screens/CreateEventFlow';

const Router: React.FC = () => {
  const { screen } = useDemo();
  switch (screen.k) {
    case 'explore': return <ExploreScreen />;
    case 'event': return <EventDetailScreen />;
    case 'checkout': return <CheckoutScreen />;
    case 'tables': return <TablePickerScreen />;
    case 'payment': return <PaymentScreen />;
    case 'tickets': return <TicketsScreen />;
    case 'ticket': return <TicketDetailScreen />;
    case 'profile': return <ProfileScreen />;
    case 'notifications': return <NotificationsScreen />;
    case 'org-dash': return <OrganizerDashboard />;
    case 'org-attendees': return <AttendeesScreen />;
    case 'org-seating': return <SeatingBuilder />;
    case 'org-scan': return <ScannerScreen />;
    case 'org-create': return <CreateEventFlow />;
    default: return <ExploreScreen />;
  }
};

const Device: React.FC = () => {
  const { screen, stack, mode, switching, toast, toastTone, authSheet, closeAuthSheet, runAuthNext } = useDemo();

  const scroller = useRef<HTMLDivElement>(null);

  // Reset scroll on navigation
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen.k, screen.id, stack.length]);

  const darkShell = mode === 'organizer';
  const hideNav = screen.k === 'ticket' || screen.k === 'org-create';

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${darkShell ? 'bg-ink-900' : 'bg-ivory'}`}>
      {/* Status bar */}
      <div className={`z-40 flex shrink-0 items-center justify-between px-6 pb-1 pt-3 text-[11.5px] font-bold ${darkShell ? 'text-ivory' : 'text-ink'}`}>

        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="flex items-end gap-[2px]">
            {[3, 5, 7, 9].map(h => (
              <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: `${h}px` }} />
            ))}
          </span>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M12 18.5a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM7.8 15.2l1.5 1.5a3.9 3.9 0 0 1 5.4 0l1.5-1.5a6 6 0 0 0-8.4 0zM4.6 12l1.5 1.5a8.4 8.4 0 0 1 11.8 0L19.4 12a10.5 10.5 0 0 0-14.8 0z" />
          </svg>
          <span className="relative ml-0.5 inline-flex h-3 w-6 items-center rounded-[3px] border border-current px-[2px]">
            <span className="h-[6px] w-full rounded-[1px] bg-current" />
          </span>
        </div>
      </div>

      {/* Scroll area — intentionally NOT `relative` so bottom sheets and sticky CTAs anchor to the device frame */}
      <div
        ref={scroller}
        data-scroll
        className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${hideNav ? '' : 'pb-[76px]'}`}
      >

        <div key={`${screen.k}-${screen.id ?? ''}-${stack.length}`} className="min-h-full animate-fade-in">
          <Router />
        </div>
      </div>

      {!hideNav && (mode === 'organizer' ? <OrgNav /> : <BottomNav />)}
      <AuthSheet
        open={authSheet.open}
        headline={authSheet.headline}
        sub={authSheet.sub}
        onClose={closeAuthSheet}
        onSuccess={runAuthNext}
      />
      <Toast message={toast} tone={toastTone} />
      <RoleTransition show={switching} to={mode === 'organizer' ? 'attendee' : 'organizer'} />
    </div>
  );
};


const AppLayout: React.FC = () => (
  <DemoProvider>
    <div className="relative min-h-screen w-full overflow-hidden bg-ink-900">
      {/* Ambient backdrop for large screens */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 22% 18%, rgba(201,165,87,0.22), transparent 42%), radial-gradient(circle at 78% 82%, rgba(232,81,56,0.2), transparent 45%), linear-gradient(160deg, #0A101C, #121C2E)' }} />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col lg:max-w-none lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-16">
        {/* Desktop marketing rail */}
        <aside className="hidden max-w-[420px] lg:block">
          <p className="text-[11px] font-bold uppercase tracking-label text-champagne">Product demo · 2026</p>
          <h1 className="mt-4 font-display text-[54px] leading-[0.95] tracking-[-0.02em] text-ivory">
            Redeemed<br />Events
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ivory/65">
            One app, two experiences. Discover events worth showing up for, choose exactly where you’ll sit,
            and run the whole room from the door — attendee and organizer modes in a single premium product.
          </p>
          <div className="mt-8 space-y-3.5">
            {[
              'Editorial discovery with live availability',
              'Interactive table & placement picker',
              'Wallet-grade digital tickets with QR check-in',
              'Organizer dashboard, seating builder and scanner',
            ].map(f => (
              <div key={f} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                <span className="text-[13.5px] font-medium text-ivory/75">{f}</span>
              </div>
            ))}
          </div>
          <p className="mt-9 text-[12px] text-ivory/40">Interact with the app on the right — every flow is live.</p>
        </aside>

        {/* App surface */}
        <div className="relative flex min-h-screen w-full flex-col lg:min-h-0 lg:h-[880px] lg:max-h-[88vh] lg:w-[420px] lg:shrink-0 lg:overflow-hidden lg:rounded-[42px] lg:shadow-[0_50px_120px_-40px_rgba(0,0,0,0.75)]">
          <Device />
        </div>
      </div>
    </div>
  </DemoProvider>
);

export default AppLayout;
