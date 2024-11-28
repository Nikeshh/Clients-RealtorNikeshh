import Link from 'next/link'
import { auth } from './auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function LandingPage() {
  const session = await auth()
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold text-gray-900">Client Portal</span>
            </Link>
          </div>
          <div className="flex gap-x-12">
            <Link 
              href="https://github.com/yourusername/realestatecrm" 
              className="text-sm font-semibold leading-6 text-gray-900"
              target="_blank"
            >
              GitHub
            </Link>
            <Link 
              href="/auth/signin" 
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="relative flex min-h-screen items-center">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-indigo-600">New</span>
                <span className="h-4 w-px bg-gray-900/10" aria-hidden="true" />
                <Link href="/auth/signin" className="flex items-center gap-x-1">
                  Get started today
                  <span className="absolute inset-0" aria-hidden="true" />
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Manage your real estate business better
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A powerful CRM designed specifically for real estate professionals. Track clients, 
              manage properties, and close more deals with our comprehensive solution.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/signin"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link
                href="https://github.com/yourusername/realestatecrm"
                className="text-sm font-semibold leading-6 text-gray-900"
                target="_blank"
              >
                View on GitHub <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply opacity-70 animate-blob" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-pink-50 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
