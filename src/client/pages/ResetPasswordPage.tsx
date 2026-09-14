import React, { useCallback, useState } from 'react';
import { resetPassword } from 'modelence/client';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthLayout, { AuthSubmitButton, Serif } from '@/client/components/AuthLayout';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  // The landing route sends ?status=error for an invalid or expired link.
  const linkError = searchParams.get('status') === 'error'
    ? searchParams.get('message') || 'This password reset link is invalid or has expired.'
    : null;

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const password = String(formData.get('password'));
    const confirmPassword = String(formData.get('confirmPassword'));

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      // No token: it's in an httpOnly cookie the server reads. Passing it
      // client-side is deprecated.
      await resetPassword({ password });
      toast.success('Your password has been updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }, [navigate]);

  if (linkError) {
    return (
      <AuthLayout
        seo={{ title: 'Link expired', noindex: true }}
        eyebrow="Reset password"
        title={<>Link <Serif>expired</Serif></>}
        footer={
          <Link to="/login" className="font-medium text-accent-dark hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm leading-relaxed text-ink-soft">{linkError}</p>
          <Link
            to="/forgot-password"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Request a new link
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      seo={{ title: 'Choose a new password', noindex: true }}
      eyebrow="Reset password"
      title={<>Choose a new <Serif>password</Serif></>}
      footer={
        <Link to="/login" className="font-medium text-accent-dark hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="password" className="mb-2 block">
            New password
          </Label>
          <Input type="password" name="password" id="password" required />
        </div>

        <div>
          <Label htmlFor="confirm-password" className="mb-2 block">
            Confirm new password
          </Label>
          <Input type="password" name="confirmPassword" id="confirm-password" required />
        </div>

        <div className="pt-1">
          <AuthSubmitButton>
            {isSaving ? 'Updating…' : 'Update password'}
            <ArrowRight className="h-4 w-4" />
          </AuthSubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}
