import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Field, Select, CheckRow, Badge } from '@/components/kit';
import { PlacementChooser } from '@/components/PlacementPicker';
import { money } from '@/lib/helpers';

const Holders: React.FC = () => {
  const { cart, db, sel, back, go, user, checkout, setCheckout, holdPlacement, tick, toast, joinWaitlist } = useApp();
  const eventId = cart[0]?.eventId;
  const event = sel.event(eventId);
  const questions = sel.questions(eventId);
  const layouts = sel.layouts(eventId).filter((l: any) => ['checkout', 'hybrid'].includes(l.mode) && !l.locked);
  const [sameForAll, setSameForAll] = useState(true);
  const [keepTogether, setKeepTogether] = useState(true);
  const [errors, setErrors] = useState<any>({});

  const seats: { key: string; ttId: string; index: number; title: string }[] = [];
  cart.forEach((item: any) => {
    const tt = db.ticketTypes.find((t: any) => t.id === item.ticketTypeId);
    for (let i = 0; i < item.qty; i++) seats.push({ key: `${item.ticketTypeId}_${i}`, ttId: item.ticketTypeId, index: i, title: tt?.title });
  });

  const setHolder = (key: string, patch: any) =>
    setCheckout((s: any) => {
      const holders = { ...s.holders, [key]: { ...(s.holders[key] || {}), ...patch } };
      if (sameForAll) seats.forEach((st) => { holders[st.key] = { ...(holders[st.key] || {}), ...patch }; });
      return { ...s, holders };
    });
  const setAnswer = (key: string, qid: string, val: string, applyAll: boolean) =>
    setCheckout((s: any) => {
      const answers = { ...s.answers };
      if (applyAll) seats.forEach((st) => { answers[st.key] = { ...(answers[st.key] || {}), [qid]: val }; });
      else answers[key] = { ...(answers[key] || {}), [qid]: val };
      return { ...s, answers };
    });

  React.useEffect(() => {
    if (user && !checkout.holders[seats[0]?.key]?.name && seats[0]) setHolder(seats[0].key, { name: user.name, email: user.email });
  }, []); // eslint-disable-line

  if (!cart.length || !seats.length) {
    return (
      <Screen>
        <TopBar title="Ticket details" onBack={back} />
        <div className="p-8 text-center text-[14px] text-slate-500">Your cart is empty. Add tickets to continue.</div>
        <div className="px-4"><Button full onClick={() => go('browse')}>Browse events</Button></div>
      </Screen>
    );
  }

  const validate = () => {

    const e: any = {};
    seats.forEach((s) => {
      const h = checkout.holders[s.key] || {};
      if (!h.name?.trim()) e[`${s.key}_name`] = 'Required';
      if (!h.email?.includes('@')) e[`${s.key}_email`] = 'Valid email required';
      questions.forEach((q: any) => {
        if (q.required && !(checkout.answers[s.key] || {})[q.id]) e[`${s.key}_${q.id}`] = 'Required';
      });
    });
    layouts.forEach((l: any) => {
      const need = keepTogether ? [seats[0]] : seats;
      need.forEach((s) => { if (!checkout.placement[`${l.id}::${s.key}`]) e[`placement_${l.id}`] = `Choose a ${l.name.toLowerCase()} option`; });
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const selectUnit = async (layout: any, unit: any) => {
    const targets = keepTogether ? [seats[0]] : seats;
    const occ = sel.occupancy(unit.id);
    if (occ + targets.length > unit.capacity) { toast('That placement just became full. Please choose another option.', 'error'); return; }
    let ok = true;
    for (const s of targets) {
      const held = await holdPlacement(layout.id, unit.id, `${layout.id}::${s.key}`);
      if (!held) { ok = false; break; }
    }
    if (ok) toast(`${unit.label} held for you`);
  };


  const heldRemaining = () => {
    const times = Object.values(checkout.placement).map((p: any) => new Date(p.heldUntil).getTime() - Date.now());
    if (!times.length) return null;
    const ms = Math.max(0, Math.min(...times));
    const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const remaining = heldRemaining();

  return (
    <Screen>
      <TopBar title="Ticket details" subtitle={event?.title} onBack={back} />
      <div className="px-4 pt-4 space-y-4">
        {remaining && <Card className="p-3 bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-center text-[13px] font-semibold text-amber-800 dark:text-amber-200">Placement held for {remaining}</Card>}

        {seats.length > 1 && (
          <Card className="p-3">
            <CheckRow checked={sameForAll} onChange={(v) => { setSameForAll(v); if (v) { const first = checkout.holders[seats[0].key]; if (first) seats.forEach((s) => setHolder(s.key, first)); } }}
              label="Apply the same information to all tickets" description="Use the buyer details for every ticket holder" />
          </Card>
        )}

        {seats.map((s, i) => {
          const h = checkout.holders[s.key] || {};
          const hidden = sameForAll && i > 0;
          return (
            <Card key={s.key} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Ticket {i + 1}</p>
                <Badge tone="indigo">{s.title}</Badge>
              </div>
              {hidden ? (
                <p className="text-[12.5px] text-slate-500 mt-2">{h.name || '—'} · {h.email || '—'}</p>
              ) : (
                <div className="space-y-3 mt-3">
                  <Field label="Full name" value={h.name || ''} onChange={(v) => setHolder(s.key, { name: v })} error={errors[`${s.key}_name`]} required />
                  <Field label="Email" type="email" value={h.email || ''} onChange={(v) => setHolder(s.key, { email: v })} error={errors[`${s.key}_email`]} required />
                  {questions.map((q: any) => {
                    const val = (checkout.answers[s.key] || {})[q.id] || '';
                    const err = errors[`${s.key}_${q.id}`];
                    if (q.type === 'Text') return <Field key={q.id} label={q.question} value={val} onChange={(v) => setAnswer(s.key, q.id, v, q.applyToAll)} error={err} required={q.required} />;
                    if (q.type === 'Dropdown') return <Select key={q.id} label={q.question} value={val} onChange={(v) => setAnswer(s.key, q.id, v, q.applyToAll)} options={q.options} error={err} required={q.required} />;
                    return (
                      <div key={q.id}>
                        <p className="text-[13px] font-medium mb-1.5 text-slate-700 dark:text-slate-300">{q.question}{q.required && <span className="text-rose-500"> *</span>}</p>
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((o: string) => (
                            <button key={o} onClick={() => setAnswer(s.key, q.id, o, q.applyToAll)}
                              className={`px-3 h-9 rounded-full text-[13px] border ${val === o ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>{o}</button>
                          ))}
                        </div>
                        {err && <p className="text-[12px] text-rose-600 mt-1">{err}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}

        {layouts.map((l: any) => {
          const key = `${l.id}::${seats[0].key}`;
          const selected = checkout.placement[key];
          return (
            <Card key={l.id} className="p-4">
              <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">{l.name}</p>
              <p className="text-[12.5px] text-slate-500 mb-3">{l.description || 'Choose where you would like to be placed.'}</p>
              {seats.length > 1 && (
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setKeepTogether(true)} className={`flex-1 h-10 rounded-xl text-[13px] font-semibold border ${keepTogether ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>Keep everyone together</button>
                  <button onClick={() => setKeepTogether(false)} className={`flex-1 h-10 rounded-xl text-[13px] font-semibold border ${!keepTogether ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>Choose per ticket</button>
                </div>
              )}
              {selected && <p className="text-[13px] mb-2 text-emerald-600 font-semibold">Selected: {selected.label}{selected.priceAdjust ? ` (${selected.priceAdjust > 0 ? '+' : ''}${money(selected.priceAdjust)})` : ''}</p>}
              <PlacementChooser layoutId={l.id} selectedUnitId={selected?.unitId} ticketTypeTitle={seats[0].title}
                onSelect={(u) => selectUnit(l, u)}
                onWaitlist={(u) => { joinWaitlist(u.id, { id: 'pending', holderName: user?.name, holderEmail: user?.email }); }} />
              {errors[`placement_${l.id}`] && <p className="text-[12.5px] text-rose-600 mt-2">{errors[`placement_${l.id}`]}</p>}
            </Card>
          );
        })}

        <Button full size="lg" onClick={() => { if (validate()) go('checkout'); }}>Continue to checkout</Button>
      </div>
    </Screen>
  );
};

export default Holders;
