import React from 'react';
import CountersOverlay from './CountersOverlay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CountersOverlay cardNumber="WTR001" />);
});

it('dislpays a given number', () => {
  const doc = renderWithProviders(
    <CountersOverlay cardNumber="WTR001" num={3} />
  );
  expect(doc.getByText('3')).toBeTruthy(); // find the number 3
});

it('displays a given label', () => {
  const doc = renderWithProviders(
    <CountersOverlay cardNumber="WTR001" label="testLabel" />
  );
  expect(doc.getByText('testLabel')).toBeTruthy(); // find the label
});

it('displays a steam counter', () => {
  const doc = renderWithProviders(
    <CountersOverlay cardNumber="WTR001" countersMap={{ steam: 1 }} />
  );
  const div = doc.getByTitle('1 steam counter(s)');
  expect(div).toBeTruthy();
  // TODO: Add a test for the BG image
});