// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Greeting from './Greeting';

vi.mock('@immediately-run/sdk/platformLink', () => ({
  // The mock mirrors the real contract: a platform route anchor that always
  // carries target="_top".
  PlatformLink: ({ path, children, ...rest }: { path: string; children: React.ReactNode }) => (
    <a href={path} target="_top" {...rest}>{children}</a>
  ),
}));

vi.mock('@immediately-run/omnibox', () => ({
  // A stub carrying the marker class the test asserts on.
  Omnibox: () => <div data-testid="omnibox" />,
}));

afterEach(cleanup);

describe('Greeting', () => {
  it('clicking Paste a repo calls onToggle', () => {
    const onToggle = vi.fn();
    render(<Greeting primary="create" omniboxOpen={false} onToggle={onToggle} toggleRef={undefined} onOmniboxKeyDown={() => {}} />);
    fireEvent.click(screen.getByText('Paste a repo'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('closed: no omnibox block, and Make an app carries the gradient', () => {
    const { container } = render(<Greeting primary="create" omniboxOpen={false} onToggle={() => {}} toggleRef={undefined} onOmniboxKeyDown={() => {}} />);
    expect(container.querySelector('.greeting__paste')).toBeNull();
    expect(container.querySelector('.greeting__actions .btn')?.textContent).toBe('Make an app →');
  });

  it('open: the omnibox block is in the DOM and Make an app is hairline', () => {
    const { container } = render(<Greeting primary="omnibox" omniboxOpen onToggle={() => {}} toggleRef={undefined} onOmniboxKeyDown={() => {}} />);
    expect(screen.getByTestId('omnibox')).toBeDefined();
    expect(container.querySelector('.greeting__paste')).not.toBeNull();
    const actions = container.querySelectorAll('.greeting__actions a');
    expect(actions).toHaveLength(1);
    expect(actions[0].className).toBe('btn-ghost');
  });

  it('Escape inside the block reaches the wrapper handler', () => {
    const onOmniboxKeyDown = vi.fn();
    render(<Greeting primary="omnibox" omniboxOpen onToggle={() => {}} toggleRef={undefined} onOmniboxKeyDown={onOmniboxKeyDown} />);
    fireEvent.keyDown(screen.getByTestId('omnibox'), { key: 'Escape' });
    expect(onOmniboxKeyDown).toHaveBeenCalledTimes(1);
  });
});
