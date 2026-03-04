import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  webpack: (config, { webpack }) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      buffer: 'buffer/',
      fs: false,
      path: false,
    };
    config.resolve.mainFields = ['browser', 'module', 'main'];

    // Silence known noisy warnings from optional native deps pulled in via stellar-sdk
    // (they still work in the browser via fallbacks, but webpack can't statically analyze them).
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules[\\/](require-addon|sodium-native)[\\/]/,
        message: /Critical dependency:/,
      },
    ];

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
