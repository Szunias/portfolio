import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { AudioProvider } from './context/AudioContext';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  }
}));

// Mock lazy components to avoid suspense issues in simple tests or just let it render fallback
// For now, we just want to see if it mounts.

describe('App', () => {
  it('renders without crashing', async () => {
    render(
      <HelmetProvider>
        <AudioProvider>
           <App />
        </AudioProvider>
      </HelmetProvider>
    );
    
    // App has Suspense, so it might show loader first.
    // We just expect it not to throw.
    await waitFor(() => {
        expect(document.body).toBeDefined();
    });
  });
});