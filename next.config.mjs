/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    WEB3AUTH_API_KEY: process.env.WEB3AUTH_API_KEY
  }
};

export default nextConfig;
