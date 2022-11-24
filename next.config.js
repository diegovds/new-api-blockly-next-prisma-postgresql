/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000, https://myblocklymaze.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
