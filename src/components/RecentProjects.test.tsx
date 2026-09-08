// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRecentProjects } from '@immediately-run/sdk';
import type { RecentProject } from '@immediately-run/sdk';
import RecentProjects from './RecentProjects';
import { recentsState } from '../lib/recents';
import type { RecentsState } from '../lib/recents';

vi.mock('@immediately-run/sdk', () => ({
  clearRecentProjects: vi.fn(),
}));

vi.mock('@immediately-run/sdk/platformLink', () => ({
  // The mock mirrors the real contract: a platform route anchor that always
  // carries target="_top".
  PlatformLink: ({ path, children, ...rest }: { path: string; children: React.ReactNode }) => (
    <a href={path} target="_top" {...rest}>{children}</a>
  ),
}));

const mockClear = vi.mocked(clearRecentProjects);

// The clock reading the labels are relative to — pinned, never Date.now().
const NOW = 1_800_000_000_000;

const featured: RecentProject = {
  provider: 'github',
  namespace: 'acme',
  repository: 'todo',
  ref: 'feat/x',
  ts: 0,
};

const list = (n: number): RecentProject[] =>
  Array.from({ length: n }, (_, i) => ({ ...featured, repository: `repo-${i}`, ref: 'main' }));

const listState = (n: number): RecentsState => recentsState(list(n));

beforeEach(() => {
  mockClear.mockReset();
});

afterEach(cleanup);

describe('RecentProjects', () => {
  it('the list state renders exactly one gradient primary and it is the featured Open', () => {
    const { container } = render(<RecentProjects now={NOW} state={listState(3)} primary mobile={false} onCleared={() => {}} />);
    const primaries = container.querySelectorAll('.btn');
    expect(primaries).toHaveLength(1);
    expect(primaries[0].textContent).toBe('Open');
    expect(container.querySelectorAll('.rec-row')).toHaveLength(2);
  });

  it('when the featured is not the primary it is a hairline too', () => {
    const { container } = render(<RecentProjects now={NOW} state={listState(1)} primary={false} mobile={false} onCleared={() => {}} />);
    expect(container.querySelectorAll('.btn')).toHaveLength(0);
    expect(container.querySelector('.rec-featured .btn-ghost')).not.toBeNull();
  });

  it('the absent state renders nothing at all — no empty container, no placebo note (R-OSO-22)', () => {
    const { container } = render(<RecentProjects now={NOW} state={{ kind: 'absent' }} primary={false} mobile={false} onCleared={() => {}} />);
    expect(container.querySelector('.rec')).toBeNull();
  });

  it('the off state renders the section heading and the one sentence, and no rows', () => {
    const { container } = render(<RecentProjects now={NOW} state={{ kind: 'off' }} primary={false} mobile={false} onCleared={() => {}} />);
    expect(screen.getByText('Recent projects.')).toBeDefined();
    expect(screen.getByText('Recents are off for this version of Home.')).toBeDefined();
    expect(container.querySelectorAll('.rec-row')).toHaveLength(0);
    expect(container.querySelector('.rec-featured')).toBeNull();
  });

  it('clear is a two-step, calls the platform once, and reports back so the page can drop the section', async () => {
    mockClear.mockResolvedValue();
    const onCleared = vi.fn();
    render(<RecentProjects now={NOW} state={listState(2)} primary mobile={false} onCleared={onCleared} />);
    fireEvent.click(screen.getByText('Clear recent projects'));
    expect(mockClear).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Clear'));
    await act(async () => {});
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(onCleared).toHaveBeenCalledTimes(1);
  });

  it('the composed clear path: onCleared feeding recentsState(null) removes the section from the DOM', async () => {
    mockClear.mockResolvedValue();
    function Page() {
      const [state, setState] = useState<RecentsState>(() => listState(2));
      return (
        <RecentProjects
          now={NOW}
          state={state}
          primary
          mobile={false}
          onCleared={() => setState(recentsState(null))}
        />
      );
    }
    const { container } = render(<Page />);
    expect(container.querySelector('.rec')).not.toBeNull();
    fireEvent.click(screen.getByText('Clear recent projects'));
    fireEvent.click(screen.getByText('Clear'));
    await act(async () => {});
    expect(container.querySelector('.rec')).toBeNull();
  });

  it('a failed clear leaves the section on screen and does not report cleared', async () => {
    mockClear.mockRejectedValue({ code: 'invalid-params' });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onCleared = vi.fn();
    const { container } = render(<RecentProjects now={NOW} state={listState(2)} primary mobile={false} onCleared={onCleared} />);
    fireEvent.click(screen.getByText('Clear recent projects'));
    fireEvent.click(screen.getByText('Clear'));
    await act(async () => {});
    expect(container.querySelectorAll('.rec-row')).toHaveLength(1);
    expect(onCleared).not.toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('the phone featured card hides Edit behind the ⋯ menu; the desktop card renders it inline', () => {
    const phone = render(<RecentProjects now={NOW} state={listState(1)} primary mobile onCleared={() => {}} />);
    expect(phone.container.querySelector('.rec-menu')).not.toBeNull();
    expect(phone.container.querySelectorAll('.rec-featured__actions > a')).toHaveLength(1);
    phone.unmount();

    const desktop = render(<RecentProjects now={NOW} state={listState(1)} primary mobile={false} onCleared={() => {}} />);
    expect(desktop.container.querySelector('.rec-menu')).toBeNull();
    expect(desktop.container.querySelectorAll('.rec-featured__actions > a')).toHaveLength(2);
  });

  it('the phone quiet rows carry Open only; desktop rows carry Open and Edit', () => {
    const phone = render(<RecentProjects now={NOW} state={listState(2)} primary mobile onCleared={() => {}} />);
    expect(phone.container.querySelectorAll('.rec-row a')).toHaveLength(1);
    phone.unmount();

    const desktop = render(<RecentProjects now={NOW} state={listState(2)} primary mobile={false} onCleared={() => {}} />);
    expect(desktop.container.querySelectorAll('.rec-row a')).toHaveLength(2);
  });

  it('the decorative mark derives from the project, never fetches', () => {
    const { container } = render(<RecentProjects now={NOW} state={listState(1)} primary mobile={false} onCleared={() => {}} />);
    const mark = container.querySelector('.rec-mark');
    expect(mark).not.toBeNull();
    expect(mark?.querySelector('.rec-mark__chip')?.textContent).toBe('repo-0');
    expect(container.querySelector('img')).toBeNull();
  });
});
