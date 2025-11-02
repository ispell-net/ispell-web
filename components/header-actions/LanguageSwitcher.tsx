'use client';
/*
 * @Date: 2025-10-28 21:48:34
 * @LastEditTime: 2025-11-02 22:32:09
 * @Description: 国际化 (i18n) 语言切换器组件 (已优化移动端显示)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLocale } from 'next-intl'; // Hook，用于获取当前语言环境
import { useRouter, usePathname } from '@/i18n/navigation'; // next-intl 提供的导航工具

/**
 * @constant languageOptions
 * @description
 * 定义了下拉菜单中所有可用的语言选项。
 * 这是一个静态配置数组。
 */
const languageOptions: { code: string; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
];

/**
 * @component LanguageSwitcher
 * @description
 * 渲染语言切换器按钮及其下拉菜单。
 * (移动端只显示图标，PC端显示图标+文字)
 */
const LanguageSwitcher: React.FC = () => {
  // --- Hooks ---
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // --- State and Ref ---
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  /**
   * Effect: 处理 "Escape" 键按下事件。
   */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  /**
   * Effect: 处理点击组件外部事件。
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // --- Handlers ---

  /**
   * @function handleChangeLanguage
   * @description 切换语言并关闭菜单
   */
  const handleChangeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // --- Derived Data ---
  const currentLanguage = languageOptions.find(
    (option) => option.code === locale
  );
  const currentLanguageName = currentLanguage
    ? currentLanguage.name
    : locale.toUpperCase();

  return (
    // 根元素，附加 ref 以便检测外部点击
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)} // 点击时切换 isOpen 状态
        aria-label="选择语言"
        // 按钮样式，与其他 header-actions 组件保持一致
        className="flex items-center p-2 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 list-none select-none"
      >
        <Globe className="w-5 h-5 sm:w-6 sm:h-6" />

        {/* --- 修改点 1 ---
         * 添加 'hidden sm:inline'
         * 'hidden': 默认 (移动端) 隐藏
         * 'sm:inline': 在 sm 断点及以上 (PC) 显示为 inline
         */}
        <span className="ml-1 text-sm hidden sm:inline">
          {currentLanguageName}
        </span>
      </button>

      {/* 下拉菜单：仅在 isOpen 为 true 时渲染 */}
      {isOpen && (
        /* --- 修改点 2 ---
         * 'w-48' -> 'w-56 sm:w-48'
         * 'w-56': 默认 (移动端) 宽度为 56 (14rem)，更宽易点
         * 'sm:w-48': 在 sm 断点及以上 (PC) 恢复为 48 (12rem)
         */
        <div className="absolute top-full right-0 mt-2 w-56 sm:w-48 z-20 origin-top-right">
          <ul className="py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            {/* 遍历 languageOptions 数组来创建菜单项 */}
            {languageOptions.map((option) => (
              <li key={option.code}>
                <button
                  onClick={() => handleChangeLanguage(option.code)}
                  className={`
                    flex items-center justify-between w-full px-4 py-2 text-left text-sm
                    ${
                      locale === option.code
                        ? 'font-bold text-gray-900 dark:text-white'
                        : 'font-medium text-gray-700 dark:text-gray-300'
                    }
                    hover:bg-gray-100 dark:hover:bg-gray-700
                  `}
                >
                  {/* 语言名称 */}
                  <span>{option.name}</span>

                  {/* 仅在当前语言旁边显示一个 Check (勾) 图标 */}
                  {locale === option.code && <Check className="w-4 h-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
