const isVercel = Boolean(process.env.VERCEL);

/** @type {import('next').NextConfig} */
const nextConfig = isVercel
  ? { trailingSlash: true }
  : { output: 'export', trailingSlash: true };

export default nextConfig;
