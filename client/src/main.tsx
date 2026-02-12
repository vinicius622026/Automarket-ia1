import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Cache Supabase session to avoid fetching on every request
let cachedSession: { access_token: string; expires_at?: number } | null = null;
let lastSessionCheck = 0;
const SESSION_CACHE_MS = 60000; // Cache for 1 minute

async function getAuthHeaders(): Promise<HeadersInit> {
  const now = Date.now();
  
  // Refresh cache if expired or doesn't exist
  if (!cachedSession || (now - lastSessionCheck > SESSION_CACHE_MS)) {
    const { data: { session } } = await supabase.auth.getSession();
    cachedSession = session;
    lastSessionCheck = now;
  }
  
  const headers: HeadersInit = {};
  if (cachedSession?.access_token) {
    headers['Authorization'] = `Bearer ${cachedSession.access_token}`;
  }
  
  return headers;
}

// Listen for auth state changes to invalidate cache
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    cachedSession = null;
    lastSessionCheck = 0;
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        // Get cached auth headers
        const authHeaders = await getAuthHeaders();
        const headers = new Headers(init?.headers);
        
        // Merge auth headers
        Object.entries(authHeaders).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
