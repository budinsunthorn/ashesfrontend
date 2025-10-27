/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Enable static export for Electron
    // output: 'export',
    // trailingSlash: true,
    // images: {
    //     unoptimized: true,
    // },
    // experimental: {
    //     appDir: true,
    //     fontLoaders: [
    //       { loader: "@next/font/google", options: { subsets: ["latin"] } },
    //     ],
    // },

    webpack: (config, { isServer }) => {
        // Handle Node.js modules in client-side code
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
            };
        }
        return config;
    },

    headers() {
    return [
        {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
            {
            key: 'X-Frame-Options',
            value: 'DENY', // Use 'SAMEORIGIN' if you want to allow framing from your own site
            },
            {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';", // Use 'self' or your domain if you want to allow framing from specific sources
            },
        ],
        },
    ];
    },
};

module.exports = nextConfig;
