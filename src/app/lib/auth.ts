import "server-only";

import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import prisma from "./prisma";
import { LoginType, User } from "@prisma/client";
import bcrypt from "bcryptjs";

async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

type UserLike = Partial<User> & {
  email: string;
  name: string;
};

async function upsertUser({
  email,
  emailVerified,
  name,
  loginType = LoginType.GitHub,
  avatar,
  phone,
  password,
  address,
}: UserLike): Promise<Omit<User, "password"> | null> {
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 5);
  }
  try {
    const user = await prisma.user.upsert({
      create: {
        email,
        name,
        loginType,
        emailVerified,
        avatar,
        phone,
        password: hashedPassword,
        address,
      },
      update: {
        name,
        loginType,
        avatar,
        emailVerified: true,
      },
      where: {
        email,
      },
    });
    const { password, ...restUser } = user;
    return restUser;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

async function createUser(
  email: string,
  name: string,
  loginType = LoginType.GitHub
): Promise<User | null> {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        loginType,
        emailVerified: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { type: "text" },
        phone: { type: "text" },
        password: { type: "password" },
        name: { type: "text" },
        isRegister: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const {
          name,
          password,
          username: email,
          phone,
          isRegister,
        } = credentials;

        const user = await getUser(email);

        if (isRegister === "true") {
          if (user?.email) {
            // User already registered
            return null;
          }
          const userOpt = await upsertUser({
            email,
            name,
            loginType: LoginType.Normal,
            phone,
            emailVerified: false,
            password: password,
          });
          return userOpt;
        }

        // If no user or no password configured earlier
        if (user && user.password) {
          const passwordsMatched = await bcrypt.compare(
            password,
            user?.password
          );

          if (passwordsMatched) {
            const { password: _, ...restUser } = user;
            return restUser;
          }
        }

        return null;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_APP_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET as string,
      async profile(profile) {
        const { id, name, login, email, avatar_url, location } = profile;

        // Save/update user into DB
        const user = await upsertUser({
          email,
          name: name || login,
          loginType: LoginType.GitHub,
          avatar: avatar_url,
          emailVerified: true,
          address: location,
        });

        return {
          id: id.toString(),
          ...user,
          name: name || login,
          email,
          avatar: avatar_url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      async profile(profile) {
        const { sub, name, login, email, picture } = profile;

        // Save/update user into DB
        const user = await upsertUser({
          email,
          name: name || login,
          loginType: LoginType.Gmail,
          avatar: picture,
          emailVerified: true,
        });

        return {
          id: sub,
          ...user,
          name,
          email,
          avatar: picture,
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      async profile(profile) {
        const { id, name, email } = profile;
        const avatar = profile.picture.data.url;

        // Save/update user into DB
        const user = await upsertUser({
          email,
          name,
          loginType: LoginType.Facebook,
          avatar,
          emailVerified: true,
        });

        return {
          id,
          ...user,
          name,
          email,
          avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, user }) {
      if (profile) {
        // From OAuth
        // FIXME: Check email for other providers
        const user = await getUser(profile.email ?? "");
        if (user) {
          const { password, ...restUser } = user;
          token.user = restUser; // User from DB
        }
      } else if (user) {
        // From Credentials
        token.user = user;
      }

      return token;
    },
    session: async ({ session, token, user }) => {
      session.user = {
        ...(token.user ?? {}),
        ...user,
        ...session.user,
      };
      return session;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
