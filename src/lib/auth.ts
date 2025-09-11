import GoogleProvider from 'next-auth/providers/google';
// import { supabaseAdmin } from './supabase';
// import { User } from '@/types/user';

// Check if Google OAuth is configured
const isGoogleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const authOptions = {
  providers: isGoogleConfigured ? [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ] : [],
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  // Configure the base URL for production
  url: process.env.NEXTAUTH_URL || 'https://tarkovsecret.vercel.app',
  
  // Secret for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('SignIn callback triggered:', { user: user?.email, provider: account?.provider });
      
      // Allow all sign-ins for now to test connectivity
      return true;
    },
    
    async session({ session, token }: any) {
      console.log('Session callback triggered:', { user: session.user?.email });
      
      // Return session as-is for now
      return session;
    },
    
    async jwt({ token, user, account }: any) {
      console.log('JWT callback triggered:', { user: user?.email });
      
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  events: {
    async signOut({ session, token }: any) {
      console.log('SignOut event triggered:', { user: session?.user?.email });
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get current user
// export async function getCurrentUser(email: string): Promise<User | null> {
//   try {
//     const { data: user } = await supabaseAdmin
//       .from('users')
//       .select(`
//         *,
//         user_subscriptions!inner(*),
//         user_profiles(*),
//         user_preferences(*)
//       `)
//       .eq('email', email)
//       .single();
    
//     return {
//       ...user,
//       created_at: user?.created_at ? new Date(user.created_at) : undefined,
//       updated_at: user?.updated_at ? new Date(user.updated_at) : undefined,
//     } as User;
//   } catch (error) {
//     console.error('Error fetching current user:', error);
//     return null;
//   }
// }

// Helper function to check if user has Plus subscription
// export async function isUserPlus(userId: string): Promise<boolean> {
//   try {
//     const { data: subscription } = await supabaseAdmin
//       .from('user_subscriptions')
//       .select('type, status')
//       .eq('user_id', userId)
//       .eq('status', 'ACTIVE')
//       .single();
    
//     return subscription?.type === 'PLUS';
//   } catch (error) {
//     console.error('Error checking user subscription:', error);
//     return false;
//   }
// }

export default authOptions;

// Helper function to get server session
export async function getServerSession(): Promise<{ user?: { email?: string; id?: string } } | null> {
  // Simple implementation for now
  return null;
}
