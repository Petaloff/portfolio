import { cacheLife } from "next/cache";
import { site } from "./site";

export type Day = { date: string; count: number };
export type Contributions = { total: number; days: Day[] };

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

type GraphResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
    };
  };
};

type PublicResponse = { total: Record<string, number>; contributions: Day[] };

// GitHub's GraphQL API needs a token; without one fall back to a public mirror
// of the profile calendar
async function fromGraphQL(token: string): Promise<Contributions | null> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: site.github } }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const calendar = ((await res.json()) as GraphResponse).data?.user?.contributionsCollection
    .contributionCalendar;
  if (!calendar) return null;
  return {
    total: calendar.totalContributions,
    days: calendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
    ),
  };
}

async function fromPublic(): Promise<Contributions | null> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${site.github}?y=last`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as PublicResponse;
  return {
    total: json.total.lastYear ?? json.contributions.reduce((s, d) => s + d.count, 0),
    days: json.contributions.map(({ date, count }) => ({ date, count })),
  };
}

// The last year of contributions, oldest day first, refreshed a few times a day
export async function getContributions(): Promise<Contributions | null> {
  "use cache";
  cacheLife("hours");
  try {
    const token = process.env.GITHUB_TOKEN;
    return (token && (await fromGraphQL(token))) || (await fromPublic());
  } catch {
    return null;
  }
}

// Weeks as columns starting on Sunday, like the GitHub calendar
export function toWeeks(days: Day[]): (Day | null)[][] {
  if (!days.length) return [];
  const weeks: (Day | null)[][] = [];
  let week: (Day | null)[] = Array(new Date(days[0].date).getUTCDay()).fill(null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  return weeks;
}

// GitHub-style intensity level 0..4 relative to the busiest day
export function level(count: number, max: number) {
  if (count === 0 || max === 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}
