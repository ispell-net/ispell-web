'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// [!! 修改 !!] 导入 useAppContext
import { useAppContext } from '@/contexts/app.context';
import { useTranslations } from 'next-intl';
import { Loader2, MessageSquareWarning } from 'lucide-react';

// 导入重构后的设置表单
import SettingsForm from '@/components/settings';
// 导入公共组件
import SectionCard from '@/components/common/SectionCard';
// [!! 移除 !!] 不再需要 FeedbackModal
// import FeedbackModal from '@/components/feedback';

/**
 * 系统设置页面
 * 参考 ProfilePage 布局，用于管理应用偏好设置
 */
export default function SettingsPage() {
  // [!! 修改 !!] 获取 openFeedbackModal
  const { user, isLoggedIn, isLoading, openFeedbackModal } = useAppContext();
  const router = useRouter();
  const t = useTranslations('Settings'); // 使用 'Settings' 命名空间

  // [!! 移除 !!] 移除了本地状态
  // const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // 身份验证保护 (与 ProfilePage 相同)
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
    }
  }, [isLoading, isLoggedIn, router]);

  // 加载状态显示 (与 ProfilePage 相同)
  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 页面标题 (参考 ProfilePage) */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('pageDescription')}
          </p>
        </div>

        {/* 设置卡片 (参考 ProfilePage) */}
        <div className="space-y-6 pb-16">
          {/* 第一个卡片：系统设置表单 */}
          <SectionCard title={t('sectionTitles.appSettings')}>
            {/* 从 'components/settings/index.tsx' 导入的 SettingsForm 
              (确保该文件已被重构，只导出表单)
            */}
            <SettingsForm />
          </SectionCard>

          {/* 第二个卡片：问题反馈 */}
          <SectionCard title={t('feedbackCardTitle')}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('feedbackCardDescription')}
              </p>
              <button
                onClick={openFeedbackModal} // [!! 修改 !!] 调用 Context 的方法
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <MessageSquareWarning className="w-4 h-4" />
                <span>{t('feedbackBtn')}</span>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
