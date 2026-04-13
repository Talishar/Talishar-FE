import AboutSection from 'routes/index/components/AboutSection';
import { usePageTitle } from 'hooks/usePageTitle';

const About = () => {
  usePageTitle('About');
  return <AboutSection />;
};

export default About;
