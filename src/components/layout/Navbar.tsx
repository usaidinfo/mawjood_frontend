'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import UnifiedAuthModal from '@/components/auth/UnifiedAuthModal';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GTranslate from '@/components/GTranslate';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Briefcase, Globe, Megaphone, Phone, User, Menu, LogIn } from 'lucide-react';

const NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/businesses', key: 'businesses' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Navbar() {
  const { t, i18n } = useTranslation('common');
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const { data: siteSettings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  const navbarSettings = useMemo(() => siteSettings?.navbar, [siteSettings]);
  const logoSrc = useMemo(() => navbarSettings?.logoUrl || '/logo/logo2.png', [navbarSettings]);
  const brandName = useMemo(() => navbarSettings?.brandName || t('nav.mawjood'), [navbarSettings, t]);
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user?.role]);
  const isBusinessOwner = useMemo(() => user?.role === 'BUSINESS_OWNER', [user?.role]);
  const showAuthUI = mounted;

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  }, [i18n]);

  const handleAddBusiness = useCallback(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard/add-listing';
    } else {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleLogout = useCallback(() => {
    logout();
    setShowUserMenu(false);
  }, [logout]);

  const closeMobileMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <nav className="bg-white border-b border-gray-300 sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
                <Image
                  src={logoSrc}
                  alt="Mawjood Logo"
                  width={40}
                  height={40}
                  className="h-8 w-auto md:h-8 lg:h-10 flex-shrink-0"
                />
                <div className="ml-1.5 md:ml-0 lg:ml-2 flex-shrink-0">
                  <h1 className="text-primary hover:text-primary block md:hidden lg:block text-sm md:text-sm lg:text-base font-bold leading-tight whitespace-nowrap">
                    {brandName}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right: Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Language */}
              <div className="flex items-center gap-1 text-gray-600 hover:text-primary text-sm font-medium cursor-pointer relative z-10">
                <Globe className="w-4 h-4" />
                <div className="min-w-[80px]">
                   <GTranslate className="!inline-block" id="gtranslate-desktop" />
                </div>
              </div>

              {/* Advertise */}
              <Link href="/advertise" className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm font-medium transition-colors">
                <Megaphone className="w-4 h-4" />
                <span>Advertise</span>
              </Link>

              {/* Contact */}
              <Link href="/contact" className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm font-medium transition-colors">
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </Link>

              {/* Free Listing Button */}
              {(!isAuthenticated || isBusinessOwner) && (
                <button
                  onClick={handleAddBusiness}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Free Listing</span>
                </button>
              )}

              {/* Auth / User Menu */}
              {showAuthUI && isAuthenticated && user ? (
                <div className="flex items-center gap-4 pl-2 border-l border-gray-200 h-8">
                  <Popover open={showUserMenu} onOpenChange={setShowUserMenu}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-full transition-colors">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden border border-primary/20">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={`${user.firstName}`}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            `${user.firstName[0]}${user.lastName[0]}`
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                          {user.firstName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="end">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                        </div>

                        <div className="p-1">
                          {isAdmin && (
                            <Link href="/admin" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                              Admin Dashboard
                            </Link>
                          )}

                          {isBusinessOwner && (
                            <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                              Business Dashboard
                            </Link>
                          )}

                          <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                            My Profile
                          </Link>

                          {isBusinessOwner && (
                            <Link href="/dashboard/my-listings" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                              My Businesses
                            </Link>
                          )}

                          <Link href="/favourites" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                            Favourites
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 p-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                          >
                            Logout
                          </button>
                        </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : showAuthUI ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200 h-8">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login / Sign Up</span>
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center">
               <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="text-gray-600 hover:text-primary p-2"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full">
              <div className="px-4 pt-2 pb-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
                
                <Link
                    href="/advertise"
                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Advertise
                </Link>

                {(!isAuthenticated || isBusinessOwner) && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        handleAddBusiness();
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-md text-base font-medium hover:bg-primary/90"
                    >
                      <Briefcase className="w-5 h-5" />
                      Free Listing
                    </button>
                  </div>
                )}

                <div className="pt-4 pb-3 border-t border-gray-100 mt-2">
                  {showAuthUI && isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {user.firstName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <Link href="/admin" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary" onClick={closeMobileMenu}>Admin Dashboard</Link>
                      )}
                      {isBusinessOwner && (
                        <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary" onClick={closeMobileMenu}>Dashboard</Link>
                      )}
                      <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary" onClick={closeMobileMenu}>My Profile</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                  ) : showAuthUI ? (
                    <div className="space-y-3 px-1">
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-md font-medium hover:bg-gray-50"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          closeMobileMenu();
                        }}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-md font-medium hover:bg-gray-800"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
        )}
      </nav>

      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}