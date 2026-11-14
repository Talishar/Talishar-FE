import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeFormat } from 'appConstants';
import Notice from 'components/Notice';
import HeroLegalityLine from 'components/DeckLegality/HeroLegalityLine';
import { useGetLegalHeroIdsQuery } from 'features/api/apiSlice';
import {
  FindMatchBlocker,
  FindMatchStatusResponse
} from 'interface/API/GetFindMatchStatus.php';
import {
  formatDisplayName,
  getHeroLegalitySummary
} from 'utils/heroLegality';

interface Props {
  status: FindMatchStatusResponse | undefined;
  format: string;
  hasDeck: boolean;
  /** Set ID of the selected deck's hero, for the "Legal for" line */
  heroId?: string | null;
  onSelectFormat?: (format: string) => void;
}

const FindMatchStatus = ({
  status,
  format,
  hasDeck,
  heroId,
  onSelectFormat
}: Props) => {
  const { t } = useTranslation();
  const { data: legalIds } = useGetLegalHeroIdsQuery();
  const formatName = formatDisplayName(t, format);
  const summary = status?.summary;

  if (!hasDeck) {
    return <Notice tone="info" title={t('FIND_MATCH.CHOOSE_DECK')} />;
  }
  if (!status || !summary || summary.format !== normalizeFormat(format)) {
    return <Notice tone="info" title={t('FIND_MATCH.CHECKING')} />;
  }

  const hero = status.heroShortName ?? t('FIND_MATCH.YOUR_HERO');
  const fits = summary.matches.length;
  const reasons = Object.entries(summary.reasons).filter(
    ([, count]) => (count ?? 0) > 0
  ) as [FindMatchBlocker, number][];
  const heroIllegal = summary.heroLegal === false;

  let headline: string;
  if (heroIllegal) {
    headline = t('FIND_MATCH.HERO_ILLEGAL', { hero, format: formatName });
  } else if (summary.waiting === 0) {
    headline = t('FIND_MATCH.NOBODY_WAITING', { format: formatName });
  } else if (fits > 0) {
    headline =
      fits === summary.waiting
        ? t('FIND_MATCH.FITS_ALL', { count: fits, format: formatName })
        : t('FIND_MATCH.FITS_SOME', {
            count: fits,
            waiting: summary.waiting,
            format: formatName
          });
  } else if (reasons.length === 1) {
    headline = t(`FIND_MATCH.NONE_FIT_${reasons[0][0]}`, {
      count: summary.waiting,
      hero,
      format: formatName
    });
  } else {
    headline = t('FIND_MATCH.NONE_FIT_MIXED', {
      count: summary.waiting,
      format: formatName,
      reasons: reasons
        .map(([code, count]) =>
          t(`FIND_MATCH.REASON_${code}`, { count, hero })
        )
        .join(', ')
    });
  }

  const notes: { key: string; content: ReactNode }[] = [];
  const addNote = (content: string) => notes.push({ key: content, content });
  if (heroIllegal) {
    const legality = getHeroLegalitySummary(heroId, legalIds);
    if (legality) {
      notes.push({
        key: 'legality',
        content: (
          <HeroLegalityLine
            summary={legality}
            onSelectFormat={onSelectFormat}
          />
        )
      });
    }
  }
  if (fits === 0) {
    const others = Object.entries(summary.otherFormats);
    if (others.length > 0) {
      addNote(
        t('FIND_MATCH.ALSO_WAITING', {
          list: others
            .sort((a, b) => b[1] - a[1])
            .map(([otherFormat, count]) =>
              t('FIND_MATCH.ALSO_WAITING_ITEM', {
                count,
                format: formatDisplayName(t, otherFormat)
              })
            )
            .join(', ')
        })
      );
    }
  }
  if (!status.heroKnown && summary.waiting > 0) {
    addNote(t('FIND_MATCH.HERO_UNKNOWN'));
  }
  if (summary.competitive && status.hasPreference) {
    addNote(t('FIND_MATCH.PREFERENCE_OFF_COMPETITIVE'));
  }

  return (
    <Notice tone={heroIllegal ? 'warning' : 'info'} title={headline}>
      {notes.length > 0 &&
        notes.map((note) => <p key={note.key}>{note.content}</p>)}
    </Notice>
  );
};

export default FindMatchStatus;
