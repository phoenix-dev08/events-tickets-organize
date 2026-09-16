import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Badge, Field, Select, Chip, EmptyState, Sheet } from '@/components/kit';
import { PermissionBlock } from '@/screens/organizer/Orders';
import { relTime } from '@/lib/helpers';
import { QrCode, CheckCircle2, XCircle, AlertTriangle, WifiOff, RefreshCw, Camera } from 'lucide-react';

const CheckIn: React.FC = () => {
  const { db, sel, back, myOrganizerId, current, setCheckIn, can, offline, setOffline, queue, syncQueue, toast } = useApp();
  const events = sel.orgEvents(myOrganizerId);
  const [eventId, setEventId] = useState(current.params?.eventId || db.showcaseEventId);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [unitFilter, setUnitFilter] = useState('All');
  const [camera, setCamera] = useState(false);

  if (!can('scan')) return <PermissionBlock title="Scan tickets" />;

  const event = sel.event(eventId);
  const tickets = db.tickets.filter((t: any) => t.eventId === eventId);
  const checkedIn = tickets.filter((t: any) => t.checkInStatus === 'Checked In').length;
  const recent = db.checkIns.filter((c: any) => c.eventId === eventId).slice(0, 8);
  const layouts = db.layouts.filter((l: any) => l.eventId === eventId);
  const units = layouts.flatMap((l: any) => sel.units(l.id));

  const scan = (value: string) => {
    const t = tickets.find((x: any) => x.code.toLowerCase() === value.trim().toLowerCase() || x.id === value);
    if (!t) { setResult({ status: 'invalid', message: 'Ticket not found for this event' }); return; }
    const places = sel.placementsForTicket(t.id);
    if (t.status !== 'valid') { setResult({ status: 'invalid', ticket: t, places, message: 'This ticket was refunded and is not valid.' }); return; }
    if (t.checkInStatus === 'Checked In') { setResult({ status: 'already', ticket: t, places, message: 'Already checked in' }); return; }
    setResult({ status: 'valid', ticket: t, places, message: 'Valid ticket' });
  };

  const simulate = () => {
    const pool = tickets.filter((t: any) => t.checkInStatus !== 'Checked In' && t.status === 'valid');
    const t = pool[Math.floor(Math.random() * pool.length)] || tickets[0];
    if (!t) { toast('No tickets for this event', 'info'); return; }
    setCode(t.code); scan(t.code);
  };

  const filteredList = tickets.filter((t: any) => {
    if (unitFilter === 'All') return true;
    return sel.placementsForTicket(t.id).some((p: any) => p.unitId === unitFilter);
  });

  return (
    <Screen>
      <TopBar title="Scan tickets" subtitle={event?.title} onBack={back}
        right={<button onClick={() => { setOffline(!offline); toast(offline ? 'Back online' : 'Offline mode on — scans will queue'); }} aria-label="Toggle offline" className={`p-2 ${offline ? 'text-amber-500' : 'text-slate-400'}`}><WifiOff className="w-5 h-5" /></button>} />
      <div className="px-4 pt-4 space-y-3">
        <Select value={eventId} onChange={setEventId} options={events.map((e: any) => ({ value: e.id, label: e.title }))} />

        {offline && (
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 flex items-center justify-between">
            <div><p className="text-[13px] font-semibold text-amber-800 dark:text-amber-200">Offline mode</p><p className="text-[12px] text-amber-700 dark:text-amber-300">Manifest may be stale · {queue.length} queued</p></div>
            <Button size="sm" variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setOffline(false); syncQueue(); }}>Sync</Button>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Checked in" value={String(checkedIn)} tone="text-emerald-600" />
          <Stat label="Expected" value={String(tickets.length)} />
          <Stat label="Capacity" value={String(event?.capacity ?? 0)} />
        </div>

        <Card className="p-4 space-y-3">
          <div className="rounded-2xl bg-slate-900 h-40 grid place-items-center relative overflow-hidden">
            {camera ? (
              <div className="text-center text-white">
                <div className="w-28 h-28 border-2 border-emerald-400 rounded-xl mx-auto animate-pulse" />
                <p className="text-[12px] mt-2 text-white/70">Scanning… point at a ticket QR</p>
              </div>
            ) : (
              <div className="text-center text-white/70">
                <QrCode className="w-10 h-10 mx-auto" />
                <p className="text-[12.5px] mt-2">Camera preview</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" variant={camera ? 'secondary' : 'primary'} icon={<Camera className="w-4 h-4" />}
              onClick={() => { setCamera(!camera); toast(camera ? 'Camera stopped' : 'Camera permission granted (simulated)'); }}>
              {camera ? 'Stop camera' : 'Start camera'}
            </Button>
            <Button className="flex-1" variant="outline" onClick={simulate}>Simulate scan</Button>
          </div>
          <div className="flex gap-2">
            <Field value={code} onChange={setCode} placeholder="Enter ticket code e.g. RDM-AB12CD" className="flex-1" />
            <Button onClick={() => scan(code)}>Check</Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-semibold text-[14px] mb-2 text-slate-900 dark:text-white">Check-in by placement</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Chip active={unitFilter === 'All'} onClick={() => setUnitFilter('All')}>All</Chip>
            {units.map((u: any) => {
              const assigned = db.placements.filter((p: any) => p.unitId === u.id);
              const inCount = assigned.filter((p: any) => db.tickets.find((t: any) => t.id === p.ticketId)?.checkInStatus === 'Checked In').length;
              return <Chip key={u.id} active={unitFilter === u.id} onClick={() => setUnitFilter(u.id)}>{u.label} {inCount}/{assigned.length}</Chip>;
            })}
          </div>
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {filteredList.slice(0, 40).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium truncate text-slate-900 dark:text-white">{t.holderName}</p>
                  <p className="text-[12px] text-slate-500">{t.ticketTypeTitle} · {t.code}</p>
                </div>
                <Button size="sm" variant={t.checkInStatus === 'Checked In' ? 'outline' : 'secondary'}
                  onClick={() => { const r = setCheckIn(t.id, t.checkInStatus === 'Checked In' ? 'Check Out' : 'Check In'); if (r.error) toast(r.error, 'error'); else toast(t.checkInStatus === 'Checked In' ? 'Checked out' : 'Checked in'); }}>
                  {t.checkInStatus === 'Checked In' ? 'Check out' : 'Check in'}
                </Button>
              </div>
            ))}
            {filteredList.length === 0 && <EmptyState title="Nobody assigned here yet" />}
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-semibold text-[14px] mb-2 text-slate-900 dark:text-white">Recent scans</p>
          {recent.length === 0 && <p className="text-[12.5px] text-slate-500">No scans yet.</p>}
          {recent.map((c: any) => {
            const t = db.tickets.find((x: any) => x.id === c.ticketId);
            return <div key={c.id} className="flex justify-between py-1.5 text-[13px]"><span className="text-slate-700 dark:text-slate-200">{t?.holderName}</span><span className="text-slate-400">{c.action} · {relTime(c.at)}</span></div>;
          })}
        </Card>
      </div>

      <Sheet open={!!result} onClose={() => setResult(null)} title="Scan result"
        footer={result?.ticket && result.status !== 'invalid' ? (
          <div className="flex gap-2">
            <Button full variant="secondary" onClick={() => { const r = setCheckIn(result.ticket.id, 'Check Out'); toast(r.error || 'Checked out', r.error ? 'error' : 'success'); setResult(null); }}>Check out</Button>
            <Button full disabled={result.status === 'already'} onClick={() => { const r = setCheckIn(result.ticket.id, 'Check In'); toast(r.error || `${result.ticket.holderName} checked in`, r.error ? 'error' : 'success'); setResult(null); setCode(''); }}>Check in</Button>
          </div>
        ) : <Button full variant="secondary" onClick={() => setResult(null)}>Close</Button>}>
        {result && (
          <div className="text-center py-4">
            {result.status === 'valid' && <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500" />}
            {result.status === 'already' && <AlertTriangle className="w-16 h-16 mx-auto text-amber-500" />}
            {result.status === 'invalid' && <XCircle className="w-16 h-16 mx-auto text-rose-500" />}
            <p className="text-[18px] font-bold mt-3 text-slate-900 dark:text-white">{result.ticket?.holderName || 'Unknown ticket'}</p>
            <p className="text-[13.5px] text-slate-500">{result.ticket?.ticketTypeTitle}</p>
            <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
              <Badge tone={result.status === 'valid' ? 'green' : result.status === 'already' ? 'amber' : 'rose'}>{result.message}</Badge>
              {(result.places || []).map((p: any) => <Badge key={p.id} tone="indigo">{sel.unit(p.unitId)?.label}</Badge>)}
            </div>
          </div>
        )}
      </Sheet>
    </Screen>
  );
};

const Stat: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <Card className="p-3 text-center">
    <p className={`text-[19px] font-bold ${tone || 'text-slate-900 dark:text-white'}`}>{value}</p>
    <p className="text-[11px] text-slate-500">{label}</p>
  </Card>
);

export default CheckIn;
