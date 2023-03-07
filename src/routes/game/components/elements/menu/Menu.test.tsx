import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import Menu from './Menu';
import { renderWithProviders } from 'utils/TestUtils';
import { screen } from '@testing-library/react';

describe('menu', () => {
  beforeEach(() => {
    renderWithProviders(<Menu />);
  });

  it('renders the buttons properly', () => {
    expect(screen.getByTitle('Options Menu')).toBeDefined();
    expect(screen.getByTitle('Full Screen')).toBeDefined();
    expect(screen.getByTitle('Undo')).toBeDefined();
    expect(screen.getByTitle('Full Control')).toBeDefined();
    expect(screen.getByTitle('Show Arena')).toBeDefined();
  });
});
