'use client';

import {
  TrendingUp,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  Headphones,
  Shield,
  Award,
  Smartphone,
  Monitor,
  Globe,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Premium Listing',
    description: 'Get higher visibility and exposure on Mawjood',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: FileText,
    title: 'Online Catalogue',
    description: 'Showcase your products and services to potential customers',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: CreditCard,
    title: 'Payment Solutions',
    description: 'Send and receive money from suppliers and customers',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Settings,
    title: 'Smart Lead Management System',
    description: 'View and track all your leads in one place',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: BarChart3,
    title: 'Competitor Analysis',
    description: 'Understand how your competitors are performing on Mawjood',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: Headphones,
    title: 'Premium Customer Support',
    description: 'Guided onboarding experience with priority assistance',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Verified Seal',
    description: 'Verify your business listing and improve your credibility',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Award,
    title: 'Trust Stamp',
    description: 'Become eligible for a Trust Stamp indicating your business is trustworthy',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: Smartphone,
    title: 'Mobile Banner',
    description: 'Promote your business on competitor listings targeting high-intent mobile users',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  {
    icon: Monitor,
    title: 'Website Banner',
    description: 'Promote your business on competitor listings targeting high-intent website users',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Globe,
    title: 'Business Website',
    description: 'Get a professional looking website with your own domain',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Star,
    title: 'Mawjood Rating Certificate',
    description: 'Boost trust by displaying positive ratings with a framed certificate',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features to Grow Your Business
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to succeed in one comprehensive platform
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

