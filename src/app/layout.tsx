import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/auth/NextAuthProvider";
import { GoogleTagManager } from "@next/third-parties/google";
import Head from "next/head";
import StyledComponentsRegistry from "./lib/AntdRegistry";
import { DEFAULT_METADATA, ORG_SCHEMA } from "@/utils/constants";

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ORG_SCHEMA}
        />
      </Head>
      <body>
        <script>0</script>
        <GoogleTagManager gtmId="G-1JCHKWY78X" />
        <StyledComponentsRegistry>
          <NextAuthProvider>{children}</NextAuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
