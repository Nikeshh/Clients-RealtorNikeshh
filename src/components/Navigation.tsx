'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-white hover:text-blue-200 transition-colors">
                Realtor Portal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/clients" 
                className="text-white inline-flex items-center px-3 py-1 border-b-2 border-transparent hover:border-blue-400 hover:text-blue-200 transition-colors"
              >
                Clients
              </Link>
              <Link 
                href="/properties" 
                className="text-white inline-flex items-center px-3 py-1 border-b-2 border-transparent hover:border-blue-400 hover:text-blue-200 transition-colors"
              >
                Properties
              </Link>
              <Link 
                href="/tools" 
                className="text-white inline-flex items-center px-3 py-1 border-b-2 border-transparent hover:border-blue-400 hover:text-blue-200 transition-colors"
              >
                Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 