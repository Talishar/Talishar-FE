import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from 'components/ads';
import './AdsTest.css';

const AdsTest: React.FC = () => {
  const { t } = useTranslation();
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//js.rev.iq/talishar.net';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return (
    <div className="ads-test-container">
      <header className="ads-test-header">
        <h1>{t('ADS_TEST.TITLE')}</h1>
      </header>

      <div className="ads-test-content">
        {/* Left Sidebar */}
        <aside className="ads-test-sidebar ads-test-sidebar-left">
          <div className="ad-section">
            <h3>{t('ADS_TEST.LEFT_RAIL')}</h3>
            <div className="ad-label">{t('ADS_TEST.LEFT_RAIL_1_LABEL')}</div>
            <AdUnit placement="left-rail-1" />
          </div>
          <div className="ad-section">
            <div className="ad-label">{t('ADS_TEST.LEFT_RAIL_2_LABEL')}</div>
            <AdUnit placement="left-rail-2" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="ads-test-main">
          <section className="ad-test-section">
            <h2>{t('ADS_TEST.LEADERBOARD_TITLE')}</h2>
            <p>{t('ADS_TEST.LEADERBOARD_DESC')}</p>
            <div className="ad-label">{t('ADS_TEST.LEADERBOARD_1_LABEL')}</div>
            <AdUnit placement="leaderboard-1" />
            <div className="ad-label">{t('ADS_TEST.LEADERBOARD_2_LABEL')}</div>
            <AdUnit placement="leaderboard-2" />
            <div className="ad-label">{t('ADS_TEST.LEADERBOARD_3_LABEL')}</div>
            <AdUnit placement="leaderboard-3" />
          </section>

          <section className="ad-test-section">
            <h2>{t('ADS_TEST.BILLBOARD_TITLE')}</h2>
            <p>{t('ADS_TEST.BILLBOARD_DESC')}</p>
            <div className="ad-label">{t('ADS_TEST.BILLBOARD_1_LABEL')}</div>
            <AdUnit placement="billboard-1" />
            <div className="ad-label">{t('ADS_TEST.BILLBOARD_2_LABEL')}</div>
            <AdUnit placement="billboard-2" />
          </section>

          <section className="ad-test-section">
            <h2>{t('ADS_TEST.MOBILE_TITLE')}</h2>
            <p>{t('ADS_TEST.MOBILE_DESC')}</p>
            <div className="mobile-unit-grid">
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_1_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-1" />
              </div>
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_2_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-2" />
              </div>
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_3_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-3" />
              </div>
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_4_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-4" />
              </div>
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_5_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-5" />
              </div>
              <div>
                <div className="ad-label">
                  {t('ADS_TEST.MOBILE_UNIT_6_LABEL')}
                </div>
                <AdUnit placement="mobile-unit-6" />
              </div>
            </div>
          </section>

          <section className="ad-test-section">
            <h2>{t('ADS_TEST.IN_GAME_TITLE')}</h2>
            <div>
              <div className="ad-label">
                {t('ADS_TEST.IN_GAME_BLOCK_LABEL')}
              </div>
              <div data-ad="in-game-block" />
            </div>
          </section>

          <section className="ad-test-section">
            <h2>{t('ADS_TEST.VIDEO_TITLE')}</h2>
            <div>
              <div className="ad-label">{t('ADS_TEST.REWARDED_VIDEO_AD')}</div>
              <div data-ad="video" />
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="ads-test-sidebar ads-test-sidebar-right">
          <div className="ad-section">
            <h3>{t('ADS_TEST.RIGHT_RAIL')}</h3>
            <div className="ad-label">{t('ADS_TEST.RIGHT_RAIL_1_LABEL')}</div>
            <AdUnit placement="right-rail-1" />
          </div>
          <div className="ad-section">
            <div className="ad-label">{t('ADS_TEST.RIGHT_RAIL_2_LABEL')}</div>
            <AdUnit placement="right-rail-2" />
          </div>
        </aside>
      </div>

      <footer className="ads-test-footer">
        <p>{t('ADS_TEST.FOOTER')}</p>
      </footer>
    </div>
  );
};

export default AdsTest;
