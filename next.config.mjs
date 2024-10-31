/** @type {import('next').NextConfig} */
const nextConfig = {
  // Базовые настройки изображений
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      's2.coinmarketcap.com', 
      'cache.tonapi.io', 
      'crypto-swap-test.ru', 
      'www.crypto-swap-test.ru'
    ],
    // Включаем встроенную оптимизацию Vercel
    unoptimized: false,
  },
  //assetPrefix: process.env.NODE_ENV === 'production' ? '/swap-tg-client' : '',
  //basePath: process.env.NODE_ENV === 'production' ? '/swap-tg-client' : '',
  
  // Оптимизации для production
  experimental: {
    // Оптимизация CSS
    optimizeCss: true,
    // Улучшение производительности сборки
    turbo: true,
  },

  // Настройки для production среды
  productionBrowserSourceMaps: false, // Отключаем source maps в production
  compress: true, // Включаем сжатие
  poweredByHeader: false, // Отключаем заголовок X-Powered-By
  reactStrictMode: true, // Включаем строгий режим React
}

export default nextConfig;