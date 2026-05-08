import { authClient } from "@/clients/auth-client";

export function useAuth() {
  const { data, isPending, error, refetch } = authClient.useSession();

  const user = data?.user ?? null;
  const session = data?.session ?? null;
  const isLoggedIn = !!user?.id;
  const userId = user?.id ?? "anonymous";

  return {
    user,
    userId,
    session,
    isLoggedIn,
    isLoading: isPending,
    error,
    refetch,
  };
}
