import { BiSkipNextCircle } from 'react-icons/bi';
import { HOLD_PRIORITY_ENUM } from 'features/options/constants';
import HoldPriorityToggle from '../HoldPriorityToggle/HoldPriorityToggle';

const AlwaysPassToggle = ({
  btnClass,
  activeBtnClass,
  showLabel
}: {
  btnClass?: string;
  activeBtnClass?: string;
  showLabel?: boolean;
} = {}) => (
  <HoldPriorityToggle
    mode={HOLD_PRIORITY_ENUM.ALWAYS_PASS}
    icon={BiSkipNextCircle}
    tooltipKey="MENU.ALWAYS_PASS"
    labelKey="MENU.ALWAYS_PASS_LABEL"
    btnClass={btnClass}
    activeBtnClass={activeBtnClass}
    showLabel={showLabel}
  />
);

export default AlwaysPassToggle;
