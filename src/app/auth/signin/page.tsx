'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSignIn = async (provider: 'github' | 'google') => {
    setLoading(`signIn-${provider}`, true);
    try {
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Signed in successfully!', 'success');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      addToast('Failed to sign in. Please try again.', 'error');
    } finally {
      setLoading(`signIn-${provider}`, false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error === 'OAuthSignin' ? 'An error occurred during sign in' : error}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading('signIn-github') || isLoading('signIn-google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading('signIn-github') ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaGithub className="w-5 h-5" />
            )}
            {isLoading('signIn-github') ? 'Signing in...' : 'Continue with GitHub'}
          </button>

          <button
            onClick={() => handleSignIn('google')}
            disabled={isLoading('signIn-github') || isLoading('signIn-google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading('signIn-google') ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaGoogle className="w-5 h-5" />
            )}
            {isLoading('signIn-google') ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
} 