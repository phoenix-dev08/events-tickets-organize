import React from 'react';
import { EventItem } from '@/data/redeemed';
import { Icon, Label, Press } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

export const FavButton: React.FC<{ id: string; className?: string; light?: boolean }> = ({ id, className = '', light }) => {
  const { favorites, toggleFav } = useDemo();
  const on = favorites.includes(id);
  return (
    <Press
      aria-label={on ? 'Remove from favorites' : 'Save event'}
      onClick={(e) => { e.stopPropagation(); toggleFav(id); }}
      className={`grid h-11 w-11 place-items-center rounded-full ${light ? 'glass-dark text-ivory' : 'bg-ivory/90 text-ink'} ${className}`}
    >
      <Icon.Heart
        filled={on}
        className={`w-[19px] h-[19px] transition-all duration-300 ${on ? 'text-coral scale-110' : ''}`}
      />
    </Press>
  );
};

const priceLabel = (n: number) => (n === 0 ? 'Free' : `From $${n}`);

/* Tall editorial card for horizontal rails (4:5) */
export const RailCard: React.FC<{ event: EventItem; onOpen: () => void; delay?: number }> = ({ event, onOpen, delay = 0 }) => (
  <Press
    onClick={onOpen}
    className="animate-rise w-[232px] shrink-0"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="relative overflow-hidden rounded-[22px] shadow-soft">
      <div className="aspect-[4/5] overflow-hidden">
        <img src={event.image} alt={event.title} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.06]" />
      </div>
      <div className="absolute inset-0 scrim-soft" />
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
        <Label className="text-ivory/90">{event.category}</Label>
      </div>
      <FavButton id={event.id} light className="absolute right-2.5 top-2.5 !h-9 !w-9" />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="font-display text-[19px] leading-[1.12] text-ivory">{event.title}</p>
        <p className="mt-1.5 text-[11.5px] font-medium text-ivory/75">{event.organizer}</p>
      </div>
    </div>
    <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
      <div>
        <p className="text-[12.5px] font-bold text-ink">{event.dateLabel.replace(', 2026', '')}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-400 line-clamp-1">{event.venue}</p>
      </div>
      <p className="whitespace-nowrap text-[12.5px] font-extrabold text-coral">{priceLabel(event.fromPrice)}</p>
    </div>
  </Press>
);

/* Full-bleed feature card */
export const FeatureCard: React.FC<{ event: EventItem; onOpen: () => void; caption?: string }> = ({ event, onOpen, caption }) => (
  <Press onClick={onOpen} className="relative block w-full overflow-hidden rounded-[26px] shadow-lift animate-rise">
    <div className="aspect-[16/11] overflow-hidden">
      <img src={event.imageAlt} alt={event.title} loading="lazy" className="h-full w-full object-cover" />
    </div>
    <div className="absolute inset-0 scrim-b" />
    <FavButton id={event.id} light className="absolute right-3 top-3" />
    <div className="absolute inset-x-0 bottom-0 p-5">
      {caption && (
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-champagne/45 px-2.5 py-1">
          <Icon.Sparkle className="h-3 w-3 text-champagne" />
          <Label className="text-champagne">{caption}</Label>
        </div>
      )}
      <p className="font-display text-[26px] leading-[1.08] text-ivory">{event.title}</p>
      <p className="mt-2 text-[12.5px] font-medium text-ivory/80">
        {event.dateLabel.replace(', 2026', '')} · {event.venue}
      </p>
      <div className="mt-3.5 flex items-center gap-3">
        <span className="rounded-full bg-ivory px-3.5 py-2 text-[12.5px] font-bold text-ink">{priceLabel(event.fromPrice)}</span>
        <span className="text-[12px] font-semibold text-ivory/70">{event.attending.toLocaleString()} going</span>
      </div>
    </div>
  </Press>
);

/* Compact horizontal row card */
export const RowCard: React.FC<{ event: EventItem; onOpen: () => void }> = ({ event, onOpen }) => (
  <Press onClick={onOpen} className="flex w-full items-center gap-3.5 animate-rise">
    <div className="relative h-[92px] w-[76px] shrink-0 overflow-hidden rounded-[16px]">
      <img src={event.image} alt={event.title} loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-ink-900/80 py-1 text-center">
        <p className="text-[9px] font-bold tracking-label text-champagne">{event.dayShort}</p>
        <p className="-mt-0.5 text-[13px] font-extrabold leading-tight text-ivory">{event.dayNum}</p>
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <Label className="text-ink-300">{event.tagline}</Label>
      <p className="mt-1 font-display text-[17px] leading-[1.15] text-ink line-clamp-2">{event.title}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-400">
        <Icon.Pin className="h-3.5 w-3.5" />
        <span className="line-clamp-1">{event.venue}</span>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-[13px] font-extrabold text-ink">{priceLabel(event.fromPrice)}</p>
      <div className="mt-2 ml-auto grid h-8 w-8 place-items-center rounded-full bg-ink/[0.06] text-ink-600">
        <Icon.Chevron className="h-4 w-4" />
      </div>
    </div>
  </Press>
);

export const SectionHead: React.FC<{
  kicker?: string; title: string; action?: string; onAction?: () => void; dark?: boolean;
}> = ({ kicker, title, action, onAction, dark }) => (
  <div className="mb-3.5 flex items-end justify-between gap-3 px-5">
    <div>
      {kicker && <Label className={dark ? 'text-champagne' : 'text-coral'}>{kicker}</Label>}
      <h2 className={`mt-1 font-display text-[23px] leading-tight ${dark ? 'text-ivory' : 'text-ink'}`}>{title}</h2>
    </div>
    {action && (
      <Press onClick={onAction} className={`shrink-0 pb-1 text-[12.5px] font-bold ${dark ? 'text-ivory/70' : 'text-ink-400'}`}>
        {action}
      </Press>
    )}
  </div>
);
