/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors during build (for migration)
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during build (for migration)
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig