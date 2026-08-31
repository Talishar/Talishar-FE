import { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useKnownSearchParams } from './useKnownSearchParams';

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter initialEntries={['/?gameName=123&playerID=1']}>
    {children}
  </MemoryRouter>
);

describe('useKnownSearchParams', () => {
  it('updates a known parameter while preserving the others', () => {
    const { result } = renderHook(() => useKnownSearchParams(), { wrapper });

    act(() => result.current[1]('authKey', 'secret'));

    expect(result.current[0]).toEqual({
      gameName: '123',
      playerID: '1',
      authKey: 'secret'
    });
  });
});
