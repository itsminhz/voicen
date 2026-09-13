import React, { useCallback, useState } from 'react';
import { signupWithPassword } from 'modelence/client';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router';
import Page from '@/client/components/Page';
import VerifyEmailNotice from '@/client/components/VerifyEmailNotice';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  return (
    <Page seo={{ title: 'Sign up', noindex: true }}>
      <div className="flex items-center justify-center min-h-full">
        <SignupForm />
      </div>
    </Page>
  );
}

function SignupForm() {
  const [signupEmail, setSignupEmail] = useState<string | null>(null);

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
      <VerifyEmailNotice
        email={signupEmail}
        title="Check your inbox"
        footer={
          <p className="text-center text-sm text-ink-soft">
            Already verified?{' '}
            <Link
              to="/login"
              className="text-ink underline hover:no-underline font-medium"
            >
              Sign in
            </Link>
          </p>
        }
      />
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto animate-slide-up">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-xl">
          Create your account
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="block mb-2">
              Email
            </Label>
            <Input 
              type="email" 
              name="email" 
              id="email" 
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block mb-2">
              Password
            </Label>
            <Input 
              type="password" 
              name="password" 
              id="password" 
              required
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="block mb-2">
              Confirm password
            </Label>
            <Input 
              type="password" 
              name="confirmPassword" 
              id="confirm-password" 
              required
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consent-terms"
                type="checkbox"
                name="consent-terms"
                className="w-4 h-4 border border-line rounded bg-surface text-accent focus:ring-2 focus:ring-accent/40"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <Label htmlFor="consent-terms" className="text-ink-soft">
                I accept the <a className="font-medium text-accent-dark hover:underline" href="/terms" target="_blank">Terms and Conditions</a>
              </Label>
            </div>
          </div>

          <Button
            className="w-full"
            type="submit"
          >
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-ink underline hover:no-underline font-medium"
          >
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
