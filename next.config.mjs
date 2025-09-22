/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Build-Optimierungen
  experimental: {
    // Schnellere Builds durch weniger Optimierungen im Entwicklungsmodus
    optimizeCss: false,
  },
  // Deaktiviere unnötige Features für schnellere Builds
  swcMinify: true,
  // Reduziere Build-Traces für schnellere Builds
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig
