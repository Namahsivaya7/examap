/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx"],
};

module.exports = nextConfig;
