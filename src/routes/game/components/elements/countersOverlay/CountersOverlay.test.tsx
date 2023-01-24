import React from 'react';
import CountersOverlay from './CountersOverlay';
import { renderWithProviders } from 'utils/TestUtils';
import { prettyDOM } from '@testing-library/react';
import styles from './CountersOverlay.module.css';

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
  expect(div.className).toContain('steamCounter');
});

it('displays an aim counter', () => {
  const doc = renderWithProviders(
    <CountersOverlay cardNumber="WTR001" countersMap={{ aim: 2 }} />
  );
  const div = doc.queryAllByTitle('aim counter');
  expect(div).toBeTruthy();
  expect(div[0].className).toContain('aimCounter');
  expect(doc.queryByText('2')).toBeFalsy();
});

it('displays some unknown weird counter', () => {
  const doc = renderWithProviders(
    <CountersOverlay cardNumber="WTR001" countersMap={{ weirdCounter: 2 }} />
  );
  const div = doc.getByText('2');
  expect(div).toBeTruthy();
});

it('should trim leading zero from an incorrectly set stringy number', () => {
  const doc = renderWithProviders(
    // @ts-ignore: Type error
    <CountersOverlay cardNumber="WTR001" countersMap={{ newCounter: '02' }} />
  );
  const div = doc.getByText('2');
  expect(div).toBeTruthy();
  expect(div.textContent).toEqual('2');
});
