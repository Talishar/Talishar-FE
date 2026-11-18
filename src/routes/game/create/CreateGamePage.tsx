import { useTranslation } from 'react-i18next';
import useAdScript from 'hooks/useAdScript';
import { usePageTitle } from 'hooks/usePageTitle';
import useSupporterStatus from 'hooks/useSupporterStatus';
import CreateGame from './CreateGame';

// The page has no ad slots, but the rust counter panel's Watch ad button only
// gets a Google ad where the ad provider is loaded.
const CreateGamePage = () => {
  const { t } = useTranslation();
  usePageTitle(t('MENU.CREATE_GAME.TITLE'));
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);
  return <CreateGame />;
};

export default CreateGamePage;
