import React, { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { Button, Field, Screen, TopBar, Card, Badge, Sheet } from '@/components/kit';
import { Fingerprint, Apple, Chrome, ShieldCheck } from 'lucide-react';

const DEMO = [
  { role: 'Attendee', email: 'attendee@demo.redeemedevents.com', desc: 'Browse, buy tickets, pick a table' },
  { role: 'Organizer', email: 'organizer@demo.redeemedevents.com', desc: 'Dashboard, seating, orders' },
  { role: 'Team Member', email: 'staff@demo.redeemedevents.com', desc: 'Scan-only permissions' },
  { role: 'Admin', email: 'admin@demo.redeemedevents.com', desc: 'Platform + demo controls' },
];

const Auth: React.FC = () => {
  const { login, signup, back, toast, nav } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>('login');
  const [email, setEmail] = useState('attendee@demo.redeemedevents.com');
  const [password, setPassword] = useState('Demo123!');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [bio, setBio] = useState(false);

  const submit = () => {
    const e: any = {};
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (mode === 'signup' && name.trim().length < 2) e.name = 'Please enter your full name';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    const res = mode === 'login' ? login(email, password) : signup({ name, email, password, phone });
    if (res.error) { setErrors({ form: res.error }); return; }
    toast(`Welcome${res.user?.name ? ', ' + res.user.name.split(' ')[0] : ''}!`);
  };

  return (
    <Screen>
      <TopBar title={mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Forgot password' : 'Sign in'} onBack={nav.length > 1 ? back : undefined} />
      <div className="px-5 pt-6 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">RE</div>
          <div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">Redeemed Events</p>
            <p className="text-[12.5px] text-slate-500">Discover. Gather. Belong.</p>
          </div>
        </div>

        {mode === 'forgot' ? (
          <div className="space-y-4">
            <p className="text-[14px] text-slate-600 dark:text-slate-300">Enter your email and we'll send a 6-digit verification code.</p>
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Button full size="lg" onClick={() => { setMode('otp'); toast('Verification code sent: 429301'); }}>Send code</Button>
            <Button full variant="ghost" onClick={() => setMode('login')}>Back to sign in</Button>
          </div>
        ) : mode === 'otp' ? (
          <div className="space-y-4">
            <p className="text-[14px] text-slate-600 dark:text-slate-300">Enter the 6-digit code sent to {email}. (Demo code: <b>429301</b>)</p>
            <Field label="Verification code" value={otp} onChange={setOtp} placeholder="429301" error={errors.otp} />
            <Button full size="lg" onClick={() => { if (otp.trim() !== '429301') { setErrors({ otp: 'That code is incorrect.' }); return; } setErrors({}); setMode('reset'); }}>Verify</Button>
          </div>
        ) : mode === 'reset' ? (
          <div className="space-y-4">
            <Field label="New password" value={password} onChange={setPassword} type="password" error={errors.password} />
            <Button full size="lg" onClick={() => { if (password.length < 6) { setErrors({ password: 'Minimum 6 characters' }); return; } toast('Password reset. You can sign in now.'); setMode('login'); }}>Reset password</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === 'signup' && <Field label="Full name" value={name} onChange={setName} error={errors.name} required />}
            <Field label="Email" value={email} onChange={setEmail} type="email" error={errors.email} required />
            {mode === 'signup' && <Field label="Phone (optional)" value={phone} onChange={setPhone} type="tel" />}
            <Field label="Password" value={password} onChange={setPassword} type="password" error={errors.password} required />
            {errors.form && <p className="text-[13px] text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">{errors.form}</p>}
            {mode === 'login' && <button onClick={() => setMode('forgot')} className="text-[13px] text-indigo-600 font-medium">Forgot password?</button>}
            <Button full size="lg" onClick={submit}>{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
            <button onClick={() => setBio(true)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-[14px] font-medium">
              <Fingerprint className="w-4 h-4" /> Unlock with Face ID / biometrics
            </button>
            <div className="flex items-center gap-3 py-1"><div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /><span className="text-[12px] text-slate-400">or continue with</span><div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /></div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => toast('Apple Sign-In is simulated in this demo', 'info')} icon={<Apple className="w-4 h-4" />}>Apple</Button>
              <Button variant="outline" onClick={() => toast('Google Sign-In is simulated in this demo', 'info')} icon={<Chrome className="w-4 h-4" />}>Google</Button>
            </div>
            <p className="text-center text-[13.5px] text-slate-500">
              {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button className="text-indigo-600 font-semibold" onClick={() => { setErrors({}); setMode(mode === 'login' ? 'signup' : 'login'); }}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Demo accounts — password Demo123!</p>
          </div>
          <div className="space-y-2">
            {DEMO.map((d) => (
              <Card key={d.email} className="p-3 flex items-center gap-3" onClick={() => { const r = login(d.email, 'Demo123!'); if (!r.error) toast(`Signed in as ${d.role}`); }}>
                <Badge tone="indigo">{d.role}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] truncate text-slate-700 dark:text-slate-200">{d.email}</p>
                  <p className="text-[11.5px] text-slate-500">{d.desc}</p>
                </div>
                <span className="text-[12px] font-semibold text-indigo-600">Enter</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={bio} onClose={() => setBio(false)} title="Biometric unlock"
        footer={<Button full onClick={() => { setBio(false); const r = login('attendee@demo.redeemedevents.com', 'Demo123!'); if (!r.error) toast('Unlocked with biometrics'); }}>Simulate successful scan</Button>}>
        <div className="text-center py-6">
          <Fingerprint className="w-16 h-16 mx-auto text-indigo-600" />
          <p className="mt-4 text-[14px] text-slate-600 dark:text-slate-300">Native biometric hardware isn't available in this preview, so we simulate the unlock using the saved attendee session.</p>
        </div>
      </Sheet>
    </Screen>
  );
};

export default Auth;
