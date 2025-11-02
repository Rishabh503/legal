'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Scale, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-gray-900">Legal Mate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/lawyers" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
            >
              Find Lawyers
            </Link>
            
            {isSignedIn ? (
              <>
                <Link 
                  href="/client/dashboard" 
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/sign-in"
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="legal-button"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link 
              href="/lawyers" 
              className="block text-gray-700 hover:text-blue-900 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Lawyers
            </Link>
            
            {isSignedIn ? (
              <Link 
                href="/client/dashboard" 
                className="block text-gray-700 hover:text-blue-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/sign-in"
                  className="block text-gray-700 hover:text-blue-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="block legal-button text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}