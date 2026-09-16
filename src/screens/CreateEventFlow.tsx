import React, { useState } from 'react';
import { IMG, featuredEvent } from '@/data/redeemed';
import { Icon, Label, Press } from '@/components/ui/kit';
import { useDemo } from '@/contexts/DemoContext';

const STEPS = ['Basics', 'Date & Venue', 'Tickets', 'Placement', 'Options', 'Review'] as const;

const TextRow: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }> = ({
  label, value, onChange, placeholder, multiline,
}) => (
  <label className="block">
    <span className="text-[10.5px] font-bold uppercase tracking-label text-ivory/45">{label}</span>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="mt-1.5 w-full rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-[14px] leading-relaxed text-ivory outline-none placeholder:text-ivory/30 focus:border-champagne/50" />
    ) : (
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 h-[52px] w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 text-[14px] font-semibold text-ivory outline-none placeholder:text-ivory/30 focus:border-champagne/50" />
    )}
  </label>
);

const CreateEventFlow: React.FC = () => {
  const { back, setRoot, showToast } = useDemo();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Redeem Conference 2027');
  const [cat, setCat] = useState('Conference');
  const [about, setAbout] = useState('Three days of main-stage teaching, breakout labs and late-night table conversations for 1,200 leaders.');
  const [venue, setVenue] = useState('Atlanta Convention Center');
  const [date, setDate] = useState('September 23, 2027');
  const [placement, setPlacement] = useState('Tables');
  const [options, setOptions] = useState<string[]>(['Featured Guests', 'Agenda']);
  const [tiers, setTiers] = useState([
    { n: 'General Admission', p: 79, q: 900 },
    { n: 'Premium', p: 149, q: 600 },
    { n: 'VIP Experience', p: 249, q: 120 },
  ]);

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : publish());
  const prev = () => (step === 0 ? back() : setStep(step - 1));
  const publish = () => { showToast('Event published · now on sale', 'green'); setRoot({ k: 'org-dash' }); };

  return (
    <div className="min-h-full bg-ink-900 pb-32 text-ivory">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-dark px-4 py-3">
        <div className="flex items-center gap-3">
          <Press onClick={prev} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-ivory">
            <Icon.Back className="h-5 w-5" />
          </Press>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight text-ivory">Create Event</p>
            <p className="text-[11px] text-ivory/50">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
          </div>
          <Press onClick={() => setRoot({ k: 'org-dash' })} className="text-[12px] font-bold text-champagne">Save draft</Press>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-champagne' : 'bg-white/12'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        {step === 0 && (
          <div className="animate-fade-in space-y-5">
            <div>
              <Label className="text-champagne">Basics</Label>
              <h1 className="mt-1.5 font-display text-[26px] leading-tight">Start with the essentials</h1>
            </div>
            <Press onClick={() => showToast('Cover image selected')}
              className="relative block w-full overflow-hidden rounded-[24px] border border-dashed border-white/20">
              <img src={IMG.conferenceAlt} alt="" className="aspect-[16/9] w-full object-cover opacity-70" />
              <span className="absolute inset-0 grid place-items-center bg-ink-900/45">
                <span className="text-center">
                  <Icon.Image className="mx-auto h-6 w-6 text-champagne" />
                  <span className="mt-2 block text-[12.5px] font-bold text-ivory">Replace cover image</span>
                  <span className="mt-0.5 block text-[10.5px] text-ivory/55">1920 × 1080 recommended</span>
                </span>
              </span>
            </Press>
            <TextRow label="Event name" value={name} onChange={setName} />
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-label text-ivory/45">Category</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Conference', 'Music', 'Community', 'Dinner'].map(c => (
                  <Press key={c} onClick={() => setCat(c)}
                    className={`min-h-[42px] rounded-full px-4 text-[12.5px] font-bold ${cat === c ? 'bg-champagne text-ink-900' : 'bg-white/[0.07] text-ivory/65'}`}>
                    {c}
                  </Press>
                ))}
              </div>
            </div>
            <TextRow label="About event" value={about} onChange={setAbout} multiline />
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-5">
            <div>
              <Label className="text-champagne">Date & Venue</Label>
              <h1 className="mt-1.5 font-display text-[26px] leading-tight">When and where</h1>
            </div>
            <TextRow label="Date" value={date} onChange={setDate} />
            <div className="grid grid-cols-2 gap-3">
              <TextRow label="Start time" value="9:00 AM" onChange={() => {}} />
              <TextRow label="End time" value="8:00 PM" onChange={() => {}} />
            </div>
            <TextRow label="Time zone" value="Eastern Time (ET)" onChange={() => {}} />
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-label text-ivory/45">Venue search</span>
              <div className="mt-1.5 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] px-4">
                <Icon.Search className="h-[18px] w-[18px] text-ivory/45" />
                <input value={venue} onChange={e => setVenue(e.target.value)}
                  className="h-[52px] w-full bg-transparent text-[14px] font-semibold text-ivory outline-none" />
              </div>
              <div className="mt-2.5 space-y-2">
                {['Atlanta Convention Center', 'The Eastern', 'Historic Fourth Ward Park'].map(v => (
                  <Press key={v} onClick={() => setVenue(v)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 ${venue === v ? 'border-champagne/50 bg-champagne/10' : 'border-white/10 bg-white/[0.035]'}`}>
                    <Icon.Pin className="h-4 w-4 shrink-0 text-champagne" />
                    <span className="flex-1 text-[13px] font-semibold text-ivory">{v}</span>
                    {venue === v && <Icon.Check className="h-4 w-4 text-champagne" />}
                  </Press>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <Label className="text-champagne">Tickets</Label>
              <h1 className="mt-1.5 font-display text-[26px] leading-tight">Set your tiers</h1>
            </div>
            {tiers.map((t, i) => (
              <div key={t.n} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-ivory">{t.n}</p>
                    <p className="mt-1 text-[11.5px] text-ivory/50">{t.q} available</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/[0.07] p-1">
                    <Press aria-label="Lower price" onClick={() => setTiers(p => p.map((x, xi) => xi === i ? { ...x, p: Math.max(0, x.p - 10) } : x))}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-ivory"><Icon.Minus className="h-3.5 w-3.5" /></Press>
                    <span key={t.p} className="animate-pop w-14 text-center text-[15px] font-extrabold text-champagne">${t.p}</span>
                    <Press aria-label="Raise price" onClick={() => setTiers(p => p.map((x, xi) => xi === i ? { ...x, p: x.p + 10 } : x))}
                      className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-ink-900"><Icon.Plus className="h-3.5 w-3.5" /></Press>
                  </div>
                </div>
              </div>
            ))}
            <Press onClick={() => setTiers(p => [...p, { n: `Tier ${p.length + 1}`, p: 59, q: 100 }])}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-[13px] font-bold text-ivory/70">
              <Icon.Plus className="h-4 w-4" />Add ticket tier
            </Press>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <Label className="text-champagne">Placement</Label>
              <h1 className="mt-1.5 font-display text-[26px] leading-tight">How will guests be seated?</h1>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['No assigned placement', 'Tables', 'Rooms', 'Sections', 'Custom Layout'].map(p => (
                <Press key={p} onClick={() => setPlacement(p)}
                  className={`min-h-[92px] rounded-[20px] border p-4 ${placement === p ? 'border-champagne/60 bg-champagne/12' : 'border-white/10 bg-white/[0.04]'} ${p === 'Custom Layout' ? 'col-span-2' : ''}`}>
                  <Icon.Grid className={`h-5 w-5 ${placement === p ? 'text-champagne' : 'text-ivory/45'}`} />
                  <span className="mt-2.5 block text-[13px] font-bold leading-tight text-ivory">{p}</span>
                </Press>
              ))}
            </div>
            {placement === 'Tables' && (
              <div className="animate-fade-in rounded-[22px] border border-champagne/25 bg-champagne/[0.08] p-4">
                <Label className="text-champagne">Template preview</Label>
                <p className="mt-1.5 font-display text-[21px] leading-tight text-ivory">20 Round Tables</p>
                <p className="mt-1.5 text-[12px] text-ivory/60">160 seats · 8 per table · stage at north wall</p>
                <div className="mt-4 grid grid-cols-5 gap-2.5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="grid aspect-square place-items-center rounded-full border border-champagne/40 text-[9px] font-bold text-champagne">
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <Label className="text-champagne">Options</Label>
              <h1 className="mt-1.5 font-display text-[26px] leading-tight">Add the extras</h1>
            </div>
            {['Featured Guests', 'Agenda', 'Questions', 'Social Links'].map(o => {
              const on = options.includes(o);
              return (
                <Press key={o} onClick={() => setOptions(p => on ? p.filter(x => x !== o) : [...p, o])}
                  className="flex w-full items-center gap-3.5 rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-champagne text-ink-900' : 'bg-white/[0.07] text-ivory/50'}`}>
                    <Icon.Sparkle className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-ivory">{o}</span>
                    <span className="mt-0.5 block text-[11.5px] text-ivory/50">
                      {on ? 'Included on the event page' : 'Tap to add this section'}
                    </span>
                  </span>
                  <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-sage' : 'bg-white/15'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
                  </span>
                </Press>
              );
            })}
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in">
            <Label className="text-champagne">Review</Label>
            <h1 className="mt-1.5 font-display text-[26px] leading-tight">Ready to publish</h1>
            <div className="mt-5 overflow-hidden rounded-[26px] border border-white/10">
              <div className="relative">
                <img src={featuredEvent.image} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="absolute inset-0 scrim-b" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <Label className="text-champagne">{cat}</Label>
                  <p className="mt-1.5 font-display text-[23px] leading-tight text-ivory">{name}</p>
                  <p className="mt-1.5 text-[12px] text-ivory/75">{date} · {venue}</p>
                </div>
              </div>
              <div className="bg-white/[0.04] p-4">
                <p className="text-[12.5px] leading-relaxed text-ivory/65">{about}</p>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {[
                    { l: 'Tiers', v: String(tiers.length) },
                    { l: 'From', v: `$${Math.min(...tiers.map(t => t.p))}` },
                    { l: 'Placement', v: placement === 'No assigned placement' ? 'Open' : placement },
                  ].map(x => (
                    <div key={x.l} className="rounded-xl bg-white/[0.05] px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-label text-ivory/45">{x.l}</p>
                      <p className="mt-1 text-[12.5px] font-bold text-ivory">{x.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {options.map(o => (
                    <span key={o} className="rounded-full bg-champagne/15 px-2.5 py-1.5 text-[10.5px] font-bold text-champagne">{o}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="absolute inset-x-0 bottom-0 z-40 px-4 pb-5 pt-8"
        style={{ background: 'linear-gradient(to top, #0A101C 45%, rgba(10,16,28,0))' }}>
        <Press onClick={next}
          className={`flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-extrabold ${step === STEPS.length - 1 ? 'bg-coral text-white' : 'bg-champagne text-ink-900'}`}>
          {step === STEPS.length - 1 ? 'Publish Event' : `Continue to ${STEPS[step + 1]}`}
          <Icon.Chevron className="h-4 w-4" />
        </Press>
      </div>
    </div>
  );
};

export default CreateEventFlow;
