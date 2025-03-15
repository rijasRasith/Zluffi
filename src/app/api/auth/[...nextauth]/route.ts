import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabase';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        userId: { label: "User ID", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.phoneNumber) {
          return null;
        }

        try {
          // Get user by ID and phone
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', credentials.userId)
            .eq('phone', credentials.phoneNumber)
            .single();
          
          if (!user) {
            return null;
          }
          
          return {
            id: user.id,
            name: user.name || `User${user.id.substring(0, 4)}`,
            email: user.email,
            phone: user.phone,
          };
        } catch (error) {
          console.error('Phone auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const googleId = profile?.sub;
          const email = profile?.email;
          
          if (!googleId || !email) return false;
          
          // Check if user exists by Google ID
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('google_id', googleId)
            .single();
          
          if (!existingUser) {
            // Check if email already exists
            const { data: emailUser } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('email', email)
              .single();
            
            if (emailUser) {
              // Update existing user with Google ID
              await supabaseAdmin
                .from('users')
                .update({ google_id: googleId })
                .eq('id', emailUser.id);
            } else {
              // Create new user
              await supabaseAdmin
                .from('users')
                .insert({
                  name: profile?.name,
                  email: email,
                  google_id: googleId,
                  avatar_url: profile?.image,
                });
            }
          }
          
          return true;
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        
        // Add phone number to session if available
        if (token.phone) {
          session.user.phone = token.phone as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        
        // Add phone number to token if available
        if ((user as any).phone) {
          token.phone = (user as any).phone;
        }
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
