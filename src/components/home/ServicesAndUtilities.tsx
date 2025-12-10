'use client';

import { 
  Smartphone, 
  Zap, 
  Tv, 
  Droplet, 
  Flame, 
  Shield,
  Plane,
  Bus,
  Train,
  Hotel,
  Car,
  Clock // Added for the message icon
} from 'lucide-react';

export default function ServicesAndUtilities() {
  
  return (
    <section className="py-8 font-sans select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Card Container */}
        <div className="relative bg-white rounded-xl border border-gray-200 p-8 shadow-sm overflow-hidden">
          
          {/* Coming Soon Floating Badge (Centered, No Blur) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-900/95 text-white px-8 py-3 rounded-full shadow-2xl border border-gray-700 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#FF4D4F]" />
                <span className="text-lg font-bold tracking-wide">Services Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Content (Fully Visible) */}
          <div className="relative z-0">
            
            {/* Section 1: Bills & Recharge */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Text */}
              <div className="w-full md:w-1/3 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[22px] font-bold text-gray-900">Bills & Recharge</h2>
                </div>
                <p className="text-gray-500 text-[14px] mb-4 leading-relaxed">
                  Pay your bills & recharge instantly with Justdial
                </p>
                <span className="text-[#0076D7] text-[14px] font-medium cursor-pointer hover:underline">
                  Explore More
                </span>
              </div>

              {/* Right Icons Grid */}
              <div className="flex-1 flex flex-wrap gap-4 md:gap-8 justify-start md:justify-end">
                <ServiceIcon icon={<Smartphone className="text-cyan-500" />} label="Mobile" />
                <ServiceIcon icon={<Zap className="text-yellow-500 fill-yellow-500" />} label="Electricity" />
                <ServiceIcon icon={<Tv className="text-gray-600" />} label="DTH" />
                <ServiceIcon icon={<Droplet className="text-blue-500 fill-blue-500" />} label="Water" />
                <ServiceIcon icon={<Flame className="text-red-500 fill-red-500" />} label="Gas" />
                <ServiceIcon icon={<Shield className="text-indigo-600 fill-indigo-100" />} label="Insurance" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-8 w-full" />

            {/* Section 2: Travel Bookings */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Text */}
              <div className="w-full md:w-1/3 pt-2">
                <h2 className="text-[22px] font-bold text-gray-900 mb-2">Travel Bookings</h2>
                <p className="text-gray-500 text-[14px] mb-4 leading-relaxed">
                  Instant ticket bookings for your best travel experience
                </p>
                <span className="text-[#0076D7] text-[14px] font-medium cursor-pointer hover:underline">
                  Explore More
                </span>
              </div>

              {/* Right Icons Grid */}
              <div className="flex-1 flex flex-wrap gap-4 md:gap-8 justify-start md:justify-end">
                <ServiceIcon 
                  icon={<Plane className="text-blue-500 fill-blue-100" />} 
                  label="Flight" 
                  subLabel="Powered By Easemytrip.com"
                  subLabelColor="text-green-600"
                />
                <ServiceIcon 
                  icon={<Bus className="text-red-500 fill-red-100" />} 
                  label="Bus" 
                  subLabel="Affordable Rides"
                  subLabelColor="text-green-600"
                />
                <ServiceIcon 
                  icon={<Train className="text-orange-600 fill-orange-100" />} 
                  label="Train" 
                />
                <ServiceIcon 
                  icon={<Hotel className="text-pink-600 fill-pink-100" />} 
                  label="Hotel" 
                  subLabel="Budget-friendly Stay"
                  subLabelColor="text-green-600"
                />
                <ServiceIcon 
                  icon={<Car className="text-blue-600 fill-blue-100" />} 
                  label="Car Rentals" 
                  subLabel="Drive Easy Anywhere"
                  subLabelColor="text-green-600"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable Icon Component
function ServiceIcon({ 
  icon, 
  label, 
  subLabel,
  subLabelColor = "text-green-600"
}: { 
  icon: React.ReactNode; 
  label: string; 
  subLabel?: string;
  subLabelColor?: string;
}) {
  return (
    <div className="flex flex-col items-center w-[85px]">
      <div className="w-[70px] h-[70px] rounded-[18px] border border-gray-200 flex items-center justify-center bg-white hover:border-[#FF4D4F] transition-colors shadow-sm mb-3">
        <div className="[&>svg]:w-8 [&>svg]:h-8">
          {icon}
        </div>
      </div>
      <span className="text-[15px] text-gray-800 font-medium text-center leading-tight">
        {label}
      </span>
      {subLabel && (
        <span className={`text-[11px] ${subLabelColor} text-center mt-1 leading-tight`}>
          {subLabel}
        </span>
      )}
    </div>
  );
}