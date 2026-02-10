import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("[Supabase Auth] Missing PROJECT_URL/VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabaseAuth = createClient(supabaseUrl, supabaseKey);

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign in an existing user
 */
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  const { error } = await supabaseAuth.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Get the current user from session token
 */
export async function getCurrentUser(token: string) {
  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

/**
 * Reset password for a user
 */
export async function resetPassword(email: string) {
  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.PROJECT_URL}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
