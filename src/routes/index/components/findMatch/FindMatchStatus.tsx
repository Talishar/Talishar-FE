import { useTranslation } from 'react-i18next';
import Notice from 'components/Notice';
import HeroLegalityLine from 'components/DeckLegality/HeroLegalityLine';
import { useGetLegalHeroIdsQuery } from 'features/api/apiSlice';
import { formatDisplayName, getHeroLegalitySummary } from 'utils/heroLegality';

interface Props {
  format: string;
  heroName?: string;
  /** Set ID of the selected deck's hero, for the "Legal for" line */
  heroId?: string | null;
  onSelectFormat?: (format: string) => void;
}

const FindMatchStatus = ({
  format,
  heroName,
  heroId,
  onSelectFormat
}: Props) => {
  const { t } = useTranslation();
  const { data: legalIds } = useGetLegalHeroIdsQuery();
  const legality = getHeroLegalitySummary(heroId, legalIds);

  return (
    <Notice
      tone="warning"
      title={t('FIND_MATCH.HERO_ILLEGAL', {
        hero: heroName ?? t('FIND_MATCH.YOUR_HERO'),
        format: formatDisplayName(t, format)
      })}
    >
      {legality && (
        <p>
          <HeroLegalityLine
            summary={legality}
            onSelectFormat={onSelectFormat}
          />
        </p>
      )}
    </Notice>
  );
};

export default FindMatchStatus;
