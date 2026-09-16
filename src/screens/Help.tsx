import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Screen, TopBar, Card, Button, Field, Select, Segmented, SearchInput, Badge } from '@/components/kit';
import { isFuture, fmtDate } from '@/lib/helpers';

const TYPES = ['Event question', 'Technical / Billing', 'Mailing list', 'Organizer Inquiry'];

const Help: React.FC = () => {
  const { back, db, sel, createEnquiry, addSupport, addMailing, toast, user, current } = useApp();
  const [type, setType] = useState(current.params?.type === 'Organizer Inquiry' ? 'Organizer Inquiry' : 'Event question');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<any>(null);
  const [f, setF] = useState<any>({ name: user?.name || '', email: user?.email || '', message: '', subject: '', issueType: '', description: '', orderNumber: '', firstName: '', lastName: '', iam: '', org: '', website: '', using: '', help: '', perYear: '', platform: '' });
  const [err, setErr] = useState<any>({});
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));

  const events = db.events.filter((e: any) => e.status === 'published' && isFuture(e.startDate))
    .filter((e: any) => !q || e.title.toLowerCase().includes(q.toLowerCase()));

  const submit = () => {
    const e: any = {};
    if (type === 'Event question') {
      if (!picked) e.event = 'Choose an event';
      if (!f.name.trim()) e.name = 'Required';
      if (!f.email.includes('@')) e.email = 'Valid email required';
      if (f.message.trim().length < 5) e.message = 'Tell us a bit more';
      setErr(e); if (Object.keys(e).length) return;
      createEnquiry({ name: f.name, email: f.email, message: f.message, eventId: picked.id });
    } else if (type === 'Technical / Billing') {
      if (!f.subject.trim()) e.subject = 'Required';
      if (!f.issueType) e.issueType = 'Required';
      if (f.description.trim().length < 5) e.description = 'Required';
      setErr(e); if (Object.keys(e).length) return;
      addSupport({ type, subject: f.subject, issueType: f.issueType, description: f.description, orderNumber: f.orderNumber, email: f.email });
      toast('Support request submitted — reference created');
    } else if (type === 'Mailing list') {
      if (!f.firstName.trim()) e.firstName = 'Required';
      if (!f.email.includes('@')) e.email = 'Valid email required';
      setErr(e); if (Object.keys(e).length) return;
      addMailing({ firstName: f.firstName, lastName: f.lastName, role: f.iam, email: f.email });
      fetch('https://famous.ai/api/crm/6aaaf105eac86ad0a4b6b276/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email, name: `${f.firstName} ${f.lastName}`.trim(), source: 'mailing-list', tags: ['newsletter', 'redeemed-events'] }),
      }).catch(() => { });
      toast('Subscribed to the mailing list');
    } else {
      if (!f.org.trim()) e.org = 'Required';
      if (!f.email.includes('@')) e.email = 'Valid email required';
      setErr(e); if (Object.keys(e).length) return;
      addSupport({ type: 'Organizer Inquiry', subject: f.org, issueType: 'Sales', description: `${f.help} · ${f.perYear} events/yr · currently on ${f.platform || 'n/a'} · using RE: ${f.using}`, email: f.email, orderNumber: '' });
      fetch('https://famous.ai/api/crm/6aaaf105eac86ad0a4b6b276/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email, name: f.org, source: 'organizer-inquiry', tags: ['organizer-lead'] }),
      }).catch(() => { });
      toast('Thanks! Our team will reach out shortly.');
    }
    setErr({});
    setF((s: any) => ({ ...s, message: '', subject: '', description: '', help: '' }));
  };

  return (
    <Screen>
      <TopBar title="Help & Contact" onBack={back} />
      <div className="px-4 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TYPES.map((t) => (
            <button key={t} onClick={() => { setType(t); setErr({}); }}
              className={`px-3.5 h-9 rounded-full text-[13px] font-medium whitespace-nowrap border ${type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{t}</button>
          ))}
        </div>

        {type === 'Event question' && (
          <Card className="p-4 space-y-3">
            <p className="font-semibold text-[14.5px] text-slate-900 dark:text-white">Ask an organizer</p>
            <SearchInput value={q} onChange={setQ} placeholder="Search upcoming events" />
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {events.slice(0, 6).map((e: any) => {
                const org = sel.organizer(e.organizerId);
                return (
                  <button key={e.id} onClick={() => setPicked(e)} className={`w-full text-left p-3 rounded-xl border ${picked?.id === e.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-[13.5px] font-medium text-slate-900 dark:text-white">{e.title}</p>
                    <p className="text-[12px] text-slate-500">{org?.name} · {fmtDate(e.startDate)}</p>
                  </button>
                );
              })}
            </div>
            {err.event && <p className="text-[12.5px] text-rose-600">{err.event}</p>}
            {picked && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[12.5px] text-slate-600 dark:text-slate-300">
                Organizer: <b>{sel.organizer(picked.organizerId)?.name}</b> · {sel.organizer(picked.organizerId)?.email} · {sel.organizer(picked.organizerId)?.phone}
              </div>
            )}
            <Field label="Full name" value={f.name} onChange={(v) => set('name', v)} error={err.name} required />
            <Field label="Email" value={f.email} onChange={(v) => set('email', v)} error={err.email} required />
            <Field label="Message" multiline value={f.message} onChange={(v) => set('message', v)} error={err.message} required />
            <Button full onClick={submit}>Send to organizer</Button>
          </Card>
        )}

        {type === 'Technical / Billing' && (
          <Card className="p-4 space-y-3">
            <Field label="Subject" value={f.subject} onChange={(v) => set('subject', v)} error={err.subject} required />
            <Select label="Issue type" value={f.issueType} onChange={(v) => set('issueType', v)} options={['Billing', 'App bug', 'Ticket delivery', 'Check-in', 'Account']} error={err.issueType} required />
            <Field label="Description" multiline value={f.description} onChange={(v) => set('description', v)} error={err.description} required />
            <Field label="Order number (optional)" value={f.orderNumber} onChange={(v) => set('orderNumber', v)} />
            <Field label="Email" value={f.email} onChange={(v) => set('email', v)} />
            <Button full onClick={submit}>Submit request</Button>
          </Card>
        )}

        {type === 'Mailing list' && (
          <Card className="p-4 space-y-3">
            <p className="text-[13px] text-slate-500">Get event announcements and organizer tips.</p>
            <Field label="First name" value={f.firstName} onChange={(v) => set('firstName', v)} error={err.firstName} required />
            <Field label="Last name" value={f.lastName} onChange={(v) => set('lastName', v)} />
            <Select label="I am a…" value={f.iam} onChange={(v) => set('iam', v)} options={['Attendee', 'Organizer', 'Venue', 'Volunteer']} />
            <Field label="Email" value={f.email} onChange={(v) => set('email', v)} error={err.email} required />
            <Button full onClick={submit}>Subscribe</Button>
          </Card>
        )}

        {type === 'Organizer Inquiry' && (
          <Card className="p-4 space-y-3">
            <Field label="Organization" value={f.org} onChange={(v) => set('org', v)} error={err.org} required />
            <Field label="Website / social" value={f.website} onChange={(v) => set('website', v)} />
            <Select label="Currently using Redeemed Events?" value={f.using} onChange={(v) => set('using', v)} options={['Yes', 'No', 'Evaluating']} />
            <Field label="How can we help?" multiline value={f.help} onChange={(v) => set('help', v)} />
            <Select label="Events per year" value={f.perYear} onChange={(v) => set('perYear', v)} options={['1–5', '6–20', '21–50', '50+']} />
            <Field label="Current platform" value={f.platform} onChange={(v) => set('platform', v)} />
            <Field label="Email" value={f.email} onChange={(v) => set('email', v)} error={err.email} required />
            <Button full onClick={submit}>Send inquiry</Button>
          </Card>
        )}

        <Card className="p-4">
          <p className="font-semibold text-[14px] text-slate-900 dark:text-white">Other ways to reach us</p>
          <p className="text-[13px] text-slate-500 mt-1">support@redeemedevents.com · Mon–Fri, 9am–6pm PT</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge tone="green">Avg. response 2 hours</Badge><Badge tone="indigo">24/7 event-day hotline</Badge>
          </div>
        </Card>
      </div>
    </Screen>
  );
};

export default Help;
