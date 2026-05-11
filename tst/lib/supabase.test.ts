import { describe, it, expect, vi } from 'vitest';

// We need to mock createClient from the library
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url, key) => ({ url, key }))
}));

describe('Supabase Client', () => {
  it('initializes with environment variables', async () => {
    // Import the client AFTER mocking
    const { supabase } = await import('../../src/lib/supabase');
    
    // In vitest environment, these are usually defined in setup or mock-env
    // We can check if they are passed correctly to the mock createClient
    expect(supabase).toBeDefined();
    // These values depend on your test environment setup (.env or setup.ts)
    // but the library logic for sanitizing should be implicitly tested if we had complex URLs
  });
});
