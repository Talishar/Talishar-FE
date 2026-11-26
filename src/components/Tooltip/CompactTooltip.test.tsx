import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import CompactTooltip from './CompactTooltip';

afterEach(cleanup);

it('uses the same tooltip for action labels and longer help text', async () => {
  const help =
    'Rust counters accrue as you play. Clear them before queuing again.';
  render(
    <>
      <button data-compact-tooltip="Save deck to Favorites">
        <span>Save</span>
      </button>
      <button data-compact-tooltip={help}>Rust counters</button>
      <CompactTooltip />
    </>
  );

  const save = screen.getByText('Save');
  fireEvent.pointerOver(save);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent('Save deck to Favorites');
  expect(tooltip.parentElement).toBe(document.body);

  const rust = screen.getByRole('button', { name: 'Rust counters' });
  fireEvent.pointerOut(save, { relatedTarget: rust });
  fireEvent.pointerOver(rust, { relatedTarget: save });
  expect(await screen.findByRole('tooltip')).toHaveTextContent(help);
});

it('describes the focused control and preserves its existing description on Escape', async () => {
  render(
    <>
      <label data-compact-tooltip="Both players can see each other's hands">
        <input type="checkbox" aria-describedby="description" />
        Open Hands
      </label>
      <span id="description">Private games only</span>
      <CompactTooltip />
    </>
  );

  const input = screen.getByRole('checkbox', { name: 'Open Hands' });
  fireEvent.focusIn(input);
  const tooltip = await screen.findByRole('tooltip');
  expect(input).toHaveAttribute(
    'aria-describedby',
    `description ${tooltip.id}`
  );

  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(input).toHaveAttribute('aria-describedby', 'description');
});
