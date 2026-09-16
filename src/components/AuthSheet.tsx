import React, { useEffect, useState } from 'react';
import { CTA, Icon, Label, Press, Sheet } from '@/components/ui/kit';
import { useAuth } from '@/contexts/AuthContext';

const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <label className="block">
    <span className="text-[10.5px] font-bold uppercase tracking-label text-ink-300">{label}</span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="mt-1.5 h-[52px] w-full rounded-2xl border border-ink/12 bg-white px-4 text-[14.5px] font-semibold text-ink outline-none transition-colors placeholder:text-ink-300/70 focus:border-coral/60"
    />
  </label>
);

const AuthSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  headline?: string;
  sub?: string;
  onSuccess?: () => void;
}> = ({ open, onClose, headline = 'Save your seat', sub = 'Sign in to keep your tickets, favorites and table on every device.', onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setError(''); setBusy(false); } }, [open]);

  const submit = async () => {
    setError('');
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (mode === 'up' && !name.trim()) { setError('Tell us your name so hosts can greet you.'); return; }

    setBusy(true);
    const res = mode === 'in'
      ? await signIn(email, password)
      : await signUp(name, email, password, phone);
    setBusy(false);

    if (res.error) { setError(res.error); return; }

    if (mode === 'up') {
      fetch('https://famous.ai/api/crm/6aaaff412da03efcb2cca2ff/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(), name: name.trim() || undefined, phone: phone.trim() || undefined,
          sms_opt_in: smsOptIn === true, source: 'account-signup', tags: ['account', 'attendee'],
        }),
      }).catch(() => {});
    }

    setPassword('');
    onSuccess?.();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} label="Account">
      <div className="px-5 pb-7 pt-3">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-900">
            <span className="font-display text-[18px] leading-none text-champagne">R</span>
          </span>
          <div className="min-w-0">
            <Label className="text-coral">Redeemed Events</Label>
            <h2 className="mt-1 font-display text-[25px] leading-tight text-ink">{headline}</h2>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-400">{sub}</p>

        <div className="mt-5 flex rounded-full bg-ink/[0.06] p-1">
          {([['up', 'Create account'], ['in', 'Sign in']] as const).map(([k, l]) => (
            <Press key={k} onClick={() => { setMode(k); setError(''); }}
              className={`min-h-[42px] flex-1 rounded-full text-center text-[12.5px] font-bold transition-colors ${mode === k ? 'bg-white text-ink shadow-soft' : 'text-ink-400'}`}>
              {l}
            </Press>
          ))}
        </div>

        <div className="mt-4 space-y-3.5">
          {mode === 'up' && <Field label="Full name" value={name} onChange={setName} placeholder="Maya Johnson" />}
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters" />
          {mode === 'up' && (
            <>
              <Field label="Phone number (optional)" value={phone} onChange={setPhone} type="tel" placeholder="(404) 555-0139" />
              <Press onClick={() => setSmsOptIn(v => !v)} className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${smsOptIn ? 'border-coral bg-coral text-white' : 'border-ink/25'}`}>
                  {smsOptIn && <Icon.Check className="h-3.5 w-3.5" />}
                </span>
                <span className="text-[11.5px] leading-snug text-ink-400">
                  Text me event updates and table confirmations. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
                </span>
              </Press>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-coral/10 px-4 py-3">
            <Icon.Close className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p className="text-[12.5px] font-semibold leading-snug text-coral-dark">{error}</p>
          </div>
        )}

        <div className="mt-5">
          <CTA onClick={submit} disabled={busy}>
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {mode === 'in' ? 'Signing in' : 'Creating account'}
              </>
            ) : mode === 'in' ? 'Sign in' : 'Create account'}
          </CTA>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-300">
          Your favorites, tickets and table selection sync securely to your account.
        </p>
      </div>
    </Sheet>
  );
};

export default AuthSheet;
