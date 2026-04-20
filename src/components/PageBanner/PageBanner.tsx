import styles from './PageBanner.module.css';

interface PageBannerProps {
  title: string;
  subtitle?: string;
}

const PageBanner = ({ title, subtitle }: PageBannerProps) => {
  return (
    <div className={styles.pageBannerSection}>
      <div className={styles.pageBannerBackground} />
      <div className={styles.pageBannerContent}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageBanner;
