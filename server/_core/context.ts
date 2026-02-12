import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Check for Supabase token in Authorization header
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        // Validate Supabase token and get user
        const { getCurrentUser } = await import('../supabase-auth');
        const supabaseUser = await getCurrentUser(token);
        
        if (supabaseUser) {
          // Get user from our database
          user = await db.getUserByOpenId(supabaseUser.id) ?? null;
          
          // Create user if doesn't exist
          if (!user) {
            const userName = supabaseUser.user_metadata?.full_name || 
                           supabaseUser.email?.split('@')[0] || 
                           'User';
            const userEmail = supabaseUser.email || null;
            
            if (!userEmail) {
              console.error('[Auth] Cannot create user without email');
              throw new Error('User email is required');
            }
            
            await db.upsertUser({
              openId: supabaseUser.id,
              email: userEmail,
              name: userName,
              loginMethod: 'email',
              lastSignedIn: new Date(),
            });
            user = await db.getUserByOpenId(supabaseUser.id) ?? null;
          } else {
            // Update last signed in
            await db.upsertUser({
              openId: user.openId,
              lastSignedIn: new Date(),
            });
          }
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error('[Auth] Context authentication failed:', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
