// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listAllSpaces } from '@immediately-run/sdk';
import type { SpaceInfo } from '@immediately-run/sdk';
import Spaces from './Spaces';

vi.mock('@immediately-run/sdk', () => ({
  // Spaces reads once on mount; each test decides what the host answers.
  listAllSpaces: vi.fn(),
}));

vi.mock('@immediately-run/sdk/platformLink', () => ({
  // The mock mirrors the real contract: a platform route anchor that always
  // carries target="_top".
  PlatformLink: ({ path, children, ...rest }: { path: string; children: React.ReactNode }) => (
    <a href={path} target="_top" {...rest}>{children}</a>
  ),
}));

const mockList = vi.mocked(listAllSpaces);

// Built field-by-field against the SDK's exported record type.
const household: SpaceInfo = { spaceId: 'space-1', name: 'Household', role: 'owner' };
const chessClub: SpaceInfo = { spaceId: 'space-2', name: 'Chess club', role: 'writer' };
const bookWiki: SpaceInfo = { spaceId: 'space-3', name: 'Book wiki', role: 'reader' };

beforeEach(() => {
  // In flight by default: the section renders nothing until the host answers.
  mockList.mockReset();
  mockList.mockReturnValue(new Promise(() => {}));
});

afterEach(cleanup);

describe('Spaces', () => {
  it('the list state renders the rows, the two header links, and never the gradient primary', async () => {
    mockList.mockResolvedValue([household, chessClub, bookWiki]);
    const { container } = render(<Spaces layout="list" />);
    await screen.findByText('Household');
    expect(container.querySelectorAll('.sp-row')).toHaveLength(3);
    expect(container.querySelectorAll('.btn')).toHaveLength(0);
    expect(screen.getByText('All spaces →')).toBeDefined();
    expect(screen.getByText('Create a space →')).toBeDefined();
    for (const a of Array.from(container.querySelectorAll('.section-head__links a'))) {
      expect(a.getAttribute('href')).toBe('/spaces');
      expect(a.getAttribute('target')).toBe('_top');
    }
  });

  it('the Manage pill deep-links the manager at the space', async () => {
    mockList.mockResolvedValue([household, chessClub, bookWiki]);
    const { container } = render(<Spaces layout="list" />);
    await screen.findByText('Household');
    const manages = Array.from(container.querySelectorAll('.sp-manage'));
    expect(manages.map((a) => a.getAttribute('href'))).toEqual([
      '/spaces?space=space-1',
      '/spaces?space=space-2',
      '/spaces?space=space-3',
    ]);
  });

  it('the empty state renders the heading links, the sentence verbatim, and the Create pill in the dashed box', async () => {
    mockList.mockResolvedValue([]);
    const { container } = render(<Spaces layout="list" />);
    await screen.findByText(
      'You are not in any space yet. Create one, or wait for an invitation to reach your notifications.',
    );
    expect(container.querySelector('.sp-empty-box')).not.toBeNull();
    expect(container.querySelectorAll('.sp-row')).toHaveLength(0);
    // the heading's right carries both links; the box carries the Create pill
    expect(screen.getAllByText('Create a space →')).toHaveLength(2);
    expect(screen.getByText('All spaces →')).toBeDefined();
  });

  it('the off state renders the single line with the All spaces pill and no heading, no rows', async () => {
    mockList.mockRejectedValue({ code: 'forbidden' });
    const { container } = render(<Spaces layout="list" />);
    await screen.findByText(/This version of Home cannot list your spaces\./);
    const all = screen.getByText('All spaces →');
    expect(all.getAttribute('href')).toBe('/spaces');
    expect(container.querySelector('.section-head')).toBeNull();
    expect(container.querySelectorAll('.sp-row')).toHaveLength(0);
    expect(container.querySelector('.sp-list')).toBeNull();
  });

  it('the phone layout renders the strip of cards and a heading without links', async () => {
    mockList.mockResolvedValue([household, chessClub, bookWiki]);
    const { container } = render(<Spaces layout="strip" />);
    await screen.findByText('Household');
    expect(container.querySelector('.sp-strip')).not.toBeNull();
    expect(container.querySelectorAll('.sp-card')).toHaveLength(3);
    expect(container.querySelectorAll('.sp-row')).toHaveLength(0);
    expect(container.querySelector('.section-head__links')).toBeNull();
  });
});
