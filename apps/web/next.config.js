/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@teamflow/types',
    '@teamflow/core',
    '@teamflow/database',
    '@teamflow/workflow-engine',
    '@teamflow/ai-agents',
    '@teamflow/ui',
  ],
  webpack: (config) => {
    // Support for Web Workers
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
};

module.exports = nextConfig;
