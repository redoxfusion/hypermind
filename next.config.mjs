import nextPwa from 'next-pwa';

const withPwa = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config here
};

export default withPwa(nextConfig);
