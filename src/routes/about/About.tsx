import AboutSection from 'routes/index/components/AboutSection';
import { usePageTitle } from 'hooks/usePageTitle';
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.ABOUT'));
  const { isSupporter, isLoading } = useSupporterStatus();
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);

  return <AboutSection />;
};

export default About;
