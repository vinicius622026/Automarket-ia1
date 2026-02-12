export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// For Supabase auth, we use a local login page
export const getLoginUrl = () => {
  return '/login';
};
