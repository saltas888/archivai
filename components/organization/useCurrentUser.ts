import { useQuery } from "@tanstack/react-query";

async function getCurrentUser() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export default function useCurrentUser() {
  const { data: currentUser, ...rest } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
  return { currentUser, ...rest };
}