/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 性能优化：启用压缩
  compress: true,
  // 性能优化：实验性优化（暂时禁用 optimizeCss 以避免构建错误）
  experimental: {
    // optimizeCss: true,  // 可能导致导出错误，暂时禁用
  },
  // 禁用静态导出中的错误页面
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable transpilation of packages
  transpilePackages: ['@sillytavern-clone/shared'],
  // Webpack configuration for any custom build needs
  webpack: (config, { isServer }) => {
    // Enable WebAssembly support for tiktoken
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    // Fallback for Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Rewrites for API proxying if needed
  async rewrites() {
    return [
      // Add any custom rewrites here
    ];
  },
};

module.exports = nextConfig;