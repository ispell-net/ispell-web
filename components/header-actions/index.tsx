'use client';
/*
 * @Date: 2025-10-28 21:49:07
 * @LastEditTime: 2025-11-02 22:34:38
 * @Description: 网站顶部导航栏右侧的操作按钮集合 (已优化移动端间距)
 */

import React from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButtons from './AuthButtons';
import UserAvatar from './UserAvatar';
import { useAppContext } from '@/contexts/app.context';
import BookSelection from '../book-selection';

/**
 * @component VerticalDivider
 * @description
 * 一个小的内联组件，用于在按钮组之间创建一条微妙的垂直分隔线。
 * 它在视觉上将“应用设置”和“用户会话”区域分开。
 *
 * (在移动端 'sm:' 以下隐藏)
 *
 * @returns {React.ReactElement}
 */
const VerticalDivider: React.FC = () => {
  return (
    <div
      // --- 修改点 1 ---
      // 添加 'hidden sm:block'
      // 'hidden': 默认 (移动端) 隐藏
      // 'sm:block': 在 'sm' 断点及以上 (PC) 显示
      className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"
      aria-hidden="true" // 对屏幕阅读器隐藏，因为它纯粹是装饰性的
    />
  );
};

/**
 * @component HeaderActions
 * @description
 * 负责渲染网站顶部导航栏右侧的所有交互按钮。
 *
 * 渲染逻辑：
 * 1.  **应用设置组**：始终显示 `BookSelection` (书籍选择)、`LanguageSwitcher` (语言切换)
 * 和 `ThemeToggle` (主题切换)。
 * 2.  **分隔线**：(仅PC) 显示一条垂直线以区分功能区。
 * 3.  **用户会话组**：
 * - 如果用户已登录 (`isLoggedIn` 为 true)，则渲染 `UserAvatar` (用户头像菜单)。
 * - 如果用户未登录 (`isLoggedIn` 为 false)，则渲染 `AuthButtons` (登录按钮)。
 *
 * @returns {React.ReactElement}
 */
const HeaderActions: React.FC = () => {
  // 从全局上下文中获取用户登录状态
  const { isLoggedIn } = useAppContext();

  return (
    // --- 修改点 2 ---
    // 'space-x-2' -> 'space-x-1 sm:space-x-2'
    // 'space-x-1': 默认 (移动端) 间距为 4px
    // 'sm:space-x-2': 在 'sm' 断点及以上 (PC) 恢复为 8px
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* --- 应用设置组 --- */}

      {/* 1. 书籍选择按钮 (点击打开书架抽屉) */}
      <BookSelection />

      {/* 2. 语言切换按钮 (点击打开语言选择下拉菜单) */}
      <LanguageSwitcher />

      {/* 3. 主题切换按钮 (点击循环切换 亮/暗/系统 主题) */}
      <ThemeToggle />

      {/* --- 分隔线 (在移动端将自动隐藏) --- */}
      <VerticalDivider />

      {/* --- 用户会话组 --- */}

      {/* 4. 根据登录状态条件渲染 */}
      {isLoggedIn ? (
        // 已登录：显示用户头像，点击可打开用户菜单
        <UserAvatar />
      ) : (
        // 未登录：显示登录按钮，点击可打开登录弹窗
        <AuthButtons />
      )}
    </div>
  );
};

export default HeaderActions;
