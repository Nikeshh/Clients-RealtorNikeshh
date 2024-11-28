import { auth } from "@/app/auth"
import { redirect } from "next/navigation"

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  return session.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return user
} 