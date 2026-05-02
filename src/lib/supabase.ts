import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sanitize URL: Remove trailing slashes or /rest/v1 paths
const sanitizedUrl = supabaseUrl?.replace(/\/$/, '').replace(/\/rest\/v1$/, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(sanitizedUrl || '', supabaseAnonKey || '');
