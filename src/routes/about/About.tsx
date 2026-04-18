import AboutSection from 'routes/index/components/AboutSection';
import { usePageTitle } from 'hooks/usePageTitle';
import useAdScript from 'hooks/useAdScript';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';

const About = () => {
  usePageTitle('About');
  const { isLoggedIn, isLoading } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );
  const isSupporter = isLoggedIn
    ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false))
    : false;
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);

  return <AboutSection />;
};

export default About;
