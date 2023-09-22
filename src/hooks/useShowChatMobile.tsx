import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export default function useShowChatMobile() {
  const showChatMobile = useAppSelector((state: RootState) => state.game.showChatMobile);

  return showChatMobile;
}