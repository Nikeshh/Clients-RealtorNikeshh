import Link from 'next/link'
import UserMenu from './UserMenu'

export default function Navbar() {
  return (
    <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                Realtor Nikeshh Portal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className="text-gray-700 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
              >
                Clients
              </Link>
              <Link
                href="/properties"
                className="text-gray-700 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
              >
                Properties
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
} 