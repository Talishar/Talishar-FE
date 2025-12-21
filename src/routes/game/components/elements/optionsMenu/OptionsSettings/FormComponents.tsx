import React from 'react';
import styles from './OptionsSettings.module.css';

interface CheckboxSettingProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  ariaDisabled?: boolean;
  tooltip?: string;
}

export const CheckboxSetting: React.FC<CheckboxSettingProps> = ({
  name,
  label,
  checked,
  onChange,
  ariaDisabled = false,
  tooltip
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  return (
    <label className={styles.optionLabel}>
      <input
        type="checkbox"
        name={name}
        aria-disabled={ariaDisabled}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.labelWithTooltip}>
        {label}
        {tooltip && (
          <span
            className={styles.tooltipIcon}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            title={tooltip}
          >
            ?
            {isTooltipVisible && (
              <span className={styles.tooltipContent}>{tooltip}</span>
            )}
          </span>
        )}
      </span>
    </label>
  );
};

interface RadioOption {
  value: string;
  label: string;
  enumValue: number;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  checked: number;
  onChange: (value: number) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  checked,
  onChange
}) => {
  return (
    <>
      {options.map((option) => (
        <label key={option.value} className={styles.optionLabel}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={checked === option.enumValue}
            onChange={() => onChange(option.enumValue)}
          />
          {option.label}
        </label>
      ))}
    </>
  );
};

interface RangeSliderProps {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  name,
  label,
  value,
  min,
  max,
  onChange,
  displayValue
}) => {
  const display = displayValue ?? `${Math.floor(value * 100)}%`;
  
  return (
    <label className={styles.optionLabel}>
      {label}: {display}
      <input
        name={name}
        type="range"
        min={min}
        max={max}
        value={value * 100}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        style={{ cursor: 'pointer' }}
      />
    </label>
  );
};

interface PresetButtonsProps {
  presets: Array<{ value: number; label: string }>;
  onClick: (value: number) => void;
  currentValue?: number;
}

export const PresetButtons: React.FC<PresetButtonsProps> = ({
  presets,
  onClick,
  currentValue
}) => {
  return (
    <div className={styles.presetButtons}>
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onClick(preset.value)}
          className={styles.presetButton}
          style={
            currentValue === preset.value
              ? {
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--primary-inverse)',
                  borderColor: 'var(--theme-primary)'
                }
              : undefined
          }
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

interface FieldsetProps {
  legend: string;
  children: React.ReactNode;
}

export const Fieldset: React.FC<FieldsetProps> = ({ legend, children }) => {
  return (
    <fieldset className={styles.fieldset}>
      <legend>
        <strong>{legend}</strong>
      </legend>
      {children}
    </fieldset>
  );
};
