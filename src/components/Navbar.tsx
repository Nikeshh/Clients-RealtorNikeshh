'use client'

import Link from 'next/link'
import UserMenu from './UserMenu'
import { 
  Home,
  Users,
  Building2,
  Wrench,
  Wallet,
  BarChart2,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Tools', href: '/tools', icon: Wrench },
    {
      name: 'Finances',
      href: '/finances',
      icon: Wallet,
      children: [
        { name: 'Overview', href: '/finances', icon: BarChart2 },
        { name: 'Transactions', href: '/finances/transactions', icon: FileText },
        { name: 'Commissions', href: '/finances/commissions', icon: DollarSign },
        { name: 'Goals', href: '/finances/goals', icon: TrendingUp },
      ]
    }
  ]

  return (
    <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex-shrink-0 text-xl font-bold text-gray-800">
            Client Portal
          </Link>

          <div className="hidden sm:flex sm:items-center sm:justify-center flex-1 px-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group px-2">
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md group-hover:bg-gray-50"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.name}</span>
                  {item.children && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {item.children && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <child.icon className="h-4 w-4 mr-2" />
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <UserMenu />
          </div>

          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.name}</span>
                </Link>
                {item.children && (
                  <div className="pl-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <child.icon className="h-4 w-4 mr-2" />
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
} 