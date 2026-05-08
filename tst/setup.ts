import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock problematic CSS packages that cause ESM/CJS issues in jsdom
vi.mock('@csstools/css-calc', () => ({}));
vi.mock('@asamuzakjp/css-color', () => ({}));

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
