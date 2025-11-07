'use client';
/*
 * @Date: 2025-10-28 21:49:07
 * @LastEditTime: 2025-11-07 19:59:52
 * @Description: 网站顶部导航栏右侧的操作按钮集合 (已添加 SettingsButton)
 */

import React from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButtons from './AuthButtons';
import UserAvatar from './UserAvatar';
import { useAppContext } from '@/contexts/app.context';
import BookSelection from '../book-selection';

/**
 * @component VerticalDivider (不变)
 * @description
 * 一个小的内联组件，用于在按钮组之间创建一条微妙的垂直分隔线。
 * (在移动端 'sm:' 以下隐藏)
 */
const VerticalDivider: React.FC = () => {
  return (
    <div
      className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"
      aria-hidden="true" // 对屏幕阅读器隐藏，因为它纯粹是装饰性的
    />
  );
};

/**
 * @component HeaderActions (已修改)
 * @description
 * 负责渲染网站顶部导航栏右侧的所有交互按钮。
 */
const HeaderActions: React.FC = () => {
  // 从全局上下文中获取用户登录状态
  const { isLoggedIn } = useAppContext();

  // [!! 移除 !!] 此处不再需要 useState

  return (
    // [!! 移除 !!] 不再需要 React.Fragment
    <div className="flex items-center space-x-0.5 sm:space-x-1">
      {/* --- 应用设置组 --- */}

      {/* 1. 书籍选择按钮 (不变) */}
      <BookSelection />

      {/* 2. 语言切换按钮 (不变) */}
      <LanguageSwitcher />

      {/* 3. 主题切换按钮 (不变) */}
      <ThemeToggle />

      {/* --- 分隔线 (不变) --- */}
      <VerticalDivider />

      {/* --- 用户会话组 --- */}

      {/* 5. 根据登录状态条件渲染 (不变) */}
      {isLoggedIn ? (
        // 已登录：显示用户头像，点击可打开用户菜单
        <UserAvatar />
      ) : (
        // 未登录：显示登录按钮，点击可打开登录弹窗
        <AuthButtons />
      )}

      {/* [!! 移除 !!] SettingsDrawer 实例已移至 SettingsButton.tsx 内部 */}
    </div>
  );
};

export default HeaderActions;