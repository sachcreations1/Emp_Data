'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isPinConfigured, removeAppPin, saveAppPin, verifyAppPin } from '@/lib/pin';

const normalizePin = (value: string) => value.replace(/\D/g, '').slice(0, 6);

export default function PinLockSettings() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => setIsConfigured(isPinConfigured()), []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (isConfigured && !(await verifyAppPin(currentPin))) {
      setError('Current PIN is incorrect.');
      return;
    }
    if (newPin.length < 4) {
      setError('New PIN must contain 4 to 6 digits.');
      return;
    }
    if (newPin !== confirmation) {
      setError('The new PINs do not match.');
      return;
    }

    try {
      await saveAppPin(newPin);
      setIsConfigured(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmation('');
      setMessage('PIN saved. It will be required the next time the app opens.');
    } catch (saveError) {
      console.error('Could not save app PIN', saveError);
      setError('PIN security is unavailable in this browser. Use a secure HTTPS connection.');
    }
  };

  const handleDisable = async () => {
    setError('');
    setMessage('');
    if (!(await verifyAppPin(currentPin))) {
      setError('Enter the current PIN to turn off the app lock.');
      return;
    }

    removeAppPin();
    setIsConfigured(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmation('');
    setMessage('App PIN lock disabled.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App PIN Lock</CardTitle>
        <CardDescription>
          {isConfigured ? 'A PIN is required when StaffLink opens in this browser.' : 'Protect this browser with a PIN when StaffLink opens.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-3">
          {isConfigured && (
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="current-password"
              aria-label="Current PIN"
              placeholder="Current PIN"
              value={currentPin}
              onChange={event => setCurrentPin(normalizePin(event.target.value))}
            />
          )}
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="new-password"
            aria-label="New PIN"
            placeholder="New 4 to 6 digit PIN"
            value={newPin}
            onChange={event => setNewPin(normalizePin(event.target.value))}
          />
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="new-password"
            aria-label="Confirm new PIN"
            placeholder="Confirm new PIN"
            value={confirmation}
            onChange={event => setConfirmation(normalizePin(event.target.value))}
          />
          <Button type="submit" disabled={newPin.length < 4 || confirmation.length < 4 || (isConfigured && currentPin.length < 4)}>
            <LockKeyhole className="mr-2 h-4 w-4" />
            {isConfigured ? 'Change PIN' : 'Set PIN'}
          </Button>
          {isConfigured && (
            <Button type="button" variant="outline" onClick={handleDisable} disabled={currentPin.length < 4}>
              <LockKeyholeOpen className="mr-2 h-4 w-4" />
              Turn Off PIN Lock
            </Button>
          )}
        </form>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}