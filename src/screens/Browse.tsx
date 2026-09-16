import React, { useMemo, useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Chip, SearchInput, EmptyState, Button, Sheet, Field, Select, Skeleton } from '@/components/kit';
import EventCard from '@/components/EventCard';
import { isFuture } from '@/lib/helpers';
import { SlidersHorizontal, MapPin, CalendarDays } from 'lucide-react';


const Browse: React.FC = () => {
  const { db, back, current } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>(current.params?.category || 'All');
  const [sort, setSort] = useState('Date');
  const [filters, setFilters] = useState<any>({ city: '', from: '', to: '', near: false });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    let list = db.events.filter((e: any) => e.status === 'published');
    if (cat !== 'All') list = list.filter((e: any) => e.category === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((e: any) => {
        const org = db.organizers.find((o: any) => o.id === e.organizerId);
        return e.title.toLowerCase().includes(s) || (org?.name || '').toLowerCase().includes(s) || e.city.toLowerCase().includes(s);
      });
    }
    if (filters.city) list = list.filter((e: any) => e.city.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.near) list = list.filter((e: any) => ['San Francisco', 'Oakland', 'San Jose'].includes(e.city));
    if (filters.from) list = list.filter((e: any) => +new Date(e.startDate) >= +new Date(filters.from));
    if (filters.to) list = list.filter((e: any) => +new Date(e.startDate) <= +new Date(filters.to));
    list = [...list].sort((a: any, b: any) => sort === 'Date'
      ? +new Date(a.startDate) - +new Date(b.startDate)
      : a.title.localeCompare(b.title));
    return list;
  }, [db.events, db.organizers, q, cat, sort, filters]);

  const visible = results.slice(0, page * 6);
  const activeFilterCount = [filters.city, filters.from, filters.to, filters.near].filter(Boolean).length;

  return (
    <Screen>
      <TopBar title="Browse Events" subtitle={`${results.length} events`} onBack={back}
        right={<button aria-label="Filters" onClick={() => setShowFilters(true)} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] grid place-items-center">{activeFilterCount}</span>}
        </button>} />
      <div className="px-4 pt-4 space-y-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search events or organizers" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Music', 'Community', 'Conference'].map((c) => (
            <Chip key={c} active={cat === c} onClick={() => { setCat(c); setPage(1); }}>{c}</Chip>
          ))}
          <Chip active={sort === 'Title'} onClick={() => setSort(sort === 'Date' ? 'Title' : 'Date')}>Sort: {sort}</Chip>
          <Chip active={filters.near} onClick={() => setFilters((f: any) => ({ ...f, near: !f.near }))}><MapPin className="w-3.5 h-3.5 inline mr-1" />Near me</Chip>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && <><Skeleton className="h-64" /><Skeleton className="h-64" /></>}
        {!loading && visible.length === 0 && (
          <EmptyState title="No events match your filters" body="Try clearing filters or searching a different city."
            icon={<CalendarDays className="w-6 h-6" />}

            action={<Button size="sm" onClick={() => { setQ(''); setCat('All'); setFilters({ city: '', from: '', to: '', near: false }); }}>Clear filters</Button>} />
        )}
        {!loading && visible.map((e: any) => <EventCard key={e.id} event={e} variant="wide" />)}
        {visible.length < results.length && (
          <Button variant="secondary" full onClick={() => { setLoading(true); setTimeout(() => { setPage((p) => p + 1); setLoading(false); }, 400); }}>
            Load more ({results.length - visible.length} remaining)
          </Button>
        )}
      </div>

      <Sheet open={showFilters} onClose={() => setShowFilters(false)} title="Filters"
        footer={<div className="flex gap-3">
          <Button variant="secondary" full onClick={() => { setFilters({ city: '', from: '', to: '', near: false }); }}>Reset</Button>
          <Button full onClick={() => { setShowFilters(false); setPage(1); }}>Show {results.length} events</Button>
        </div>}>
        <div className="space-y-4">
          <Field label="City" value={filters.city} onChange={(v) => setFilters((f: any) => ({ ...f, city: v }))} placeholder="e.g. Seattle" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="From date" type="date" value={filters.from} onChange={(v) => setFilters((f: any) => ({ ...f, from: v }))} />
            <Field label="To date" type="date" value={filters.to} onChange={(v) => setFilters((f: any) => ({ ...f, to: v }))} />
          </div>
          <Select label="Sort by" value={sort} onChange={setSort} options={['Date', 'Title']} />
        </div>
      </Sheet>
    </Screen>
  );
};

export default Browse;
