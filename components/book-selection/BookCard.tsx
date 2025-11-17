/*
 * @Date: 2025-10-30 10:23:51
 * @LastEditTime: 2025-11-12 19:27:45
 * @Description: 书籍卡片组件 (移除所有固定高度，以 BrowserView (auto) 为准)
 */

import React from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Book } from '@/types/book.types';

interface BookCardProps {
  book: Book;
  isActive: boolean;
  onSelect: (book: Book) => void;
  /** CommunityView 下的自定义内容槽位 */
  children?: React.ReactNode; 
}

const BookCard: React.FC<BookCardProps> = ({ book, isActive, onSelect, children }) => {
  const t = useTranslations('BookSelection');

  const activeClasses = 'bg-gray-200 border-gray-400 dark:bg-gray-700 dark:border-gray-500';
  const defaultClasses = 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500';

  // [FIX] 移除所有固定高度。高度将由内容 (BrowserView 或 CommunityView) 决定。
  const cardHeightClass = ''; 

  // [FIX] 恢复 BrowserView 的默认布局 (非 h-full, 非 justify-between)
  // 这与您在第一个 prompt 中提供的原始 BookCard.tsx 逻辑一致
  const renderDefaultCardContent = () => (
    <>
      {/* 书籍名称 */}
      <p
        className={`font-medium leading-tight ${
          isActive
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-100'
        }`}
      >
        {book.name}
      </p>

      {/* 书籍描述 */}
      {book.description && (
        <p
          className={`text-xs mt-0.5 leading-snug ${
            isActive
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {book.description}
        </p>
      )}

      {/* 单词总数 */}
      <p
        className={`text-sm mt-1 ${ // 恢复 mt-1
          isActive
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {t('BookCard.totalWords', { count: book.totalWords })}
      </p>
    </>
  );

  return (
    <button
      onClick={() => onSelect(book)}
      className={`relative w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${cardHeightClass} ${
        isActive ? activeClasses : defaultClasses
      }`}
      role="radio"
      aria-checked={isActive}
    >
      {/* 现在，BrowserView (renderDefaultCardContent) 
        和 CommunityView (children) 
        都将使用自适应高度。
      */}
      {children ? children : renderDefaultCardContent()}
      
      {isActive && (
        <Check className="absolute top-3 right-3 w-5 h-5 text-gray-900 dark:text-gray-100 z-30" />
      )}
    </button>
  );
};

export default BookCard;