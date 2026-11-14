import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
  describeHeroLegality,
  HeroLegalitySummary
} from 'utils/heroLegality';
import styles from './DeckLegality.module.css';

const FORMATS_TOKEN = '%%FORMATS%%';

interface Props {
  summary: HeroLegalitySummary;
  onSelectFormat?: (format: string) => void;
}

const HeroLegalityLine = ({ summary, onSelectFormat }: Props) => {
  const { t } = useTranslation();
  const { key, formats } = describeHeroLegality(summary);
  const [before, after = ''] = t(key, { formats: FORMATS_TOKEN }).split(
    FORMATS_TOKEN
  );

  return (
    <>
      {before}
      {formats.map(({ format, labelKey }, index) => (
        <Fragment key={format}>
          {index > 0 && ', '}
          {onSelectFormat ? (
            <button
              type="button"
              className={styles.formatLink}
              onClick={() => onSelectFormat(format)}
            >
              {t(labelKey)}
            </button>
          ) : (
            t(labelKey)
          )}
        </Fragment>
      ))}
      {after}
    </>
  );
};

export default HeroLegalityLine;
