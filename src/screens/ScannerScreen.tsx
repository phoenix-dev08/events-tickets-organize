import React, { useState } from 'react';
import { KPIS, PORTRAITS } from '@/data/redeemed';
import { Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

type Result =
  | { kind: 'ok'; name: string; tier: string; table: number; time: string; avatar: string }
  | { kind: 'dup'; name: string; time: string }
  | { kind: 'bad' };

const ScannerScreen: React.FC = () => {
  const { setRoot, showToast } = useDemo();
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(KPIS.checkedIn);
  const [codeSheet, setCodeSheet] = useState(false);
  const [code, setCode] = useState('');

  const simulate = (kind: Result['kind']) => {
    if (kind === 'ok') {
      setResult({ kind: 'ok', name: 'Maya Johnson', tier: 'Premium', table: 7, time: '9:42 AM', avatar: PORTRAITS[0] });
      setCount(c => c + 1);
    } else if (kind === 'dup') {
      setResult({ kind: 'dup', name: 'Jordan Mitchell', time: '9:18 AM' });
    } else {
      setResult({ kind: 'bad' });
    }
    window.setTimeout(() => setResult(null), 2300);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-ink-900 text-ivory">
      {/* Camera field */}
      <div className="absolute inset-0">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 42%, #1d2a3f 0%, #0A101C 72%)' }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-6">
        <div>
          <Label className="text-champagne">Check-in · Hall entry B</Label>
          <h1 className="mt-1.5 font-display text-[23px] leading-tight text-ivory">Redeem Conference 2026</h1>
        </div>
        <div className="rounded-2xl border border-white/12 bg-white/[0.06] px-3 py-2 text-right">
          <p className="text-[15px] font-extrabold tabular-nums text-ivory">{count}</p>
          <p className="text-[10px] font-bold text-ivory/45">/ {KPIS.sold.toLocaleString()}</p>
        </div>
      </div>

      {/* Scanner frame */}
      <div className="relative z-10 mt-10 flex justify-center px-8">
        <div className="relative aspect-square w-full max-w-[290px]">
          <div className="absolute inset-0 rounded-[34px] border border-white/10" />
          {[
            'left-0 top-0 border-l-2 border-t-2 rounded-tl-[30px]',
            'right-0 top-0 border-r-2 border-t-2 rounded-tr-[30px]',
            'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[30px]',
            'right-0 bottom-0 border-r-2 border-b-2 rounded-br-[30px]',
          ].map(c => (
            <span key={c} className={`absolute h-16 w-16 border-champagne ${c}`} />
          ))}
          <div className="absolute inset-6 animate-scan rounded-full"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(201,165,87,0.55), transparent)', height: '3px', top: '50%' }} />
          <div className="absolute inset-0 grid place-items-center">
            <Icon.Qr className="h-14 w-14 text-white/12" />
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-7 text-center text-[13px] font-semibold text-ivory/55">
        Hold the attendee’s QR code inside the frame
      </p>

      {/* Demo triggers */}
      <div className="relative z-10 mt-6 px-5">
        <Label className="text-ivory/40">Demo triggers</Label>
        <div className="mt-2.5 flex gap-2">
          <Press onClick={() => simulate('ok')}
            className="min-h-[46px] flex-1 rounded-xl bg-sage text-center text-[12px] font-bold text-white">Valid ticket</Press>
          <Press onClick={() => simulate('dup')}
            className="min-h-[46px] flex-1 rounded-xl border border-champagne/50 text-center text-[12px] font-bold text-champagne">Duplicate</Press>
          <Press onClick={() => simulate('bad')}
            className="min-h-[46px] flex-1 rounded-xl border border-coral/50 text-center text-[12px] font-bold text-coral-light">Invalid</Press>
        </div>
      </div>

      {/* Footer actions */}
      <div className="absolute inset-x-0 bottom-[84px] z-10 flex gap-3 px-5">
        <Press onClick={() => setCodeSheet(true)}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl glass-dark border border-white/12 text-[13.5px] font-bold text-ivory">
          <Icon.Qr className="h-4 w-4" />Enter Code
        </Press>
        <Press onClick={() => setRoot({ k: 'org-attendees' })}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl glass-dark border border-white/12 text-[13.5px] font-bold text-ivory">
          <Icon.Users className="h-4 w-4" />Guest List
        </Press>
      </div>

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 animate-fade-in"
            style={{
              background: result.kind === 'ok' ? 'rgba(63,125,98,0.94)'
                : result.kind === 'dup' ? 'rgba(163,130,60,0.94)' : 'rgba(193,58,37,0.94)',
            }} />
          <div className="relative w-full animate-pop text-center">
            {result.kind === 'ok' && (
              <>
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20">
                  <Icon.Check className="h-11 w-11 text-white" strokeWidth={2.4} />
                </span>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-label text-white/75">Checked in</p>
                <p className="mt-2 font-display text-[30px] leading-tight text-white">{result.name}</p>
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                  <img src={result.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <span className="text-left">
                    <span className="block text-[12px] font-bold text-white/80">{result.tier}</span>
                    <span className="block font-display text-[19px] leading-tight text-white">TABLE {result.table}</span>
                  </span>
                </div>
                <p className="mt-4 text-[13px] font-bold text-white/80">{result.time}</p>
              </>
            )}
            {result.kind === 'dup' && (
              <>
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20">
                  <Icon.Clock className="h-10 w-10 text-white" />
                </span>
                <p className="mt-5 font-display text-[27px] leading-tight text-white">Already checked in</p>
                <p className="mt-2 text-[14px] font-semibold text-white/85">{result.name} · {result.time}</p>
                <p className="mt-4 text-[12px] text-white/65">Send to guest services if this looks wrong.</p>
              </>
            )}
            {result.kind === 'bad' && (
              <>
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20">
                  <Icon.Close className="h-10 w-10 text-white" strokeWidth={2.2} />
                </span>
                <p className="mt-5 font-display text-[27px] leading-tight text-white">Ticket not recognized</p>
                <p className="mt-2 text-[13px] text-white/80">This code isn’t valid for Redeem Conference 2026.</p>
              </>
            )}
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-label text-white/55">Returning to scanner…</p>
          </div>
        </div>
      )}

      <Sheet open={codeSheet} onClose={() => setCodeSheet(false)} dark label="Enter code">
        <div className="px-5 pb-7 pt-3">
          <h3 className="font-display text-[22px] text-ivory">Enter ticket code</h3>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="RE-826194"
            className="mt-4 h-[54px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 font-mono text-[15px] tracking-wider text-ivory outline-none placeholder:text-ivory/30"
          />
          <Press
            onClick={() => {
              setCodeSheet(false);
              if (code.replace(/\s/g, '').toUpperCase().startsWith('RE-')) simulate('ok');
              else { simulate('bad'); showToast('Code not found'); }
              setCode('');
            }}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-champagne text-[14px] font-extrabold text-ink-900">
            Check in
          </Press>
        </div>
      </Sheet>
    </div>
  );
};

export default ScannerScreen;
