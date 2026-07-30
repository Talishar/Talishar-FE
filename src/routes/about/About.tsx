import AboutSection from 'routes/index/components/AboutSection';
import { usePageTitle } from 'hooks/usePageTitle';
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.ABOUT'));
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);

  return <AboutSection />;
};

export default About;
