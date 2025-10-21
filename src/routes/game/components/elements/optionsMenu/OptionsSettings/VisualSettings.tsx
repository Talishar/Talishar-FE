import React from 'react';
import styles from './OptionsSettings.module.css';

interface VisualSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const VisualSlider: React.FC<VisualSliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  unit = '%'
}) => {
  const displayValue = Math.floor(value * 100);
  
  return (
    <div className={styles.visualSettingItem}>
      <div className={styles.visualSettingHeader}>
        <span className={styles.visualSettingLabel}>{label}</span>
        <span className={styles.visualSettingValue}>
          {displayValue}{unit}
        </span>
      </div>
      <div className={styles.visualSettingControl}>
        <input
          type="range"
          min={min}
          max={max}
          value={value * 100}
          onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        />
      </div>
    </div>
  );
};

interface VisualPresetProps {
  label: string;
  currentValue: number;
  presets: Array<{ value: number; label: string }>;
  onChange: (value: number) => void;
}

export const VisualPreset: React.FC<VisualPresetProps> = ({
  label,
  currentValue,
  presets,
  onChange
}) => {
  const displayValue = Math.floor(currentValue * 100);
  
  return (
    <div className={styles.visualSettingItem}>
      <div className={styles.visualSettingHeader}>
        <span className={styles.visualSettingLabel}>{label}</span>
        <span className={styles.visualSettingValue}>
          {displayValue}%
        </span>
      </div>
      <div className={styles.presetButtons}>
        {presets.map((preset) => {
          const isActive = Math.abs(currentValue - preset.value) < 0.01;
          const buttonClass = isActive 
            ? `${styles.presetButton} ${styles.presetButtonActive}`
            : styles.presetButton;
          
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={buttonClass}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
