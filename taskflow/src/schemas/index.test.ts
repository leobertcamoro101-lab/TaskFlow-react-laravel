import { describe, it, expect } from 'vitest';
import { registerSchema, passwordSchema } from './index';

// The backend (RegisterRequest/UpdatePasswordRequest) is the real
// authority on password strength and is the only check that can't be
// bypassed, but this client-side copy needs to stay in sync with it —
// otherwise a user passes validation here only to be surprised by a 422
// from the API. These tests pin the client rules down so a future edit to
// one side doesn't silently drift from the other.
describe('registerSchema password rules', () => {
  const validBase = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    birthday: '1990-01-01',
    gender: 'female' as const,
    email: 'ada@example.com',
  };

  it('rejects a password missing complexity requirements', () => {
    const result = registerSchema.safeParse({ ...validBase, password: 'alllowercase1' });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 8 characters', () => {
    const result = registerSchema.safeParse({ ...validBase, password: 'Aa1!aa' });
    expect(result.success).toBe(false);
  });

  it('accepts a password meeting all complexity requirements', () => {
    const result = registerSchema.safeParse({ ...validBase, password: 'Tqz9!vKxr2#pL' });
    expect(result.success).toBe(true);
  });

  it('rejects registration for someone under 13', () => {
    const result = registerSchema.safeParse({
      ...validBase,
      birthday: new Date().toISOString().slice(0, 10), // born today
      password: 'Tqz9!vKxr2#pL',
    });
    expect(result.success).toBe(false);
  });
});

describe('passwordSchema (change-password form)', () => {
  it('rejects a password change when the confirmation does not match', () => {
    const result = passwordSchema.safeParse({
      current_password: 'OldPassw0rd!',
      password: 'Tqz9!vKxr2#pL',
      password_confirmation: 'Different1!',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a password change when the confirmation matches and is strong', () => {
    const result = passwordSchema.safeParse({
      current_password: 'OldPassw0rd!',
      password: 'Tqz9!vKxr2#pL',
      password_confirmation: 'Tqz9!vKxr2#pL',
    });
    expect(result.success).toBe(true);
  });
});
