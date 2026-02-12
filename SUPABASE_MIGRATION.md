# Supabase Auth Migration Guide

This document describes the migration from Manus OAuth to Supabase Auth.

## Overview

The AutoMarket AI application has been successfully migrated from Manus OAuth to Supabase Auth. This change provides:
- Modern, secure authentication
- Better developer experience
- Built-in session management
- Email/password authentication out of the box

## What Changed

### Backend Changes

1. **Removed Files**
   - `server/_core/oauth.ts` - OAuth callback handler (no longer needed)
   - `server/_core/sdk.ts` - Manus SDK (replaced with Supabase)
   - `server/_core/types/manusTypes.ts` - Manus type definitions

2. **Modified Files**
   - `server/_core/context.ts` - Now authenticates using Supabase tokens from Authorization header
   - `server/_core/env.ts` - Updated to use Supabase environment variables
   - `server/_core/index.ts` - Removed OAuth route registration

3. **Auth Implementation**
   - Authentication now uses Supabase's `auth.getUser()` with JWT token
   - User creation/sync happens automatically on first login
   - Session validation occurs in the tRPC context

### Frontend Changes

1. **New Files**
   - `client/src/lib/supabase.ts` - Supabase client initialization

2. **Modified Files**
   - `client/src/main.tsx` - Added Authorization header with cached session token
   - `client/src/const.ts` - Updated login URL to local `/login` route
   - `client/src/_core/hooks/useAuth.ts` - Integrated Supabase signOut
   - `client/src/pages/Login.tsx` - Sets Supabase session after sign in
   - `client/src/pages/SignUp.tsx` - Sets Supabase session after sign up

3. **Session Management**
   - Session tokens are cached for 1 minute to reduce API calls
   - Auth state changes automatically invalidate the cache
   - All tRPC requests include the Authorization header

### Database

No database schema changes were required. The existing `users` table works seamlessly with Supabase:
- `openId` field stores the Supabase user ID (UUID)
- `email` field stores the user's email
- `loginMethod` is set to 'email' for Supabase users

## Environment Variables

### Required Variables

Create a `.env` file in the project root with:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database (Required)
DATABASE_URL=mysql://user:password@localhost:3306/automarket_db

# Security (Required)
JWT_SECRET=your-jwt-secret-key-min-32-chars

# Optional
OWNER_OPEN_ID=owner-user-openid
```

### Removed Variables

The following variables are no longer needed:
- ~~`OAUTH_SERVER_URL`~~
- ~~`VITE_OAUTH_PORTAL_URL`~~
- ~~`VITE_APP_ID`~~

## Setting Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for the database to be provisioned

2. **Get Your Keys**
   - Go to Project Settings > API
   - Copy the `Project URL` (VITE_SUPABASE_URL)
   - Copy the `anon public` key (VITE_SUPABASE_ANON_KEY)

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Enable Email authentication
   - Configure email templates (optional)
   - Set site URL to your application URL

4. **Update Environment Variables**
   - Add the Supabase URL and anon key to your `.env` file
   - Restart your development server

## User Migration

Existing users in the database will continue to work with the new system:
- Their `openId` will be their existing identifier
- When they sign in with Supabase for the first time, a new Supabase user is created
- The app automatically syncs user data between Supabase and the local database

**Note**: Existing users will need to reset their passwords or sign up again through the new Supabase auth flow.

## Authentication Flow

### Sign Up
1. User enters email, password, and full name on `/signup`
2. Frontend calls `auth.signUp` tRPC mutation
3. Backend creates user in Supabase
4. Backend creates user record in local database
5. Frontend receives session and stores it in Supabase client
6. User is redirected to home page

### Sign In
1. User enters email and password on `/login`
2. Frontend calls `auth.signIn` tRPC mutation
3. Backend validates credentials with Supabase
4. Backend updates `lastSignedIn` in local database
5. Frontend receives session and stores it in Supabase client
6. User is redirected to home page

### Protected Routes
1. All tRPC requests include `Authorization: Bearer <token>` header
2. Backend context extracts token and validates with Supabase
3. User data is fetched from local database
4. If user doesn't exist locally, they're created automatically
5. Context includes user object for all protected procedures

### Sign Out
1. User clicks logout
2. Frontend calls Supabase `signOut()`
3. Frontend calls `auth.logout` tRPC mutation
4. Session cookie is cleared
5. User is redirected to login page

## Testing

To test the new authentication:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Test sign up:
   - Go to `/signup`
   - Enter email, password, and full name
   - Submit form
   - Verify redirect to home page
   - Check Supabase dashboard for new user

4. Test sign in:
   - Sign out if logged in
   - Go to `/login`
   - Enter credentials
   - Submit form
   - Verify redirect to home page

5. Test protected routes:
   - While logged in, navigate around the app
   - Verify user data is displayed correctly
   - Sign out and try accessing protected routes
   - Verify redirect to login page

6. Test logout:
   - Click logout button
   - Verify redirect to login page
   - Try accessing protected routes
   - Verify redirect to login page

## Troubleshooting

### "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
- Make sure your `.env` file has both variables set
- Restart the development server after adding variables
- Check that variable names match exactly (including `VITE_` prefix)

### "User email is required"
- This error occurs if Supabase user doesn't have an email
- Email is required for user creation in our database
- Ensure email authentication is properly configured in Supabase

### Session not persisting
- Check browser console for errors
- Verify Supabase client is properly initialized
- Check that session is being set after login
- Clear browser localStorage and try again

### "Invalid session cookie" or "Unauthorized"
- Clear browser cookies and localStorage
- Sign out and sign in again
- Check that `JWT_SECRET` is set in environment
- Verify Supabase token hasn't expired

## Security Considerations

1. **Environment Variables**: Never commit `.env` files or expose secrets
2. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
3. **HTTPS**: Always use HTTPS in production for secure token transmission
4. **Session Expiration**: Supabase handles token refresh automatically
5. **Rate Limiting**: Consider adding rate limiting to auth endpoints

## Future Enhancements

Possible improvements for the future:
- Add social login (Google, GitHub, etc.) through Supabase
- Implement email verification flow
- Add password reset functionality
- Add two-factor authentication (2FA)
- Add role-based access control (RBAC)
- Migrate storage to Supabase Storage

## Support

If you encounter any issues with the migration:
1. Check this guide's Troubleshooting section
2. Review the Supabase documentation: https://supabase.com/docs/guides/auth
3. Check the application logs for detailed error messages
4. Verify all environment variables are set correctly
