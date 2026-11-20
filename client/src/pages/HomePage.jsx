import Hero from '../components/home/Hero';
import FeatureStrip from '../components/home/FeatureStrip';
import FeaturedStamps from '../components/home/FeaturedStamps';
import CategoryGrid from '../components/home/CategoryGrid';
import HowItWorks from '../components/home/HowItWorks';
import AIPreview from '../components/home/AIPreview';
import CommunityPreview from '../components/home/CommunityPreview';
import CallToAction from '../components/home/CallToAction';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Homepage: composes the section components in order.
 * Each section is self-contained, so sections can be reordered or removed freely.
 */
export default function HomePage() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <FeatureStrip />
      <FeaturedStamps />
      <CategoryGrid />
      <HowItWorks />
      <AIPreview />
      <CommunityPreview />
      <CallToAction />
    </>
  );
}
