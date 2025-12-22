'use client';

import { Target, TrendingUp, Users, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: 'Market Your Business to New Customers',
    description: 'Reach thousands of potential customers actively searching for your services in your area.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Revenue',
    description: 'Increase your sales and revenue by connecting with high-intent customers ready to buy.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Users,
    title: 'Get More Walk-in Customers',
    description: 'Drive foot traffic to your physical location with targeted local advertising.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Mawjood Ads Help You Achieve Your Goals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful businesses growing with Mawjood
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`${benefit.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${benefit.color} text-white mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

