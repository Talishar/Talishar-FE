import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HelpTooltip } from './HelpTooltip';

describe('HelpTooltip', () => {
  it('shows its full text when the icon is hovered', async () => {
    const text = 'A long explanation that must remain readable in the tooltip.';
    render(<HelpTooltip text={text} />);

    fireEvent.mouseEnter(screen.getByLabelText(text));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(text);
    expect(tooltip.parentElement).toBe(document.body);

    fireEvent.mouseLeave(screen.getByLabelText(text));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps the tooltip in the active dialog layer', async () => {
    const text = 'Dialog help';
    render(
      <dialog open>
        <HelpTooltip text={text} />
      </dialog>
    );

    fireEvent.mouseEnter(screen.getByLabelText(text));

    expect(
      (await screen.findByRole('tooltip')).closest('dialog')
    ).not.toBeNull();
  });
});
