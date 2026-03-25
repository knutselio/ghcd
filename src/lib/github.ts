export const QUERY_ORG = `query($org:String!){organization(login:$org){id name}}`;

export const QUERY_USER = `query($user:String!,$orgId:ID,$from:DateTime!,$to:DateTime!){
  user(login:$user){avatarUrl contributionsCollection(organizationID:$orgId,from:$from,to:$to){
    totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions
    totalIssueContributions totalRepositoryContributions
    contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel weekday}}}
  }}
}`;

export async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.error) msg = json.error;
    } catch {
      msg += `: ${text.slice(0, 200)}`;
    }
    throw new Error(msg);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "));
  }
  return json.data as T;
}

export async function setToken(token: string): Promise<void> {
  const res = await fetch("/api/pat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Failed to save token");
}

export async function clearToken(): Promise<void> {
  await fetch("/api/pat", {
    method: "DELETE",
    credentials: "include",
  });
}

export async function hasToken(): Promise<boolean> {
  const res = await fetch("/api/pat/status", { credentials: "include" });
  const data = await res.json();
  return data.hasToken;
}
