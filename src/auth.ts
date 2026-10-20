import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import { site } from "@/lib/site";

// Only providers with credentials set are offered on the guestbook
// Discord now returns an `iss` parameter on the callback (RFC 9207); without a
// matching issuer Auth.js rejects it and the sign-in ends in a Configuration error
const providers = [
  ...(process.env.AUTH_GITHUB_ID ? [GitHub({})] : []),
  ...(process.env.AUTH_DISCORD_ID ? [Discord({ issuer: "https://discord.com" })] : []),
];

export const authProviders = providers.map((p) => p.id as "github" | "discord");
export const authSecret = !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
export const authEnabled = authSecret && providers.length > 0;

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; image?: string | null; provider: "github" | "discord"; admin: boolean };
  }
}

// Stateless JWT sessions: no database for accounts, the guestbook only needs
// a name, an avatar and where the visitor signed in from
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
        token.uid = account.providerAccountId;
        token.login = String(profile.login ?? profile.username ?? token.name ?? "");
      }
      return token;
    },
    session({ session, token }) {
      const provider = token.provider as "github" | "discord";
      const uid = String(token.uid ?? "");
      return {
        ...session,
        user: {
          id: `${provider}:${uid}`,
          name: String(token.login || token.name || "guest"),
          image: token.picture,
          provider,
          admin:
            (provider === "discord" && uid === site.discordId) ||
            (provider === "github" && String(token.login).toLowerCase() === site.github.toLowerCase()),
        },
      };
    },
  },
});
