import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export default function useNewMessageCounter() {
  const newMessageCounter = useAppSelector((state: RootState) => state.game.newMessageCounter);

  return newMessageCounter;
}