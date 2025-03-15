import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getDb } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // We'll implement a custom provider for OTP later
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const db = await getDb();
          
          // Check if user exists
          const existingUser = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
          ).bind(user.email).first();
          
          if (!existingUser) {
            // Create new user
            await db.prepare(
              'INSERT INTO users (name, email, avatar_url) VALUES (?, ?, ?)'
            ).bind(user.name, user.email, user.image).run();
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
