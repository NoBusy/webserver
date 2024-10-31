/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['s2.coinmarketcap.com', 'cache.tonapi.io', 'crypto-swap-test.ru', 'www.crypto-swap-test.ru'],
  },
};

export default nextConfig;
