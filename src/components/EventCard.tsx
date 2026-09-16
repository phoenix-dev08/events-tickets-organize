import React from 'react';
import { useApp } from '@/store/AppStore';
import { Badge } from '@/components/kit';
import { fmtDate, fmtTime, money, isFuture, cx } from '@/lib/helpers';
import { MapPin, Calendar } from 'lucide-react';

export const EventCard: React.FC<{ event: any; variant?: 'list' | 'wide' | 'mini' }> = ({ event, variant = 'list' }) => {
  const { go, sel } = useApp();
  const org = sel.organizer(event.organizerId);
  const tts = sel.ticketTypes(event.id);
  const from = tts.length ? Math.min(...tts.map((t: any) => t.price)) : 0;
  const soldOut = event.sold >= event.capacity || tts.every((t: any) => !t.available);
  const past = !isFuture(event.startDate);
  const status = past ? { tone: 'slate' as const, label: 'Past event' } : soldOut ? { tone: 'rose' as const, label: 'Sold out' } : { tone: 'green' as const, label: `${event.capacity - event.sold} left` };

  if (variant === 'mini') {
    return (
      <button onClick={() => go('event', { id: event.id })} className="w-56 shrink-0 text-left active:scale-[0.98] transition">
        <img src={event.image} alt={event.title} loading="lazy" className="w-56 h-32 object-cover rounded-2xl" />
        <p className="mt-2 font-semibold text-[14px] leading-snug line-clamp-2 text-slate-900 dark:text-white">{event.title}</p>
        <p className="text-[12px] text-slate-500 mt-0.5">{fmtDate(event.startDate)} · {event.city}</p>
        <p className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{from === 0 ? 'Free' : `From ${money(from)}`}</p>
      </button>
    );
  }

  return (
    <button onClick={() => go('event', { id: event.id })}
      className={cx('w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden active:scale-[0.99] transition',
        variant === 'wide' && 'sm:flex')}>
      <div className="relative">
        <img src={event.image} alt={event.title} loading="lazy" className={cx('w-full object-cover', variant === 'wide' ? 'h-44 sm:w-64 sm:h-full' : 'h-40')} />
        <span className="absolute top-3 left-3"><Badge tone="indigo">{event.category}</Badge></span>
        <span className="absolute top-3 right-3"><Badge tone={status.tone}>{status.label}</Badge></span>
      </div>
      <div className="p-4 flex-1">
        <p className="font-semibold text-[15px] leading-snug text-slate-900 dark:text-white">{event.title}</p>
        <p className="text-[12.5px] text-slate-500 mt-0.5">by {org?.name || 'Organizer'}</p>
        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 dark:text-slate-400 mt-2">
          <Calendar className="w-3.5 h-3.5" /> {fmtDate(event.startDate)} · {fmtTime(event.startTime)}
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 dark:text-slate-400 mt-1">
          <MapPin className="w-3.5 h-3.5" /> {event.venue ? `${event.venue}, ` : ''}{event.city}, {event.state}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[15px] font-bold text-slate-900 dark:text-white">{from === 0 ? 'Free' : `From ${money(from)}`}</span>
          <span className="text-[12px] text-slate-500">{event.sold}/{event.capacity} sold</span>
        </div>
      </div>
    </button>
  );
};

export default EventCard;
