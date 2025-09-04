/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
    BACKEND_URL: process.env.BACKEND_URL || 'http://backend:8000',
  },
};

module.exports = nextConfig;
