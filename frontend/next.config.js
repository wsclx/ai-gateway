/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555/api/v1',
  },
};

module.exports = nextConfig;
