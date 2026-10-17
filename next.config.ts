import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] } };
export default config;
