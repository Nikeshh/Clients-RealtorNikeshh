'use client';

import Link from 'next/link';
import { 
  Calculator, 
  Home, 
  TrendingUp, 
  DollarSign, 
  FileText,
  BarChart2,
  Percent,
  Calendar,
  Building2
} from 'lucide-react';

const tools = [
  {
    name: 'Mortgage Calculator',
    description: 'Calculate monthly mortgage payments, including principal, interest, taxes, and insurance.',
    icon: Calculator,
    href: '/tools/calculator',
    color: 'bg-blue-500'
  },
  {
    name: 'Amortization Schedule',
    description: 'View detailed loan amortization schedule with principal and interest breakdown.',
    icon: Calendar,
    href: '/tools/amortization',
    color: 'bg-purple-500'
  },
  {
    name: 'Rent vs Buy',
    description: 'Compare the financial implications of renting versus buying a property.',
    icon: Home,
    href: '/tools/rent-vs-buy',
    color: 'bg-green-500'
  },
  {
    name: 'ROI Calculator',
    description: 'Calculate potential return on investment for property investments.',
    icon: TrendingUp,
    href: '/tools/roi',
    color: 'bg-indigo-500'
  },
  {
    name: 'Commission Calculator',
    description: 'Calculate real estate commission based on property price and rates.',
    icon: DollarSign,
    href: '/tools/commission',
    color: 'bg-orange-500'
  },
  {
    name: 'Closing Cost Calculator',
    description: 'Estimate closing costs including fees, taxes, and other expenses.',
    icon: FileText,
    href: '/tools/closing-costs',
    color: 'bg-red-500'
  },
  {
    name: 'Property Tax Calculator',
    description: 'Calculate estimated property taxes based on location and value.',
    icon: Building2,
    href: '/tools/property-tax',
    color: 'bg-yellow-500'
  },
  {
    name: 'Cap Rate Calculator',
    description: 'Calculate the capitalization rate for investment properties.',
    icon: Percent,
    href: '/tools/cap-rate',
    color: 'bg-teal-500'
  }
];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Real Estate Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.name} 
            href={tool.href}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full border border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`${tool.color} text-white p-3 rounded-lg`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {tool.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-gray-500 text-white p-3 rounded-lg">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Market Analysis
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Analyze local market trends and property values
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 