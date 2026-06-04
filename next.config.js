const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: isStaticExport ? 'export' : 'standalone',
  ...(isStaticExport
    ? {
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

module.exports = nextConfig
