const PIN_STORAGE_KEY = 'stafflink:app-pin:v1';
const PIN_ITERATIONS = 120_000;

interface PinRecord {
  salt: string;
  hash: string;
}

const bytesToBase64 = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), character => character.charCodeAt(0));

const derivePinHash = async (pin: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PIN_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToBase64(new Uint8Array(hash));
};

const readPinRecord = (): PinRecord | null => {
  const value = localStorage.getItem(PIN_STORAGE_KEY);
  if (!value) return null;

  try {
    const record = JSON.parse(value) as PinRecord;
    return record.salt && record.hash ? record : null;
  } catch {
    return null;
  }
};

export const isPinConfigured = () => Boolean(readPinRecord());

export const saveAppPin = async (pin: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePinHash(pin, salt);
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify({ salt: bytesToBase64(salt), hash }));
};

export const verifyAppPin = async (pin: string) => {
  const record = readPinRecord();
  if (!record) return false;
  const hash = await derivePinHash(pin, base64ToBytes(record.salt));
  return hash === record.hash;
};

export const removeAppPin = () => localStorage.removeItem(PIN_STORAGE_KEY);