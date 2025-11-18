import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhySinavika from '@/components/WhySinavika';
import HowItWorks from '@/components/HowItWorks';
import Impact from '@/components/Impact';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WhySinavika />
      <HowItWorks />
      <Impact />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
