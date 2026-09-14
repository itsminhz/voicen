import React, { useCallback, useState } from 'react';
import { sendResetPasswordToken } from 'modelence/client';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import AuthLayout, { AuthSubmitButton, Serif } from '@/client/components/AuthLayout';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email'));

    setIsSending(true);
    try {
      await sendResetPasswordToken({ email });
      // Always report success, so we don't leak which accounts exist.
      setSentTo(email);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsSending(false);
    }
  }, []);

  if (sentTo) {
    return (
      <AuthLayout
        seo={{ title: 'Check your inbox', noindex: true }}
        eyebrow="Reset password"
        title={<>Check your <Serif>inbox</Serif></>}
        footer={
          <Link to="/login" className="font-medium text-accent-dark hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm leading-relaxed text-ink-soft">
            If an account exists for <span className="font-medium text-ink">{sentTo}</span>,
            we've sent a link to reset your password. The link expires in one hour.
          </p>
          <p className="text-center text-xs text-ink-faint">No email? Check your spam folder.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      seo={{ title: 'Reset password', noindex: true }}
      eyebrow="Forgot password"
      title={<>Reset your <Serif>password</Serif></>}
      subtitle="Enter your email address and we'll send you a link to choose a new password."
      footer={
        <p>
          Remembered it?{' '}
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

        <div className="pt-1">
          <AuthSubmitButton>
            {isSending ? 'Sending…' : 'Send reset link'}
            <ArrowRight className="h-4 w-4" />
          </AuthSubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}
