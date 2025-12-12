import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['acta-builder'],
  webpack: (config, { webpack }) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      buffer: 'buffer/',
      fs: false,
      path: false,
    };
    config.resolve.mainFields = ['browser', 'module', 'main'];

    // Ignore test files and unnecessary files from node_modules
    config.plugins = [
      ...(config.plugins || []),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test\//,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|mjs|ts)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.bench\.(js|mjs|ts)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/LICENSE$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/README\.md$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tap$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^desm$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^fastbench$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-elasticsearch$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^why-is-node-running$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tape$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      }),
    ];

    return config;
  },
};

export default nextConfig;
