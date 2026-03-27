import { computeStreak } from "./streaks";
import type { UserResult } from "./types";
import { computeVelocity } from "./velocity";

export interface Badge {
  id: string;
  label: string;
  /** Emoji placeholder — can be swapped for images later */
  icon: string;
  tooltip: string;
}

const BADGE_DEFINITIONS: {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  getValue: (r: UserResult) => number;
}[] = [
  {
    id: "top-committer",
    label: "Commit Captain",
    icon: "commit",
    tooltip: "Highest number of commits in the selected period",
    getValue: (r) => r.data?.contributionsCollection.totalCommitContributions ?? 0,
  },
  {
    id: "pr-machine",
    label: "PR Pro",
    icon: "pr",
    tooltip: "Opened the most pull requests in the selected period",
    getValue: (r) => r.data?.contributionsCollection.totalPullRequestContributions ?? 0,
  },
  {
    id: "code-reviewer",
    label: "Review Ruler",
    icon: "review",
    tooltip: "Reviewed the most pull requests in the selected period",
    getValue: (r) => r.data?.contributionsCollection.totalPullRequestReviewContributions ?? 0,
  },
  {
    id: "bug-hunter",
    label: "Issue Instigator",
    icon: "issue",
    tooltip: "Filed the most issues in the selected period",
    getValue: (r) => r.data?.contributionsCollection.totalIssueContributions ?? 0,
  },
  {
    id: "explorer",
    label: "Repo Ranger",
    icon: "repo",
    tooltip: "Active in the most repositories in the selected period",
    getValue: (r) => r.data?.contributionsCollection.commitContributionsByRepository.length ?? 0,
  },
  {
    id: "most-active",
    label: "Activity Ace",
    icon: "active",
    tooltip: "Highest total contributions across all categories",
    getValue: (r) => r.data?.contributionsCollection.contributionCalendar.totalContributions ?? 0,
  },
  {
    id: "streak-star",
    label: "Streak Star",
    icon: "streak",
    tooltip: "Longest consecutive days with contributions",
    getValue: (r) =>
      r.data ? computeStreak(r.data.contributionsCollection.contributionCalendar.weeks).longest : 0,
  },
  {
    id: "weekend-warrior",
    label: "Weekend Warrior",
    icon: "weekend",
    tooltip: "Most contributions on weekends (Saturday & Sunday)",
    getValue: (r) => {
      if (!r.data) return 0;
      const weeks = r.data.contributionsCollection.contributionCalendar.weeks;
      let total = 0;
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          if (day.weekday === 0 || day.weekday === 6) {
            total += day.contributionCount;
          }
        }
      }
      return total;
    },
  },
  {
    id: "consistent-contributor",
    label: "Consistent Contributor",
    icon: "consistent",
    tooltip: "Most evenly spread daily contributions (lowest variance)",
    getValue: (r) => {
      if (!r.data) return 0;
      const weeks = r.data.contributionsCollection.contributionCalendar.weeks;
      const counts: number[] = [];
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          counts.push(day.contributionCount);
        }
      }
      if (counts.length === 0) return 0;
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      if (mean === 0) return 0;
      const variance = counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / counts.length;
      // Invert: lower variance = higher score. Use 1/(1+stddev) so it's always in (0,1].
      return 1 / (1 + Math.sqrt(variance));
    },
  },
  {
    id: "rising-star",
    label: "Rising Star",
    icon: "rising",
    tooltip: "Biggest increase in contributions compared to the previous period",
    getValue: (r) => {
      if (!r.data) return 0;
      const velocity = computeVelocity(r.data.contributionsCollection, r.previousPeriodTotal);
      if (!velocity || velocity.percentage <= 0) return 0;
      return velocity.percentage;
    },
  },
];

/**
 * Compute badges for all users. Returns a map of username -> Badge[].
 * Only awards badges when 2+ users have data and the winner has a value > 0.
 */
export function computeBadges(results: Record<string, UserResult>): Record<string, Badge[]> {
  const usersWithData = Object.entries(results).filter(([, r]) => r.data);
  if (usersWithData.length < 2) return {};

  const badgeMap: Record<string, Badge[]> = {};

  for (const def of BADGE_DEFINITIONS) {
    let bestUser: string | null = null;
    let bestValue = 0;
    let tied = false;

    for (const [username, result] of usersWithData) {
      const value = def.getValue(result);
      if (value > bestValue) {
        bestValue = value;
        bestUser = username;
        tied = false;
      } else if (value === bestValue && value > 0) {
        tied = true;
      }
    }

    // Only award if there's a clear winner with value > 0
    if (bestUser && bestValue > 0 && !tied) {
      if (!badgeMap[bestUser]) badgeMap[bestUser] = [];
      badgeMap[bestUser].push({
        id: def.id,
        label: def.label,
        icon: def.icon,
        tooltip: def.tooltip,
      });
    }
  }

  return badgeMap;
}
