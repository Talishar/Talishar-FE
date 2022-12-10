import React from 'react';
import GemSlider from './GemSlider';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<GemSlider />);
});

it('is empty when gem is null', () => {
  const { container } = renderWithProviders(<GemSlider gem={undefined} />);

  expect(container.childElementCount).toEqual(0);
});

it('is empty when gem is 0', () => {
  const { container } = renderWithProviders(<GemSlider gem={'none'} />);

  expect(container.childElementCount).toEqual(0);
});

it('is inactive when gem is inactive', () => {
  renderWithProviders(<GemSlider gem={'inactive'} />);
  const image = document.querySelector('img') as HTMLImageElement;
  expect(image.src).toContain('hexagonGrayGem.png');
});

it('is active when gem is active', () => {
  renderWithProviders(<GemSlider gem={'active'} />);
  const image = document.querySelector('img') as HTMLImageElement;
  expect(image.src).toContain('hexagonRedGemGlow.png');
});
