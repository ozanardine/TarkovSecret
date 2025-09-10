import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from './supabase';
import { User } from '@/types/user';

// Check if Google OAuth is configured
const isGoogleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
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
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single();
          
          if (!existingUser) {
            // Create new user
            const { data: newUser, error: userError } = await supabaseAdmin
              .from('users')
              .insert({
                id: user.id!,
                email: user.email!,
                name: user.name || '',
                image: user.image || '',
              })
              .select()
              .single();
            
            if (userError) throw userError;
            
            // Create default free subscription
            await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                userId: newUser.id,
                type: 'FREE',
                status: 'ACTIVE',
                start_date: new Date().toISOString(),
                auto_renew: false,
                cancel_at_period_end: false,
              });
            
            // Create default profile
            await supabaseAdmin
              .from('user_profiles')
              .insert({
                userId: newUser.id,
                display_name: user.name || '',
                bio: '',
                is_public: false,
              });
            
            // Create default preferences
            await supabaseAdmin
              .from('user_preferences')
              .insert({
                userId: newUser.id,
                theme: 'DARK',
                language: 'PT',
                currency: 'USD',
                notifications: {
                  email: true,
                  push: true,
                  discord: false,
                  priceAlerts: true,
                  questUpdates: true,
                  marketUpdates: true,
                  newsUpdates: false,
                },
                privacy: {
                  showProfile: false,
                  showStats: false,
                  showInventory: false,
                  showProgress: false,
                },
                display: {
                  itemsPerPage: 20,
                  showImages: true,
                  compactMode: false,
                  showTooltips: true,
                },
              });
            
            // Create default stats
            await supabaseAdmin
              .from('user_stats')
              .insert({
                userId: newUser.id,
                total_logins: 1,
                last_login: new Date().toISOString(),
                total_searches: 0,
                favorite_items: [],
                watched_items: [],
                completed_quests: [],
                hideout_progress: {},
                achievements: [],
              });
          } else {
            // Update existing user info
            await supabaseAdmin
              .from('users')
              .update({
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingUser.id);
            
            // Update last login
            await supabaseAdmin
              .from('user_stats')
              .update({
                total_logins: (existingUser as any).total_logins + 1,
                last_login: new Date().toISOString(),
              })
              .eq('user_id', existingUser.id);
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    
    async session({ session, token }: any) {
      if (session.user?.email) {
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (user) {
            const { data: subscription } = await supabaseAdmin
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'ACTIVE')
              .single();
            
            session.user = {
              ...session.user,
              id: user.id,
              subscription: subscription || null,
            };
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
        }
      }
      
      return session;
    },
    
    async jwt({ token, user, account }: any) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  events: {
    async signOut({ session, token }: any) {
      if (session?.user?.id) {
        try {
          // Update last sign out time
          await supabaseAdmin
            .from('users')
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);
        } catch (error) {
          console.error('Error during sign out:', error);
        }
      }
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get current user
export async function getCurrentUser(email: string): Promise<User | null> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_subscriptions!inner(*),
        user_profiles(*),
        user_preferences(*)
      `)
      .eq('email', email)
      .single();
    
    return user as User;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// Helper function to check if user has Plus subscription
export async function isUserPlus(userId: string): Promise<boolean> {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('type, status')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single();
    
    return subscription?.type === 'PLUS';
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return false;
  }
}

export default authOptions;

// Helper function to get server session
export async function getServerSession() {
  const { getServerSession: getSession } = await import('next-auth/next');
  return getSession(authOptions);
}