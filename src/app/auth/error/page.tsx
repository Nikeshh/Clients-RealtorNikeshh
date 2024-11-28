'use client'

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 text-center text-red-600">
            {error || 'An error occurred during authentication'}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-500"
            >
              Try signing in again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 