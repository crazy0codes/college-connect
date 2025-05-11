/** @type {import('next').NextConfig} */
const nextConfig = {
  
  async rewrites(){
    return [
      {
        source: 'api/:auth*',
        destination: 'https://4.240.92.168:3001/:auth*'
      }
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
