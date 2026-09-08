// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth, useFormFactor } from '@immediately-run/sdk';
import App from './App';

vi.mock('@immediately-run/sdk', () => ({
  useAuth: vi.fn(),
  useFormFactor: vi.fn(),
}));

vi.mock('@immediately-run/sdk/platformLink', () => ({
  // The mock mirrors the real contract: a platform route anchor that always
  // carries target="_top".
  PlatformLink: ({ path, children, ...rest }: { path: string; children: React.ReactNode }) => (
    <a href={path} target="_top" {...rest}>{children}</a>
  ),
}));

const mockAuth = vi.mocked(useAuth);
const mockFormFactor = vi.mocked(useFormFactor);

beforeEach(() => {
  mockAuth.mockReturnValue({ status: 'signed-in', user: null });
  mockFormFactor.mockReturnValue({ class: 'desktop', width: 1280, height: 900, orientation: 'landscape' });
});

afterEach(cleanup);

describe('App — the static half', () => {
  it('renders exactly one gradient primary and it is Make an app →', () => {
    const { container } = render(<App />);
    const primaries = container.querySelectorAll('.btn');
    expect(primaries).toHaveLength(1);
    expect(primaries[0].textContent).toBe('Make an app →');
  });

  it('every root-relative anchor is a platform link carrying target="_top"', () => {
    const { container } = render(<App />);
    const anchors = Array.from(container.querySelectorAll('a'));
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      if (a.getAttribute('href')!.startsWith('/')) {
        expect(a.getAttribute('target')).toBe('_top');
      }
    }
    // and the one external anchor opens a new tab, not the frame
    const external = anchors.find((a) => a.getAttribute('href')!.startsWith('https://'));
    expect(external).toBeDefined();
    expect(external!.getAttribute('target')).toBe('_blank');
  });

  it('the greeting, the two tiles and the footer carry the brief copy', () => {
    render(<App />);
    expect(screen.getByText('Welcome back.')).toBeDefined();
    expect(screen.getByText('Connect a language model to use the built-in agent in any app.')).toBeDefined();
    expect(screen.getByText('Language model settings →')).toBeDefined();
    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByText('Open →')).toBeDefined();
    expect(screen.getByText('Home is an app you can fork.')).toBeDefined();
  });

  it('auth unresolved renders the skeleton and no greeting', () => {
    mockAuth.mockReturnValue({ status: 'unknown', user: null });
    const { container } = render(<App />);
    expect(container.querySelector('.skel')).not.toBeNull();
    expect(screen.queryByText('Welcome back.')).toBeNull();
    expect(container.querySelector('.btn')).toBeNull();
  });

  it('signed out is impossible: warn once and render nothing', () => {
    mockAuth.mockReturnValue({ status: 'signed-out', user: null });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
