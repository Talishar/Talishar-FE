import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useGetLegalHeroIdsQuery } from 'features/api/apiSlice';
import Notice from 'components/Notice';
import {
  formatDisplayName,
  getHeroLegalitySummary,
  isHeroLegalIn
} from 'utils/heroLegality';
import HeroLegalityLine from './HeroLegalityLine';
import styles from './DeckLegality.module.css';

interface Props {
  heroId?: string | null;
  // The format the deck is about to be used in, if any.
  format?: string | null;
  // Only render when the hero isn't legal in `format`.
  onlyMismatch?: boolean;
  className?: string;
  // Makes each legal format a button that switches to it.
  onSelectFormat?: (format: string) => void;
}

const DeckLegality = ({
  heroId,
  format,
  onlyMismatch,
  className,
  onSelectFormat
}: Props) => {
  const { t } = useTranslation();
  const { data: legalIds } = useGetLegalHeroIdsQuery();
  const summary = getHeroLegalitySummary(heroId, legalIds);
  if (!summary) return null;

  const legalInFormat = format ? isHeroLegalIn(heroId, format, legalIds) : null;
  if (onlyMismatch && legalInFormat !== false) return null;

  if (legalInFormat === false) {
    return (
      <Notice
        tone="warning"
        className={className}
        title={t('DECK_LEGALITY.NOT_LEGAL_IN', {
          format: formatDisplayName(t, format)
        })}
      >
        <p>
          <HeroLegalityLine summary={summary} onSelectFormat={onSelectFormat} />
        </p>
      </Notice>
    );
  }

  return (
    <span className={classNames(styles.summary, className)}>
      <HeroLegalityLine summary={summary} onSelectFormat={onSelectFormat} />
    </span>
  );
};

export default DeckLegality;
