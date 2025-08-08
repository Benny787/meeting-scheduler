import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// --- token refresh helper (unchanged) ---------------------
async function refreshGoogleAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const refreshed = await res.json();
    if (!res.ok) throw new Error(refreshed.error || "Failed to refresh token");

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (e) {
    console.error("[NextAuth] refresh error", e);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}
// -----------------------------------------------------------

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Auto-link by same verified email (safe for Google/MSA; they verify emails)
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          include_granted_scopes: "true",
        },
      },
    }),
    // In future, add Microsoft here with the same allowDangerousEmailAccountLinking
  ],

  // Production safety: only allow sign-in when email is present + verified
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = (profile as any)?.email;
        const verified =
          (profile as any)?.email_verified === true ||
          (profile as any)?.email_verified === "true";
        if (!email || !verified) return false; // hard stop
      }
      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.accessTokenExpires =
          (account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000);
        token.id = account.providerAccountId;
      }
      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      if (token.refreshToken) {
        return await refreshGoogleAccessToken(token);
      }
      return { ...token, error: "NoRefreshToken" as const };
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      (session as any).accessTokenExpires = token.accessTokenExpires as number | undefined;
      session.user.id = token.id as string;
      (session as any).calendarConnected = Boolean(session.accessToken);
      (session as any).tokenError = token.error;
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
