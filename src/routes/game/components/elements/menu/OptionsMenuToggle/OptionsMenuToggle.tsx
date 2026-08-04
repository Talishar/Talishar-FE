import styles from '../Menu.module.css';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  openOptionsMenu,
  closeOptionsMenu,
  enableModals
} from 'features/game/GameSlice';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { GiHamburgerMenu } from 'react-icons/gi';

function OptionsMenuToggle({
  btnClass,
  showLabel
}: {
  btnClass?: string;
  showLabel?: boolean;
} = {}) {
  const { t } = useTranslation();
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();

  const toggleMenu = () => {
    dispatch(enableModals());
    if (optionsMenu?.active) return dispatch(closeOptionsMenu());
    return dispatch(openOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.TOGGLE_OPTIONS_MENU, toggleMenu);

  return (
    <div>
      <button
        className={btnClass ?? styles.btn}
        aria-label={t('MENU.TOGGLE_MAIN_MENU')}
        onClick={() => toggleMenu()}
        data-tooltip={t('OPTIONS_MENU.SETTINGS_MENU')}
        data-placement="bottom"
      >
        <GiHamburgerMenu aria-hidden="true" />
        {showLabel && ` ${t('MENU.MENU_LABEL')}`}
      </button>
    </div>
  );
}

export default OptionsMenuToggle;
