'use client';
/*
 * @Date: 2025-10-31 10:08:45
 * @LastEditTime: 2025-11-07 16:29:13
 * @Description: 捐赠 Banner (V5 - 使用 localStorage 实现每周显示一次)
 */
import React, { useState, useEffect } from 'react';
import { Gift, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

// [!! 1. 修改 !!] 存储键改为 localStorage key
const STORAGE_KEY = 'donateBannerClosedWeek'; // 存储用户点击关闭时的“周数”

/**
 * 获取自 Unix 纪元以来的周数
 * (这是一个简单、统一的计算方式，与时区无关)
 * @param date - The date timestamp (e.g., Date.now())
 * @returns {number} - The week number
 */
const getWeekNumber = (date: number): number => {
  const MSEC_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
  // (Date.now() / 毫秒数) -> 得到周数
  return Math.floor(date / MSEC_PER_WEEK);
};

const DonateBanner: React.FC = () => {
  const t = useTranslations('DonateBanner');
  // [!!] (保留 null 初始状态以防止 Hydration Error)
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  // [!! 2. 修改 !!] useEffect 逻辑，使用 localStorage 和周数计算
  useEffect(() => {
    try {
      // 1. 获取当前周数
      const currentWeek = getWeekNumber(Date.now());

      // 2. 获取用户上次关闭的周数
      const storedValue = localStorage.getItem(STORAGE_KEY);
      const closedWeek = parseInt(storedValue || '0', 10); // 默认为0

      // 3. 比较
      // 如果当前周数 > 上次关闭的周数，说明是新的一周，应该显示
      if (currentWeek > closedWeek) {
        setIsVisible(true);
      } else {
        // 否则 (currentWeek === closedWeek)，说明本周已经关闭过了，不显示
        setIsVisible(false);
      }
    } catch (e) {
      console.warn('Could not access localStorage for DonateBanner', e);
      setIsVisible(true); // 降级为默认显示
    }
  }, []); // 空依赖数组，仅在挂载时运行一次

  // [!! 3. 修改 !!] 关闭处理逻辑
  const handleClose = () => {
    try {
      // 1. 获取当前周数
      const currentWeek = getWeekNumber(Date.now());
      // 2. 将当前周数存入 localStorage，标记本周已关闭
      localStorage.setItem(STORAGE_KEY, currentWeek.toString());
    } catch (e) {
      console.warn('Could not set localStorage for DonateBanner', e);
    }
    setIsVisible(false); // 更新 state
  };

  // [!!] (保留渲染逻辑)
  if (isVisible === null || !isVisible) {
    return null;
  }

  return (
    // (所有样式保持不变: 移动端隐藏, 反色, i18n)
    <div className="hidden sm:block w-full bg-gray-900 dark:bg-gray-100 relative border-b border-gray-700 dark:border-gray-200">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <Gift
            // 颜色反转 (图标)
            className="w-4 h-4 text-white dark:text-gray-900 shrink-0"
          />

          <p
            // 颜色反转 (文字)
            className="text-center text-sm text-white dark:text-gray-900"
          >
            {t('text')}
          </p>

          <Link
            href="/donate"
            // 颜色反转 (链接)
            className="text-sm font-medium text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-600 transition-colors duration-200 flex items-center gap-1 underline underline-offset-2"
          >
            {t('link')}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </Link>
        </div>

        {/* 颜色反转 (关闭按钮) */}
        <button
          onClick={handleClose}
          aria-label={t('closeAriaLabel')}
          className="absolute top-1/2 right-4 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DonateBanner;