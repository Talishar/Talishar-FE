import { fireEvent, screen } from '@testing-library/react';
import CardPopUp from './CardPopUp';
import { renderWithProviders } from 'utils/TestUtils';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

const TestComponent = () => {
    const popUp = useAppSelector((state: RootState) =>
        state.game.popup
    );
    return <div>{popUp?.popupCard?.cardNumber}</div>
}

it('renders without crashing', () => {
    renderWithProviders(<CardPopUp cardNumber='123'>
        <span>test</span>
    </CardPopUp>)
    expect(screen.getByText('test')).toBeVisible();
});

it('shows a card when hovering', () => {
    renderWithProviders(
        <>
            <TestComponent />
            <CardPopUp cardNumber='123'>
                <span>test</span>
            </CardPopUp>
        </>
    );
    expect(screen.queryByText('123')).toBeNull();

    fireEvent.mouseOver(screen.getByText('test'));

    expect(screen.getByText('123')).toBeVisible();
});
