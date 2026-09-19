import { GiUsable } from 'react-icons/gi';
import { HOLD_PRIORITY_ENUM } from 'features/options/constants';
import HoldPriorityToggle from '../HoldPriorityToggle/HoldPriorityToggle';

const FullControlToggle = ({
  btnClass,
  activeBtnClass,
  showLabel
}: {
  btnClass?: string;
  activeBtnClass?: string;
  showLabel?: boolean;
} = {}) => (
  <HoldPriorityToggle
    mode={HOLD_PRIORITY_ENUM.ALWAYS_HOLD}
    icon={GiUsable}
    tooltipKey="MENU.ALWAYS_HOLD_PRIORITY"
    labelKey="MENU.HOLD_PRIORITY_LABEL"
    btnClass={btnClass}
    activeBtnClass={activeBtnClass}
    showLabel={showLabel}
  />
);

export default FullControlToggle;
