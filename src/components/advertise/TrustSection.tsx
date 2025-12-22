'use client';

import { Award, Star, TrendingUp, Users, CheckCircle2, Zap } from 'lucide-react';

const trustMetrics = [
  {
    icon: Award,
    value: '4.9/5',
    label: 'Average Rating',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: Users,
    value: '50K+',
    label: 'Active Businesses',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    value: '300%',
    label: 'Avg. Growth',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Zap,
    value: '24/7',
    label: 'Support',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
];

const testimonials = [
  {
    name: 'Ahmed Al-Rashid',
    business: 'Al-Rashid Trading',
    rating: 5,
    text: 'Mawjood transformed our business. We saw a 250% increase in leads within the first month.',
    location: 'Riyadh',
  },
  {
    name: 'Fatima Al-Zahra',
    business: 'Zahra Beauty Salon',
    rating: 5,
    text: 'The best investment we made. Our customer base grew exponentially, and the ROI was incredible.',
    location: 'Jeddah',
  },
  {
    name: 'Mohammed Al-Saud',
    business: 'Saud Auto Services',
    rating: 5,
    text: 'Professional platform with excellent support. Highly recommend to any business owner.',
    location: 'Dammam',
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Businesses
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join the growing community of successful businesses that trust Mawjood to grow their customer base
          </p>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {trustMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-14 h-14 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${metric.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
            >
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-gray-700 font-medium">
              Join <span className="text-primary font-bold">50,000+</span> successful businesses today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

