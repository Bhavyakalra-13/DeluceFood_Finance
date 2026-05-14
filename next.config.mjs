/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['react-apexcharts', 'apexcharts', 'firebase', 'jspdf', 'html2canvas', 'lucide-react', 'react-icons'],
  }
};

export default nextConfig;
