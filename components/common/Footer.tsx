'use client';
/*
 * @Date: 2025-11-06
 * @LastEditTime: 2025-11-07 20:41:52
 * @Description: 全局固定页脚组件 (已更新响应式布局和链接)
 */

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation'; // 使用 next-intl 的 Link
// [!! 新增 !!] 导入 AppContext
import { useAppContext } from '@/contexts/app.context';

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  // [!! 新增 !!] 获取 Context 的方法
  const { openFeedbackModal } = useAppContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      // [!! 3. 响应式 !!] 移动端高度自适应，桌面端固定 h-16
      className="fixed bottom-0 left-0 right-0 z-10 h-auto sm:h-16 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      role="contentinfo"
    >
      {/* [!! 关键修改 !!] 
          - 恢复 'space-y-2' (用于移动端两行间距)
          - 保持 'justify-between' (全局两端对齐)
      */}
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-3 sm:py-0 sm:h-16 space-y-2 sm:space-y-0">
        {/* 左侧版权信息 (不变) */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {currentYear} {t('copyright')}
        </p>

        {/* 右侧链接 */}
        <nav className="flex items-center space-x-4">
          <Link
            href="/terms"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t('terms')}
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t('privacy')}
          </Link>
          {/* [!! 1. 捐赠链接 !!] (不变) */}
          <Link
            href="/donate"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t('donate')}
          </Link>
          {/* [!! 2. 更新日志 (不变) !!] */}
          <Link
            href="/changelog"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t('changelogLink')}
          </Link>
          {/* [!! 3. 新增: 意见反馈 !!] */}
          <button
            onClick={openFeedbackModal}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t('feedbackLink')}
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;