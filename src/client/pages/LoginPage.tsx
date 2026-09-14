import React, { useCallback, useState } from 'react';
import { getConfig, loginWithPassword, MethodError } from 'modelence/client';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import AuthLayout, { AuthSubmitButton, Serif } from '@/client/components/AuthLayout';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import VerifyEmailNotice from '@/client/components/VerifyEmailNotice';

export default function LoginPage() {
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const isSandboxEnv = getConfig('_system.env.type') === 'sandbox';
  const defaultDemoEmail = isSandboxEnv ? getConfig('example.modelenceDemoUsername') as string | undefined : undefined;
  const defaultDemoPassword = isSandboxEnv ? getConfig('example.modelenceDemoPassword') as string | undefined : undefined;

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await loginWithPassword({ email, password });
    } catch (error) {
      // Recoverable, not a failed login: offer resend instead of an error.
      if (error instanceof MethodError && error.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        return;
      }
      throw error;
    }
  }, []);

  if (unverifiedEmail) {
    return (
      <AuthLayout
        seo={{ title: 'Verify your email', noindex: true }}
        eyebrow="One more step"
        title={<>Verify your <Serif>email</Serif></>}
      >
        <VerifyEmailNotice
          email={unverifiedEmail}
          footer={
            <button
              type="button"
              onClick={() => setUnverifiedEmail(null)}
              className="text-sm text-ink-soft underline hover:no-underline"
            >
              Back to sign in
            </button>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      seo={{ title: 'Sign in', noindex: true }}
      eyebrow="Welcome back"
      title={<>Sign in to <Serif>Voicen</Serif></>}
      subtitle="Your notes, minutes and lists are waiting."
      footer={
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-accent-dark hover:underline">
            Get early access
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            defaultValue={defaultDemoEmail}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-ink-soft hover:text-ink hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            id="password"
            defaultValue={defaultDemoPassword}
            required
          />
        </div>

        <div className="pt-1">
          <AuthSubmitButton>
            Sign in
            <ArrowRight className="h-4 w-4" />
          </AuthSubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}
