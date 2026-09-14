import React, { useCallback, useState } from 'react';
import { getConfig, loginWithPassword, signupWithPassword } from 'modelence/client';
import { Link } from 'react-router';
import { ChevronRight, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthLayout, { AuthSubmitButton, Serif } from '@/client/components/AuthLayout';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import VerifyEmailNotice from '@/client/components/VerifyEmailNotice';

export default function SignupPage() {
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = useCallback(async () => {
    const email = getConfig('example.modelenceDemoUsername') as string | undefined;
    const password = getConfig('example.modelenceDemoPassword') as string | undefined;
    if (!email || !password) {
      toast.error('Demo account is not available right now.');
      return;
    }
    setIsDemoLoading(true);
    try {
      await loginWithPassword({ email, password });
    } catch (error) {
      console.error((error as Error).message);
      setIsDemoLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const confirmPassword = String(formData.get('confirmPassword'));

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signupWithPassword({ email, password });
      setSignupEmail(email);
    } catch (error) {
      console.error((error as Error).message);
    }
  }, []);

  if (signupEmail) {
    return (
      <AuthLayout
        seo={{ title: 'Check your inbox', noindex: true }}
        eyebrow="Almost there"
        title={<>Check your <Serif>inbox</Serif></>}
      >
        <VerifyEmailNotice
          email={signupEmail}
          footer={
            <p className="text-center text-sm text-ink-soft">
              Already verified?{' '}
              <Link to="/login" className="font-medium text-accent-dark hover:underline">
                Sign in
              </Link>
            </p>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      seo={{ title: 'Get early access', noindex: true }}
      eyebrow="Get early access"
      title={<>Turn your voice into <Serif>notes</Serif></>}
      subtitle="Create a free account — your first recording becomes organized notes in under a minute."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-dark hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input type="email" name="email" id="email" placeholder="you@example.com" required />
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 block">
            Password
          </Label>
          <Input type="password" name="password" id="password" required />
        </div>

        <div>
          <Label htmlFor="confirm-password" className="mb-2 block">
            Confirm password
          </Label>
          <Input type="password" name="confirmPassword" id="confirm-password" required />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="consent-terms"
            type="checkbox"
            name="consent-terms"
            className="mt-0.5 h-4 w-4 rounded border border-line bg-surface text-accent focus:ring-2 focus:ring-accent/40"
            required
          />
          <Label htmlFor="consent-terms" className="text-sm font-normal text-ink-soft">
            I accept the{' '}
            <a className="font-medium text-accent-dark hover:underline" href="/terms" target="_blank">
              Terms and Conditions
            </a>
          </Label>
        </div>

        <div className="pt-1">
          <AuthSubmitButton>
            Get early access
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <ChevronRight className="h-4 w-4" />
            </span>
          </AuthSubmitButton>
        </div>
      </form>

      {/* Demo account */}
      <div className="mt-5">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-faint">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isDemoLoading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface py-2.5 text-sm font-medium text-ink transition-colors hover:border-sky-300 hover:text-accent-dark disabled:opacity-60"
        >
          <UserRound className="h-4 w-4" strokeWidth={1.75} style={{ color: '#0ea5e9' }} />
          {isDemoLoading ? 'Signing in as Alex…' : 'Continue with demo account'}
        </button>
        <p className="mt-2 text-center text-xs text-ink-faint">
          Try Voicen instantly as <span className="font-medium text-ink-soft">Alex</span> — no signup needed.
        </p>
      </div>
    </AuthLayout>
  );
}
