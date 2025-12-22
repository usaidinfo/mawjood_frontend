'use client';

import { TrendingUp, Users, Target, Sparkles, CheckCircle2, BarChart3, Globe, Shield } from 'lucide-react';

export default function HeroCTA() {
  const benefits = [
    'Premium Visibility',
    'Guaranteed Leads',
    '24/7 Support',
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-white to-primary/5 py-12 sm:py-16 lg:py-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>GROW Your Business</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Advertise With{' '}
            <span className="text-primary relative inline-block">
              Mawjood
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary absolute -top-2 -right-8 animate-pulse" />
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-4 font-medium">
            Saudi Arabia's No. 1 Local Business Directory
          </p>
          
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Reach millions of customers, increase your revenue, and grow your business with our powerful advertising platform
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-sm sm:text-base">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Data-Driven Results</h3>
              <p className="text-sm text-gray-600">Track performance with real-time analytics</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Wide Reach</h3>
              <p className="text-sm text-gray-600">Connect with customers across Saudi Arabia</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-sm text-gray-600">Your data and payments are protected</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Targeted Ads</h3>
              <p className="text-sm text-gray-600">Reach the right audience at the right time</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">100K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Businesses</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

