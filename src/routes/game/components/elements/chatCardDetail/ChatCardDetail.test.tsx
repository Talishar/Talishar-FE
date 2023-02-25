import ChatCardDetail from './ChatCardDetail';
import { render } from '@testing-library/react';

it('renders an div with an id of cardDetail', () => {
  const { container } = render(<ChatCardDetail />);
  expect(container.querySelector('#cardDetail')).not.toBeNull();
});
