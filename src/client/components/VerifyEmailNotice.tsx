import React, { useCallback, useState } from 'react';
import { resendEmailVerification } from 'modelence/client';
import { toast } from 'react-hot-toast';
import { Button } from '@/client/components/ui/Button';

interface VerifyEmailNoticeProps {
  /** Address the verification link was sent to. */
  email: string;
  /** Rendered under the main copy, e.g. a link back to sign in. */
  footer?: React.ReactNode;
}

/**
 * Shown when an account exists but is unverified: after signup, and after a
 * login rejected with EMAIL_NOT_VERIFIED. Both share this resend flow.
 * Rendered inside AuthLayout's card (which provides the heading).
 */
export default function VerifyEmailNotice({ email, footer }: VerifyEmailNoticeProps) {
  const [isSending, setIsSending] = useState(false);

  const handleResend = useCallback(async () => {
    setIsSending(true);
    try {
      await resendEmailVerification({ email });
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      // The global errorHandler already toasts this.
      console.error((error as Error).message);
    } finally {
      setIsSending(false);
    }
  }, [email]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm leading-relaxed text-ink-soft">
        We sent a verification link to <span className="font-medium text-ink">{email}</span>.
        Click the link to activate your account — you won't be able to sign in until you do.
      </p>
      <p className="text-center text-xs text-ink-faint">
        No email? Check your spam folder, or resend it below.
      </p>

      <Button className="w-full rounded-full" variant="outline" onClick={handleResend} loading={isSending}>
        Resend verification email
      </Button>

      {footer}
    </div>
  );
}
