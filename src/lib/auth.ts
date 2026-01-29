import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required')
        }

        // Find or create user
        let user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // Create new user
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              coins: 100, // Welcome bonus
              level: 1
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      
      // Sync user with database on sign in
      if (account && user) {
        try {
          const dbUser = await db.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              googleId: account.provider === 'google' ? account.providerAccountId : undefined
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              googleId: account.provider === 'google' ? account.providerAccountId : undefined,
              coins: 100,
              level: 1
            }
          })
          token.id = dbUser.id
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
