/*
 * @Date: 2025-10-23 09:38:39
 * @LastEditTime: 2025-11-04 19:12:53
 * @Description: 应用根布局组件 (已更新为更精简的 Sticky Header)
 */

// 外部类型与库导入
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';

// 全局样式导入
import './globals.css';

// 上下文提供者导入
import { AppProvider } from '@/contexts/app.context'; // 应用全局状态（用户、认证等）
import { SpellingProvider } from '@/contexts/spelling.context'; // 拼写练习上下文

// 全局组件导入
import AuthModals from '@/components/auth'; // 认证相关弹窗（登录/注册）
import { getMessages } from 'next-intl/server';
import Logo from '@/components/logo';
import HeaderActions from '@/components/header-actions';

// --- 字体配置 ---
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

// --- 元数据生成 (无需修改) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
    openGraph: {
      title: messages.metadata.title,
      description: messages.metadata.description,
      siteName: '爱拼词',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          url: '/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          rel: 'icon',
          url: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          rel: 'icon',
          url: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    manifest: '/site.webmanifest',
  };
}

// --- 根布局组件 ---
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <AppProvider>
            <SpellingProvider>
              <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
                <header className="sticky top-0 z-10 flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900">
                  <Logo />
                  <HeaderActions />
                </header>

                <main className="flex-1 flex flex-col items-center p-4">
                  {children}
                </main>
              </div>

              <AuthModals />
              <Toaster position="top-center" />
            </SpellingProvider>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
