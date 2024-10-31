/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['s2.coinmarketcap.com', 'cache.tonapi.io', 'crypto-swap-test.ru', 'www.crypto-swap-test.ru'],
  },
};

export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//   formats: ['image/avif', 'image/webp'],
//   domains: ['s2.coinmarketcap.com', 'cache.tonapi.io', 'crypto-swap-test.ru', 'www.crypto-swap-test.ru'],
//   unoptimized: true,
//    },
//   assetPrefix: process.env.NODE_ENV === 'production' ? '/swap-tg-client' : '',
//   basePath: process.env.NODE_ENV === 'production' ? '/swap-tg-client' : '',
//   output: 'export',
//   };
//   export default nextConfig;