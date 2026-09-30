'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isPinConfigured, saveAppPin, verifyAppPin } from '@/lib/pin';

interface AppPinLockProps {
  children: React.ReactNode;
}

const normalizePin = (value: string) => value.replace(/\D/g, '').slice(0, 6);
const IDLE_LOCK_TIMEOUT = 10 * 60 * 1000;

export default function AppPinLock({ children }: AppPinLockProps) {
  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAutoLocked, setWasAutoLocked] = useState(false);

  useEffect(() => {
    const configured = isPinConfigured();
    setIsSetup(!configured);
    setIsUnlocked(false);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    let timeoutId: number | undefined;
    let lastActivityAt = Date.now();

    const checkIdleTime = () => {
      const timeRemaining = IDLE_LOCK_TIMEOUT - (Date.now() - lastActivityAt);
      if (timeRemaining <= 0) {
        if (isPinConfigured()) {
          setWasAutoLocked(true);
          setIsUnlocked(false);
          setPin('');
          setConfirmation('');
          setError('');
        }
        return;
      }

      timeoutId = window.setTimeout(checkIdleTime, timeRemaining);
    };

    const recordActivity = () => {
      lastActivityAt = Date.now();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(checkIdleTime, IDLE_LOCK_TIMEOUT);
    };

    const checkOnReturn = () => {
      if (document.visibilityState !== 'visible') return;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      checkIdleTime();
    };

    const activityEvents = ['pointerdown', 'keydown', 'touchstart'];
    activityEvents.forEach(eventName => window.addEventListener(eventName, recordActivity, { passive: true }));
    document.addEventListener('scroll', recordActivity, true);
    document.addEventListener('visibilitychange', checkOnReturn);
    recordActivity();

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      activityEvents.forEach(eventName => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener('scroll', recordActivity, true);
      document.removeEventListener('visibilitychange', checkOnReturn);
    };
  }, [isUnlocked]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin.length < 4) {
      setError('Enter at least 4 digits.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (isSetup) {
        if (pin !== confirmation) {
          setError('The PINs do not match.');
          return;
        }
        await saveAppPin(pin);
        setIsSetup(false);
        setWasAutoLocked(false);
        setIsUnlocked(true);
      } else if (await verifyAppPin(pin)) {
        setWasAutoLocked(false);
        setIsUnlocked(true);
      } else {
        setError('Incorrect PIN. Try again.');
      }
      setPin('');
      setConfirmation('');
    } catch (submitError) {
      console.error('Could not verify the app PIN', submitError);
      setError('PIN security is unavailable in this browser. Use a secure HTTPS connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) return null;
  if (isUnlocked) return <>{children}</>;

  return (
    <section className="relative z-10 flex min-h-dvh items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm border-white/40 bg-white/95 shadow-xl backdrop-blur-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle>{isSetup ? 'Set your app PIN' : 'Unlock StaffLink'}</CardTitle>
          <CardDescription>
            {isSetup
              ? 'Create a 4 to 6 digit PIN to protect this device.'
              : wasAutoLocked
                ? 'Locked after 10 minutes of inactivity. Enter your PIN to continue.'
                : 'Enter your PIN to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              pattern="[0-9]*"
              maxLength={6}
              placeholder="4 to 6 digit PIN"
              aria-label="App PIN"
              value={pin}
              onChange={event => setPin(normalizePin(event.target.value))}
              autoFocus
            />
            {isSetup && (
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Confirm PIN"
                aria-label="Confirm app PIN"
                value={confirmation}
                onChange={event => setConfirmation(normalizePin(event.target.value))}
              />
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting || pin.length < 4 || (isSetup && confirmation.length < 4)}>
              {isSubmitting ? 'Please wait...' : isSetup ? 'Save PIN' : 'Unlock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}