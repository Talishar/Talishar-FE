import AboutSection from 'routes/index/components/AboutSection';
import { usePageTitle } from 'hooks/usePageTitle';
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';

const About = () => {
  usePageTitle('About');
  const { isSupporter, isLoading } = useSupporterStatus();
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);

  return <AboutSection />;
};

export default About;
