import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export default function useShowModal() {
  const showModal = useAppSelector((state: RootState) => state.game.showModals);

  return showModal;
}
