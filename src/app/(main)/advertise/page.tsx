'use client';

import HeroCTA from '@/components/advertise/HeroCTA';
import BenefitsSection from '@/components/advertise/BenefitsSection';
import TrustSection from '@/components/advertise/TrustSection';
import PricingPlansSection from '@/components/advertise/PricingPlansSection';
import FeaturesSection from '@/components/advertise/FeaturesSection';
import FAQSection from '@/components/advertise/FAQSection';

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCTA />
      <BenefitsSection />
      <TrustSection />
      <PricingPlansSection />
      <FeaturesSection />
      <FAQSection />
    </div>
  );
}

