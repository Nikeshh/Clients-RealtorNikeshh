'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'

export default function UserMenu() {
  const { data: session, status } = useSession()

  // Show loading state
  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        Sign in
      </Link>
    )
  }

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span className="sr-only">Open user menu</span>
        {session.user.image ? (
          <Image
            className="h-8 w-8 rounded-full"
            src={session.user.image}
            alt={`Avatar of ${session.user.name || 'user'}`}
            width={32}
            height={32}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {(session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 text-xs text-gray-500">
            Signed in as
          </div>
          <div className="px-4 py-2 text-sm text-gray-700 border-b truncate">
            {session.user.email}
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/dashboard"
                className={`block px-4 py-2 text-sm ${
                  active ? 'bg-gray-100' : ''
                } text-gray-700`}
              >
                Dashboard
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  active ? 'bg-gray-100' : ''
                } text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 