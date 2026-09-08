// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Component } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth, useFormFactor, listRecentProjects, listAllSpaces } from '@immediately-run/sdk';
import App from './App';

vi.mock('@immediately-run/sdk', () => ({
  useAuth: vi.fn(),
  useFormFactor: vi.fn(),
  listRecentProjects: vi.fn(),
  listAllSpaces: vi.fn(),
}));

vi.mock('@immediately-run/omnibox', () => ({
  Omnibox: () => <div data-testid="omnibox" />,
  focusHeroOmnibox: vi.fn(),
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
const mockList = vi.mocked(listRecentProjects);
const mockSpaces = vi.mocked(listAllSpaces);

beforeEach(() => {
  mockAuth.mockReturnValue({ status: 'signed-in', user: null });
  mockFormFactor.mockReturnValue({ class: 'desktop', width: 1280, height: 900, orientation: 'landscape' });
  // The static-half tests render while the reads are in flight: promises that
  // never settle keep the page on the pre-read projection, synchronously.
  mockList.mockReturnValue(new Promise(() => {}));
  mockSpaces.mockReturnValue(new Promise(() => {}));
});

afterEach(cleanup);

describe('App', () => {
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

  it("open paste box: no app-level gradient primary remains — the Run is the package's own", async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Paste a repo'));
    await act(async () => {});
    expect(screen.getByTestId('omnibox')).toBeDefined();
    // The omnibox's Run is the page's one gradient primary while open, but it
    // is the package's `.omnibox-run` (styled by the package's stylesheet, not
    // the app's `.btn`) — so the app-level gradient class must be gone.
    expect(container.querySelectorAll('.btn')).toHaveLength(0);
    const block = container.querySelector('.greeting__paste');
    expect(block?.contains(screen.getByTestId('omnibox'))).toBe(true);
  });

  it('open paste box: Make an app is hairline while the omnibox holds the primary', async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Paste a repo'));
    await act(async () => {});
    const makeApp = Array.from(container.querySelectorAll('.greeting__actions a'))[0];
    expect(makeApp.className).toBe('btn-ghost');
  });

  it('open paste box with recents on screen: the featured Open goes hairline while the box holds the primary', async () => {
    mockList.mockResolvedValue([
      { provider: 'github', namespace: 'acme', repository: 'todo', ref: 'feat/x', ts: 0 },
      { provider: 'github', namespace: 'immediately-run', repository: 'grove', ref: 'main', ts: 0 },
    ]);
    const { container } = render(<App />);
    await screen.findByText('acme/todo');
    const featuredOpen = container.querySelector('.rec-featured__actions a');
    expect(featuredOpen?.className).toBe('btn rec-open');
    fireEvent.click(screen.getByText('Paste a repo'));
    await act(async () => {});
    expect(featuredOpen?.className).toBe('btn-ghost rec-open');
    expect(container.querySelectorAll('.greeting__actions .btn')).toHaveLength(0);
  });

  it('Escape closes the block and the primary moves back off the omnibox', async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Paste a repo'));
    await act(async () => {});
    expect(screen.getByTestId('omnibox')).toBeDefined();
    fireEvent.keyDown(screen.getByTestId('omnibox'), { key: 'Escape' });
    await act(async () => {});
    expect(screen.queryByTestId('omnibox')).toBeNull();
    expect(container.querySelector('.greeting__paste')).toBeNull();
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

  it('a populated record renders the section and the featured Open becomes the one primary', async () => {
    mockList.mockResolvedValue([
      { provider: 'github', namespace: 'acme', repository: 'todo', ref: 'feat/x', ts: 0 },
      { provider: 'github', namespace: 'immediately-run', repository: 'grove', ref: 'main', ts: 0 },
    ]);
    const { container } = render(<App />);
    await screen.findByText('acme/todo');
    const primaries = container.querySelectorAll('.btn');
    expect(primaries).toHaveLength(1);
    expect(primaries[0].textContent).toBe('Open');
    expect(container.querySelectorAll('.rec-row')).toHaveLength(1);
  });

  it('a null record (cleared or never used) renders an absent section, not an empty list', async () => {
    mockList.mockResolvedValue(null);
    const { container } = render(<App />);
    await act(async () => {});
    expect(container.querySelector('.rec')).toBeNull();
  });

  it('a forbidden refusal renders the off line; any other code reaches the error boundary', async () => {
    mockList.mockRejectedValue({ code: 'forbidden' });
    const first = render(<App />);
    await screen.findByText('Recents are off for this version of Home.');
    expect(screen.getByText('Recent projects.')).toBeDefined();
    first.unmount();

    mockList.mockRejectedValue({ code: 'invalid-params' });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <Boundary>
        <App />
      </Boundary>,
    );
    await act(async () => {});
    expect(container.textContent).toContain('boundary-caught');
    expect(container.querySelector('.rec-off')).toBeNull();
    errSpy.mockRestore();
  });
});

// Test-only boundary: proves a non-forbidden refusal THROWS out of render
// (reaching whichever boundary the host frame mounts) instead of rendering
// the "off" line, which would be a false claim about a fork's consent.
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <span>boundary-caught</span> : this.props.children;
  }
}
