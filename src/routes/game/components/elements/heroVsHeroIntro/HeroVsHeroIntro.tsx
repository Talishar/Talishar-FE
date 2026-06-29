import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimation,
} from 'framer-motion';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { markHeroIntroAsShown } from 'features/game/GameSlice';
import { getSettingsEntity } from 'features/options/optionsSlice';
import styles from './HeroVsHeroIntro.module.css';
import { METAFY_TIER_MAP, MetafyTierName } from 'utils/patronIcons';

const formatHeroName = (id: string | undefined): string => {
  if (!id) return '';
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

interface PatronInfo {
  metafyTiers?: string[] | null;
  isPatron?: boolean;
  isPvtVoidPatron?: boolean;
  isContributor?: boolean;
}

const checkPatron = (p: PatronInfo | null): boolean =>
  (p?.metafyTiers?.length ?? 0) > 0 ||
  !!p?.isPatron ||
  !!p?.isPvtVoidPatron ||
  !!p?.isContributor;

const getBadgeLabel = (p: PatronInfo | null): string | undefined => {
  const tier = p?.metafyTiers?.[0] as MetafyTierName | undefined;
  if (tier && METAFY_TIER_MAP[tier]) return METAFY_TIER_MAP[tier].label;
  if (p?.isPvtVoidPatron) return 'Seer of Ophidia';
  if (p?.isPatron) return 'Fyendal Supporter';
  return undefined;
};

const PARTICLE_COUNT = 22;

const Particles: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        left: `${6 + Math.random() * 88}%`,
        size: 1.2 + Math.random() * 2.8,
        duration: 7 + Math.random() * 12,
        delay: -(Math.random() * 12),
      })),
    []
  );

  return (
    <div className={styles.particleField} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

interface HeroCardProps {
  imageUrl: string;
  heroName: string;
  isPremium: boolean;
  glowActive: boolean;
  metafyTierName?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ imageUrl, heroName, isPremium, glowActive, metafyTierName }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 260,
    damping: 28,
  });
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 260,
    damping: 28,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {}, []);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div className={styles.heroCardOuter}>
      {isPremium && (
        <div className={`${styles.ambientGlow} ${glowActive ? styles.glowActive : ''}`} />
      )}

      <motion.div
        ref={cardRef}
        className={styles.heroCardVisual}
        style={isPremium ? { rotateX, rotateY } : {}}
        onMouseMove={isPremium ? handleMouseMove : undefined}
        onMouseEnter={isPremium ? handleMouseEnter : undefined}
        onMouseLeave={isPremium ? handleMouseLeave : undefined}
      >
        <img
          className={styles.heroImg}
          src={imageUrl}
          alt={heroName}
          draggable={false}
        />

        <div className={styles.groundFade} />

        {isPremium && <div className={styles.sheenLoop} />}

        <div className={`${styles.heroLabel} ${isPremium ? styles.heroLabelPremium : ''}`}>
          <span className={styles.heroName}>{heroName}</span>
          {isPremium && metafyTierName && <span className={styles.premiumBadge}>{metafyTierName}</span>}
        </div>

        {isPremium && <div className={styles.frameGlow} />}
        <div className={`${styles.heroCardBorder} ${isPremium ? styles.heroCardBorderPremium : ''}`} />
      </motion.div>
    </div>
  );
};

const RING_COUNT = 3;
const VSShockwave: React.FC<{ show: boolean }> = ({ show }) => (
  <div className={styles.vsWrapper}>
    <AnimatePresence>
      {show &&
        Array.from({ length: RING_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.shockwaveRing}
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.75, delay: i * 0.11, ease: 'easeOut' }}
          />
        ))}
    </AnimatePresence>

    <motion.div
      className={styles.vsContainer}
      initial={{ scale: 0, opacity: 0, filter: 'blur(14px)' }}
      animate={
        show
          ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
          : { scale: 0, opacity: 0, filter: 'blur(14px)' }
      }
      transition={{ type: 'spring', damping: 11, stiffness: 190, delay: 0.06 }}
    >
      {show && <div className={styles.vsFlash} />}
      <span className={styles.vsText}>VS</span>
    </motion.div>
  </div>
);

const HeroVsHeroIntro = () => {
  const dispatch = useAppDispatch();

  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const gameID = useAppSelector((state: RootState) => state.game.gameInfo.gameID);
  const gameGUID = useAppSelector((state: RootState) => state.game.gameInfo.gameGUID);
  const playerOneHero = useAppSelector((state: RootState) => state.game.playerOne?.Hero?.cardNumber);
  const playerTwoHero = useAppSelector((state: RootState) => state.game.playerTwo?.Hero?.cardNumber);

  const playerOnePatronInfo = useAppSelector(
    (state: RootState): PatronInfo => ({
      metafyTiers: state.game.playerOne?.metafyTiers,
      isPatron: state.game.playerOne?.isPatron,
      isPvtVoidPatron: state.game.playerOne?.isPvtVoidPatron,
      isContributor: state.game.playerOne?.isContributor,
    }),
    shallowEqual
  );
  const playerTwoPatronInfo = useAppSelector(
    (state: RootState): PatronInfo => ({
      metafyTiers: state.game.playerTwo?.metafyTiers,
      isPatron: state.game.playerTwo?.isPatron,
      isPvtVoidPatron: state.game.playerTwo?.isPvtVoidPatron,
      isContributor: state.game.playerTwo?.isContributor,
    }),
    shallowEqual
  );

  const settingsData = useAppSelector(getSettingsEntity);

  const [isVisible, setIsVisible] = useState(true);
  const [vsVisible, setVsVisible] = useState(false);
  const [glowActive, setGlowActive] = useState(false);
  const shakeControls = useAnimation();

  const getLocalStorageKey = useCallback(
    () => gameGUID || `heroIntro_${gameID}`,
    [gameGUID, gameID]
  );

  useEffect(() => {
    if (!gameID) return;
    if (localStorage.getItem(getLocalStorageKey()) === 'false') setIsVisible(false);
  }, [gameID, gameGUID, getLocalStorageKey]);

  useEffect(() => {
    if (!isVisible) return;
    const t1 = setTimeout(() => setVsVisible(true), 680);
    const t2 = setTimeout(() => setGlowActive(true), 1060);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isVisible, shakeControls]);

  const yourHero = playerID === 1 ? playerOneHero : playerTwoHero;
  const opponentHero = playerID === 1 ? playerTwoHero : playerOneHero;
  const yourPatronInfo = playerID === 1 ? playerOnePatronInfo : playerTwoPatronInfo;
  const opponentPatronInfo = playerID === 1 ? playerTwoPatronInfo : playerOnePatronInfo;

  const displayYourHeroName = formatHeroName(yourHero) || 'Your Hero';
  const displayOpponentHeroName = formatHeroName(opponentHero) || 'Opponent';
  const yourPatronStatus = checkPatron(yourPatronInfo);
  const opponentPatronStatus = checkPatron(opponentPatronInfo);
  const yourMetafyTierName = getBadgeLabel(yourPatronInfo);
  const opponentMetafyTierName = getBadgeLabel(opponentPatronInfo);

  const disableHeroIntro = settingsData['DisableHeroIntro']?.value === '1';

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    dispatch(markHeroIntroAsShown());
    localStorage.setItem(getLocalStorageKey(), 'false');
  }, [dispatch, getLocalStorageKey]);

  // DEBUG: comment this to auto-dismiss disabled
   useEffect(() => {
     if (!isVisible || !settingsData) return;
     const t = setTimeout(handleDismiss, 4200);
     return () => clearTimeout(t);
   }, [isVisible, settingsData, handleDismiss]);

  if (
    playerID === 3 ||
    !isVisible ||
    !yourHero ||
    !opponentHero ||
    yourHero === opponentHero ||
    disableHeroIntro
  )
    return null;

  const cardSpring = { type: 'spring' as const, damping: 22, stiffness: 115 };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.introContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
        >
          {/* Arena environment layers */}
          <div className={styles.arenaOverlay} />
          <div className={styles.arenaKeyLight} />
          <div className={styles.arenaRimLeft} />
          <div className={styles.arenaRimRight} />

          {/* Floating dust motes */}
          <Particles />

          {/* Radial vignette */}
          <div className={styles.vignette} />

          <motion.div animate={shakeControls} className={styles.introContent}>
            {/* Your hero: slams in from the left, settles leaning toward center */}
            <motion.div
              initial={{ x: 440, opacity: 0, rotateY: 22 }}
              animate={{ x: 0, opacity: 1, rotateY: 12 }}
              transition={cardSpring}
              style={{ transformPerspective: 1400 }}
            >
              <HeroCard
                imageUrl={generateCroppedImageUrl(yourHero)}
                heroName={displayYourHeroName}
                isPremium={yourPatronStatus}
                glowActive={glowActive}
                metafyTierName={yourMetafyTierName}
              />
            </motion.div>

            <VSShockwave show={vsVisible} />

            {/* Opponent hero: slams in from the right, settles leaning toward center */}
            <motion.div
              initial={{ x: -440, opacity: 0, rotateY: -22 }}
              animate={{ x: 0, opacity: 1, rotateY: -12 }}
              transition={{ ...cardSpring, delay: 0.05 }}
              style={{ transformPerspective: 1400 }}
            >
              <HeroCard
                imageUrl={generateCroppedImageUrl(opponentHero)}
                heroName={displayOpponentHeroName}
                isPremium={opponentPatronStatus}
                glowActive={glowActive}
                metafyTierName={opponentMetafyTierName}
              />
            </motion.div>
          </motion.div>

          <motion.button
            className={styles.closeButton}
            onClick={handleDismiss}
            aria-label="Close hero intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroVsHeroIntro;
