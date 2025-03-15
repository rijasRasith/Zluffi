'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, MessageSquare, Heart, PlusCircle } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-zluffi-medium-brown">Zluffi</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-zluffi-slate hover:text-zluffi-medium-brown">
              Browse
            </Link>
            <Link href="/categories/electronics" className="text-zluffi-slate hover:text-zluffi-medium-brown">
              Electronics
            </Link>
            <Link href="/categories/vehicles" className="text-zluffi-slate hover:text-zluffi-medium-brown">
              Vehicles
            </Link>
            <Link href="/categories/property" className="text-zluffi-slate hover:text-zluffi-medium-brown">
              Property
            </Link>
          </nav>
          
          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/listings/new"
                  className="bg-zluffi-medium-brown text-white px-4 py-2 rounded-lg hover:bg-zluffi-dark-brown transition flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Sell
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-zluffi-slate hover:text-zluffi-medium-brown">
                    <User className="w-5 h-5 mr-1" />
                    <span>{session.user?.name?.split(' ')[0] || 'Account'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link href="/dashboard" className="block px-4 py-2 text-zluffi-slate hover:bg-zluffi-clay/10">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/listings" className="block px-4 py-2 text-zluffi-slate hover:bg-zluffi-clay/10">
                      My Listings
                    </Link>
                    <Link href="/dashboard/messages" className="block px-4 py-2 text-zluffi-slate hover:bg-zluffi-clay/10">
                      Messages
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-zluffi-slate hover:bg-zluffi-clay/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-zluffi-slate hover:text-zluffi-medium-brown">
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-zluffi-medium-brown text-white px-4 py-2 rounded-lg hover:bg-zluffi-dark-brown transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-zluffi-slate"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/search" 
                className="text-zluffi-slate hover:text-zluffi-medium-brown"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/categories/electronics" 
                className="text-zluffi-slate hover:text-zluffi-medium-brown"
                onClick={() => setMobileMenuOpen(false)}
              >
                Electronics
              </Link>
              <Link 
                href="/categories/vehicles" 
                className="text-zluffi-slate hover:text-zluffi-medium-brown"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vehicles
              </Link>
              <Link 
                href="/categories/property" 
                className="text-zluffi-slate hover:text-zluffi-medium-brown"
                onClick={() => setMobileMenuOpen(false)}
              >
                Property
              </Link>
              
              {session ? (
                <>
                  <hr className="border-zluffi-clay/20" />
                  <Link 
                    href="/listings/new" 
                    className="flex items-center text-zluffi-medium-brown"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Sell Something
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center text-zluffi-slate"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/messages" 
                    className="flex items-center text-zluffi-slate"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Messages
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-zluffi-slate"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-zluffi-clay/20" />
                  <Link 
                    href="/login" 
                    className="text-zluffi-slate hover:text-zluffi-medium-brown"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-zluffi-medium-brown text-white px-4 py-2 rounded-lg hover:bg-zluffi-dark-brown transition text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
