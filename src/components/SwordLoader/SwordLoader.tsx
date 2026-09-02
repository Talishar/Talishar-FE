import styles from './SwordLoader.module.css';

interface SwordLoaderProps {
  size?: number;
}

const SwordLoader = ({ size = 60 }: SwordLoaderProps) => {
  return (
    <div
      className={styles.wrapper}
      style={{ width: size * 2, height: size * 2 }}
    >
      <svg
        className={styles.sword}
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon points="30,4 33,42 30,46 27,42" fill="url(#bladeGrad)" />
        <line
          x1="30"
          y1="6"
          x2="30"
          y2="43"
          stroke="color-mix(in srgb, var(--sword-light) 50%, transparent)"
          strokeWidth="0.8"
        />
        <rect
          x="18"
          y="42"
          width="24"
          height="4"
          rx="2"
          fill="url(#guardGrad)"
        />
        <rect x="27" y="46" width="6" height="8" rx="1.5" fill="var(--sword-dark)" />
        <ellipse cx="30" cy="56" rx="4" ry="3" fill="url(#pommelGrad)" />
        <ellipse cx="30" cy="7" rx="1.2" ry="2" fill="color-mix(in srgb, var(--sword-light) 70%, transparent)" />
        <defs>
          <linearGradient
            id="bladeGrad"
            x1="27"
            y1="4"
            x2="33"
            y2="46"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--sword-light)" />
            <stop offset="50%" stopColor="var(--sword-base)" />
            <stop offset="100%" stopColor="var(--sword-dark)" />
          </linearGradient>
          <linearGradient
            id="guardGrad"
            x1="18"
            y1="44"
            x2="42"
            y2="44"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--sword-dark)" />
            <stop offset="50%" stopColor="var(--sword-light)" />
            <stop offset="100%" stopColor="var(--sword-dark)" />
          </linearGradient>
          <linearGradient
            id="pommelGrad"
            x1="26"
            y1="56"
            x2="34"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--sword-dark)" />
            <stop offset="50%" stopColor="var(--sword-light)" />
            <stop offset="100%" stopColor="var(--sword-dark)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SwordLoader;
