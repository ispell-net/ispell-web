/*
 * @Date: 2025-10-23 09:38:39
 * @LastEditTime: 2025-11-01 21:21:00
 * @Description: next.js 配置文件
 */
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
