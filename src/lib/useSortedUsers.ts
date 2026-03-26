import { useEffect, useMemo } from "react";
import type { UserResult } from "./types";

export function useSortedUsers(users: string[], results: Record<string, UserResult>): string[] {
  const allLoaded = users.length > 0 && users.every((u) => results[u]?.data || results[u]?.error);

  const sortedUsers = useMemo(() => {
    if (!allLoaded) {
      const saved: string[] = JSON.parse(localStorage.getItem("ghcd-sort-order") ?? "[]");
      if (saved.length > 0) {
        const savedSet = new Set(saved);
        const known = saved.filter((u) => users.includes(u));
        const rest = users.filter((u) => !savedSet.has(u));
        return [...known, ...rest];
      }
      return users;
    }
    return [...users].sort((a, b) => {
      const totalA =
        results[a]?.data?.contributionsCollection.contributionCalendar.totalContributions ?? 0;
      const totalB =
        results[b]?.data?.contributionsCollection.contributionCalendar.totalContributions ?? 0;
      return totalB - totalA;
    });
  }, [users, results, allLoaded]);

  useEffect(() => {
    if (allLoaded) {
      localStorage.setItem("ghcd-sort-order", JSON.stringify(sortedUsers));
    }
  }, [allLoaded, sortedUsers]);

  return sortedUsers;
}
