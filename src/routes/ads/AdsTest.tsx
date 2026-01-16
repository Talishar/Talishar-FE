import React from 'react';
import { AdUnit } from 'components/ads';
import './AdsTest.css';

const AdsTest: React.FC = () => {
  return (
    <div className="ads-test-container">
      <header className="ads-test-header">
        <h1>Talishar Ad Placements Test</h1>
      </header>

      <div className="ads-test-content">
        {/* Left Sidebar */}
        <aside className="ads-test-sidebar ads-test-sidebar-left">
          <div className="ad-section">
            <h3>Left Rail</h3>
            <div className="ad-label">left-rail-1 (300x250)</div>
            <AdUnit placement="left-rail-1" />
          </div>
          <div className="ad-section">
            <div className="ad-label">left-rail-2 (300x600)</div>
            <AdUnit placement="left-rail-2" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="ads-test-main">
          <section className="ad-test-section">
            <h2>Leaderboard Placements (728x90)</h2>
            <p>Top-of-page and bottom-of-page standard placements</p>
            <div className="ad-label">leaderboard-1</div>
            <AdUnit placement="leaderboard-1" />
            <div className="ad-label">leaderboard-2</div>
            <AdUnit placement="leaderboard-2" />
            <div className="ad-label">leaderboard-3</div>
            <AdUnit placement="leaderboard-3" />
          </section>

          <section className="ad-test-section">
            <h2>Billboard Placements (970x250)</h2>
            <p>Premium horizontal advertisement space</p>
            <div className="ad-label">billboard-1</div>
            <AdUnit placement="billboard-1" />
            <div className="ad-label">billboard-2</div>
            <AdUnit placement="billboard-2" />
          </section>

          <section className="ad-test-section">
            <h2>Mobile Unit Placements (300x250)</h2>
            <p>Responsive mobile-optimized units</p>
            <div className="mobile-unit-grid">
              <div>
                <div className="ad-label">mobile-unit-1</div>
                <AdUnit placement="mobile-unit-1" />
              </div>
              <div>
                <div className="ad-label">mobile-unit-2</div>
                <AdUnit placement="mobile-unit-2" />
              </div>
              <div>
                <div className="ad-label">mobile-unit-3</div>
                <AdUnit placement="mobile-unit-3" />
              </div>
              <div>
                <div className="ad-label">mobile-unit-4</div>
                <AdUnit placement="mobile-unit-4" />
              </div>
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="ads-test-sidebar ads-test-sidebar-right">
          <div className="ad-section">
            <h3>Right Rail</h3>
            <div className="ad-label">right-rail-1 (300x250)</div>
            <AdUnit placement="right-rail-1" />
          </div>
          <div className="ad-section">
            <div className="ad-label">right-rail-2 (300x600)</div>
            <AdUnit placement="right-rail-2" />
          </div>
        </aside>
      </div>

      <footer className="ads-test-footer">
        <p>Talishar Ad Test Page | Ad Script: //js.rev.iq/talishar.net</p>
      </footer>
    </div>
  );
};

export default AdsTest;
