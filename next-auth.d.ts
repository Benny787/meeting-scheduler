import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accessTokenExpires?: number;
    calendarConnected?: boolean;
    tokenError?: "RefreshAccessTokenError" | "NoRefreshToken";
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    id?: string;
    error?: "RefreshAccessTokenError" | "NoRefreshToken";
  }
}
